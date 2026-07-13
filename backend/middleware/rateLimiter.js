import redisClient from "../config/redis.js";

export const ipRateLimiter = async (req, res, next) => {
  try {
    const key = `ratelimit:ip:${req.ip}`;
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, 60);
    if (count > 100) {
      return res.status(429).json({ success: false, message: "Too many requests. Slow down." });
    }
    next();
  } catch (err) {
    next();
  }
};

export const loginRateLimiter = async (req, res, next) => {
  try {
    const key = `ratelimit:ip:${req.ip}:login`;
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, 2 * 60);
    if (count > 5) {
      return res.status(429).json({ success: false, message: "Too many login attempts. Try again after 5 minutes." });
    }
    next();
  } catch (err) {
    next();
  }
};
