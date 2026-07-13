import { Worker } from "bullmq";
import redisClient from "../config/redis.js";
import sendMail from "../config/Mail.js";
import { sendSignupMail } from "../config/Mail.js";

new Worker(
  "email-queue",
  async (job) => {
    const { to, otp, type } = job.data;
    if (type === "signup") {
      await sendSignupMail(to, otp);
    } else {
      await sendMail(to, otp);
    }
  },
  { connection: redisClient }
);
