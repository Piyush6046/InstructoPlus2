import { Queue } from "bullmq";
import redisClient from "../config/redis.js";

const emailQueue = new Queue("email-queue", { connection: redisClient });

export const addEmailJob = async (to, otp, type = "reset") => {
  await emailQueue.add("send-otp", { to, otp, type });
};

export default emailQueue;
