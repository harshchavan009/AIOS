import asyncio
import time
import httpx


async def run_load_benchmark(total_requests: int = 50, concurrency: int = 10):
    url = "http://localhost:8000/healthz"
    print(f"🚀 Starting AIOS Load Benchmark: {total_requests} requests across {concurrency} concurrent workers...")

    start_time = time.time()
    successful = 0

    async with httpx.AsyncClient() as client:
        for _ in range(total_requests // concurrency):
            tasks = [client.get(url) for _ in range(concurrency)]
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            for res in responses:
                if isinstance(res, httpx.Response) and res.status_code == 200:
                    successful += 1

    elapsed = time.time() - start_time
    rps = successful / elapsed if elapsed > 0 else 0
    avg_latency = (elapsed / successful) * 1000 if successful > 0 else 0

    print(f"✅ Load Benchmark Results:")
    print(f"   • Successful Requests: {successful}/{total_requests}")
    print(f"   • Total Time: {elapsed:.2f} seconds")
    print(f"   • Requests Per Second (RPS): {rps:.2f}")
    print(f"   • Avg Request Latency: {avg_latency:.2f} ms")


if __name__ == "__main__":
    asyncio.run(run_load_benchmark())
