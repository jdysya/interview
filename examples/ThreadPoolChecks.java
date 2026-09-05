import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/** Deterministic teaching test: core worker, queue, expansion, rejection. */
public class ThreadPoolChecks {
    public static void main(String[] args) throws Exception {
        var pool = new ThreadPoolExecutor(1, 2, 30, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(1), new ThreadPoolExecutor.AbortPolicy());
        var firstStarted = new CountDownLatch(1);
        var twoStarted = new CountDownLatch(2);
        var release = new CountDownLatch(1);
        var completed = new AtomicInteger();
        Runnable blocking = () -> {
            firstStarted.countDown(); twoStarted.countDown();
            try { release.await(); completed.incrementAndGet(); }
            catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        };
        try {
            pool.execute(blocking);
            if (!firstStarted.await(5, TimeUnit.SECONDS)) throw new AssertionError("First worker did not start");
            pool.execute(blocking); // bounded queue
            if (pool.getQueue().size() != 1) throw new AssertionError("Second task must queue");
            pool.execute(blocking); // queue full => second worker
            if (!twoStarted.await(5, TimeUnit.SECONDS)) throw new AssertionError("Pool did not expand");
            boolean rejected = false;
            try { pool.execute(blocking); } catch (RejectedExecutionException expected) { rejected = true; }
            if (!rejected) throw new AssertionError("Fourth task must be rejected");
            release.countDown(); pool.shutdown();
            if (!pool.awaitTermination(5, TimeUnit.SECONDS)) throw new AssertionError("Pool did not stop");
            if (completed.get() != 3) throw new AssertionError("Exactly three accepted tasks must finish");
            System.out.println("ThreadPoolChecks: core -> queue -> expand -> reject passed");
        } finally {
            release.countDown(); pool.shutdownNow();
        }
    }
}
