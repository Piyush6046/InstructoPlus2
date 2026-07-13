import redisClient from "../config/redis.js";

export const cacheMiddleware = (cacheKey, ttlSeconds = 300) => {
  return async (req, res, next) => {
    const key = typeof cacheKey === "function" ? cacheKey(req) : cacheKey;

    const cached = await redisClient.get(key);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(JSON.parse(cached));
    }

    res.setHeader("X-Cache", "MISS");

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        redisClient.setex(key, ttlSeconds, JSON.stringify(body));
      }
      return originalJson(body);
    };

    next();
  };
};

export const invalidateCache = async (...keys) => {
  await Promise.all(keys.map((k) => redisClient.del(k)));
};
