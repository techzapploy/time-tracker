import { Redis } from "ioredis";

export interface CheckResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

export async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();
  const name = "redis";

  const redisHost = process.env.REDIS_HOST || process.env.SERVICE_REDIS_HOST;
  const redisUrl = process.env.REDIS_URL;

  if (!redisHost && !redisUrl) {
    return {
      name,
      status: "skipped",
      message: "REDIS_HOST and REDIS_URL are not set",
      durationMs: Date.now() - start,
    };
  }

  let client: Redis | null = null;
  try {
    if (redisUrl) {
      client = new Redis(redisUrl, { lazyConnect: true, connectTimeout: 10000, maxRetriesPerRequest: 1 });
    } else {
      const port = parseInt(process.env.REDIS_PORT || process.env.SERVICE_REDIS_PORT || "6379", 10);
      client = new Redis({
        host: redisHost!,
        port,
        lazyConnect: true,
        connectTimeout: 10000,
        maxRetriesPerRequest: 1,
      });
    }

    await client.connect();
    const pong = await client.ping();
    if (pong === "PONG") {
      return {
        name,
        status: "passed",
        message: `Connected to Redis successfully (${redisUrl || redisHost})`,
        durationMs: Date.now() - start,
      };
    }
    return {
      name,
      status: "failed",
      message: `Unexpected PING response: ${pong}`,
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      status: "failed",
      message: `Redis connection failed: ${message}`,
      durationMs: Date.now() - start,
    };
  } finally {
    if (client) {
      client.disconnect();
    }
  }
}
