import Redis from "ioredis";

// Use REDIS_URL for production (Upstash via rediss://)
// Fallback to host/port/password for local development
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    })
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

redisClient.on("connect", () => {
  console.log("✅ Redis connected:", process.env.REDIS_URL ? "Upstash (cloud)" : `localhost:${process.env.REDIS_PORT || 6379}`);
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

redisClient.on("reconnecting", () => {
  console.warn("🔄 Redis reconnecting...");
});

export default redisClient;
