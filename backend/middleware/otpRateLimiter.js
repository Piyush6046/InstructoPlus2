import redisClient from "../config/redis.js";

export const otpRateLimiter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next();

    const key = `ratelimit:otp:${email}`;
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, 10 * 60);
    if (count > 3) {
      return res.status(429).json({ success: false, message: "OTP limit exceeded. Try again in 10 minutes." });
    }
    next();
  } catch (err) {
    next();
  }
};
