"""Offline teaching experiments. Standard library only; never contacts real services.

SQLite models durable records and local transactions, not every MySQL or distributed
system behavior. Run: python3 examples/engineering_checks.py
"""
from __future__ import annotations
import hashlib
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from typing import Any


class Conflict(ValueError):
    pass


class SimulatedCrash(RuntimeError):
    pass


def fingerprint(arguments: dict[str, Any]) -> str:
    raw = json.dumps(arguments, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class RemoteStore:
    """A simulated remote API with durable idempotency, not a real approval service."""
    def __init__(self, path: Path):
        self.db = sqlite3.connect(path)
        self.db.execute("CREATE TABLE IF NOT EXISTS effects (id INTEGER PRIMARY KEY, business_key TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL)")
        self.db.commit()

    def lookup(self, key: str, digest: str) -> str | None:
        row = self.db.execute("SELECT id, fingerprint FROM effects WHERE business_key=?", (key,)).fetchone()
        if row is None:
            return None
        if row[1] != digest:
            raise Conflict("Remote idempotency key reused with different arguments")
        return f"ticket-{row[0]}"

    def create(self, key: str, digest: str) -> str:
        with self.db:
            self.db.execute("INSERT OR IGNORE INTO effects(business_key, fingerprint) VALUES (?,?)", (key, digest))
        result = self.lookup(key, digest)
        assert result is not None
        return result

    def count(self) -> int:
        return self.db.execute("SELECT count(*) FROM effects").fetchone()[0]

    def close(self) -> None:
        self.db.close()


class DurableCall:
    """One recoverable action, not a full LLM runtime or distributed scheduler."""
    def __init__(self, path: Path, remote: RemoteStore):
        self.remote = remote
        self.db = sqlite3.connect(path)
        self.db.execute("CREATE TABLE IF NOT EXISTS calls (business_key TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, status TEXT NOT NULL, result TEXT)")
        self.db.commit()

    def execute(self, key: str, arguments: dict[str, Any], crash_after_remote: bool = False) -> str:
        digest = fingerprint(arguments)
        row = self.db.execute("SELECT fingerprint,status,result FROM calls WHERE business_key=?", (key,)).fetchone()
        if row and row[0] != digest:
            raise Conflict("Local idempotency key reused with different arguments")
        if row and row[1] == "SUCCEEDED":
            return row[2]
        with self.db:
            self.db.execute("INSERT OR IGNORE INTO calls VALUES (?,?, 'PREPARED', NULL)", (key, digest))
        # Query before retry. The mock has authoritative reads; a real API may not.
        result = self.remote.lookup(key, digest)
        if result is None:
            result = self.remote.create(key, digest)
        if crash_after_remote:
            raise SimulatedCrash("Remote succeeded, local result not saved")
        with self.db:
            self.db.execute("UPDATE calls SET status='SUCCEEDED', result=? WHERE business_key=? AND fingerprint=?", (result, key, digest))
        return result

    def close(self) -> None:
        self.db.close()


class Inventory:
    """One inventory-domain local transaction; no remote calls inside transactions."""
    def __init__(self):
        self.db = sqlite3.connect(":memory:")
        self.db.executescript("""
          CREATE TABLE stock (sku TEXT PRIMARY KEY, actual INTEGER NOT NULL, reserved INTEGER NOT NULL);
          CREATE TABLE reservation (business_key TEXT PRIMARY KEY, sku TEXT NOT NULL, qty INTEGER NOT NULL, status TEXT NOT NULL);
          INSERT INTO stock VALUES ('sku-1',10,0);
        """)

    def reserve(self, key: str, sku: str, qty: int) -> str:
        if isinstance(qty, bool) or not isinstance(qty, int) or qty <= 0:
            raise ValueError("qty must be a positive integer")
        with self.db:
            old = self.db.execute("SELECT sku,qty,status FROM reservation WHERE business_key=?", (key,)).fetchone()
            if old:
                if old[:2] != (sku, qty):
                    raise Conflict("Reservation arguments changed")
                return old[2]
            changed = self.db.execute("UPDATE stock SET reserved=reserved+? WHERE sku=? AND actual-reserved>=?", (qty, sku, qty)).rowcount
            if changed != 1:
                raise Conflict("Insufficient stock or unknown SKU")
            self.db.execute("INSERT INTO reservation VALUES (?,?,?,'RESERVED')", (key, sku, qty))
        return "RESERVED"

    def finish(self, key: str, target: str) -> str:
        if target not in {"RELEASED", "DEDUCTED"}:
            raise ValueError("Invalid terminal state")
        with self.db:
            row = self.db.execute("SELECT sku,qty,status FROM reservation WHERE business_key=?", (key,)).fetchone()
            if row is None:
                raise KeyError(key)
            sku, qty, state = row
            if state == target:
                return target
            changed = self.db.execute("UPDATE reservation SET status=? WHERE business_key=? AND status='RESERVED'", (target, key)).rowcount
            if changed != 1:
                raise Conflict(f"Cannot change {state} to {target}")
            deduction = qty if target == "DEDUCTED" else 0
            changed = self.db.execute("UPDATE stock SET reserved=reserved-?,actual=actual-? WHERE sku=? AND reserved>=? AND actual>=?", (qty, deduction, sku, qty, deduction)).rowcount
            if changed != 1:
                raise Conflict("Stock invariant failed; transaction is rolled back")
        return target

    def quantities(self) -> tuple[int, int]:
        return self.db.execute("SELECT actual,reserved FROM stock WHERE sku='sku-1'").fetchone()

    def close(self) -> None:
        self.db.close()


def evaluate(rows: list[dict[str, Any]], k: int = 3) -> dict[str, Any]:
    if type(k) is not int or k <= 0:
        raise ValueError("k must be a positive integer")
    ids: set[str] = set()
    recalls: list[float] = []
    reciprocal_ranks: list[float] = []
    abstentions: list[int] = []
    for row in rows:
        identifier = row.get("id")
        if not isinstance(identifier, str) or not identifier or identifier in ids:
            raise ValueError("Invalid or duplicate case ID")
        ids.add(identifier)
        relevant, retrieved = row.get("relevant"), row.get("retrieved")
        if not isinstance(relevant, list) or not isinstance(retrieved, list) or any(not isinstance(x, str) for x in relevant + retrieved):
            raise ValueError("Evidence IDs must be lists of strings")
        if type(row.get("abstained")) is not bool:
            raise ValueError("abstained must be boolean")
        truth = set(relevant)
        ranked = list(dict.fromkeys(retrieved))[:k]
        if truth:
            recalls.append(len(truth.intersection(ranked)) / len(truth))
            reciprocal_ranks.append(next((1.0 / rank for rank, x in enumerate(ranked, 1) if x in truth), 0.0))
        else:
            abstentions.append(int(row["abstained"]))
    def mean(values: list) -> float | None:
        return sum(values) / len(values) if values else None
    return {"cases": len(rows), "answerable": len(recalls), "unanswerable": len(abstentions),
            "recall_at_k": mean(recalls), "mrr_at_k": mean(reciprocal_ranks),
            "unanswerable_abstention_rate": mean(abstentions), "k": k,
            "note": "Synthetic fixture metrics, not a model benchmark"}


def load_cases() -> list[dict[str, Any]]:
    text = Path(__file__).with_name("eval-cases.jsonl").read_text(encoding="utf-8")
    return [json.loads(line) for line in text.splitlines() if line.strip()]


class EngineeringChecks(unittest.TestCase):
    def test_recover_after_remote_success(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            remote = RemoteStore(root / "remote.db")
            local = DurableCall(root / "local.db", remote)
            try:
                with self.assertRaises(SimulatedCrash):
                    local.execute("request-1", {"amount": 3}, crash_after_remote=True)
                self.assertEqual(remote.count(), 1)
                local.close()
                local = DurableCall(root / "local.db", remote)
                self.assertEqual(local.execute("request-1", {"amount": 3}), "ticket-1")
                self.assertEqual(local.execute("request-1", {"amount": 3}), "ticket-1")
                self.assertEqual(remote.count(), 1)
                with self.assertRaises(Conflict):
                    local.execute("request-1", {"amount": 4})
                self.assertEqual(remote.count(), 1)
            finally:
                local.close(); remote.close()

    def test_remote_duplicate_and_parameter_conflict(self):
        with tempfile.TemporaryDirectory() as directory:
            remote = RemoteStore(Path(directory) / "remote.db")
            try:
                first = remote.create("k", fingerprint({"v": 1}))
                self.assertEqual(remote.create("k", fingerprint({"v": 1})), first)
                with self.assertRaises(Conflict):
                    remote.create("k", fingerprint({"v": 2}))
                self.assertEqual(remote.count(), 1)
            finally:
                remote.close()

    def test_inventory_release_wins(self):
        inv = Inventory()
        try:
            self.assertEqual(inv.reserve("k", "sku-1", 3), "RESERVED")
            inv.reserve("k", "sku-1", 3)
            self.assertEqual(inv.quantities(), (10, 3))
            with self.assertRaises(Conflict): inv.reserve("k", "sku-1", 4)
            inv.finish("k", "RELEASED"); inv.finish("k", "RELEASED")
            with self.assertRaises(Conflict): inv.finish("k", "DEDUCTED")
            self.assertEqual(inv.quantities(), (10, 0))
        finally:
            inv.close()

    def test_inventory_deduction_wins(self):
        inv = Inventory()
        try:
            inv.reserve("k", "sku-1", 3)
            inv.finish("k", "DEDUCTED"); inv.finish("k", "DEDUCTED")
            with self.assertRaises(Conflict): inv.finish("k", "RELEASED")
            self.assertEqual(inv.quantities(), (7, 0))
        finally:
            inv.close()

    def test_inventory_failure_is_atomic(self):
        inv = Inventory()
        try:
            with self.assertRaises(Conflict): inv.reserve("too-big", "sku-1", 11)
            with self.assertRaises(ValueError): inv.reserve("zero", "sku-1", 0)
            self.assertEqual(inv.quantities(), (10, 0))
            self.assertEqual(inv.db.execute("SELECT count(*) FROM reservation").fetchone()[0], 0)
        finally:
            inv.close()

    def test_late_cache_fill(self):
        database = {"value": "v1"}; cache: dict[str, str] = {}
        delayed_read = database["value"]
        database["value"] = "v2"
        cache.pop("value", None)
        cache["value"] = delayed_read
        self.assertEqual(cache["value"], "v1")
        self.assertNotEqual(cache["value"], database["value"])

    def test_metrics(self):
        result = evaluate(load_cases())
        self.assertEqual(result["answerable"], 4)
        self.assertEqual(result["unanswerable"], 2)
        self.assertAlmostEqual(result["recall_at_k"], 0.625)
        self.assertAlmostEqual(result["mrr_at_k"], 0.625)
        self.assertAlmostEqual(result["unanswerable_abstention_rate"], 0.5)

    def test_metric_duplicates_and_empty_denominator(self):
        rows = [{"id": "x", "relevant": ["A"], "retrieved": ["A", "A"], "abstained": False}]
        self.assertEqual(evaluate(rows)["recall_at_k"], 1.0)
        self.assertIsNone(evaluate(rows)["unanswerable_abstention_rate"])
        self.assertIsNone(evaluate([])["recall_at_k"])
        with self.assertRaises(ValueError): evaluate(rows + rows)
        with self.assertRaises(ValueError): evaluate(rows, 0)
        with self.assertRaises(ValueError): evaluate([{**rows[0], "abstained": "false"}])


if __name__ == "__main__":
    print(json.dumps(evaluate(load_cases()), ensure_ascii=False, indent=2))
    unittest.main(verbosity=2)
