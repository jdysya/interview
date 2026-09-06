"""Run only the self-contained examples in the source-grounded rewrite.

This checks executable examples and JSON syntax/consistency, not factual truth,
JSON Schema conformance, MCP interoperability or real model quality.
"""
from __future__ import annotations

import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def blocks(relative_path: str, language: str) -> list[str]:
    text = (ROOT / relative_path).read_text(encoding="utf-8")
    return re.findall(r"^```" + re.escape(language) + r"\n(.*?)\n```", text, re.M | re.S)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="wiki-source-examples-") as temp:
        directory = Path(temp)
        python_examples = blocks("docs/ai/rag-lab.md", "python")
        require(len(python_examples) == 1, "Expected one complete RRF example")
        rrf = directory / "rrf_example.py"
        rrf.write_text(python_examples[0] + "\n", encoding="utf-8")
        subprocess.run([sys.executable, str(rrf)], check=True, timeout=10)
        print("PASS: published RRF ranking, duplicate and empty-list examples")

        java_examples = [code for code in blocks("docs/backend/jmm-threadpool.md", "java")
                         if "public class RejectedFutureDemo" in code]
        require(len(java_examples) == 1, "Expected one complete Future rejection example")
        java = directory / "RejectedFutureDemo.java"
        java.write_text(java_examples[0] + "\n", encoding="utf-8")
        subprocess.run(["java", "-Dfile.encoding=UTF-8", str(java)], check=True, timeout=30)

    tool_examples = [json.loads(code) for code in blocks("docs/agent/tool-contracts.md", "json")]
    require(len(tool_examples) == 2, "Expected a tool definition and result fragment")
    definition, result = tool_examples
    require(definition["name"] == "search_documents", "Unexpected tool example")
    require(result["resultType"] == "complete" and result["isError"] is False,
            "Expected a complete successful result fragment")
    require(json.loads(result["content"][0]["text"]) == result["structuredContent"],
            "Text and structured result examples disagree")
    print("PASS: JSON fragments parse and text/structured payloads match (not an MCP integration test)")


if __name__ == "__main__":
    main()
