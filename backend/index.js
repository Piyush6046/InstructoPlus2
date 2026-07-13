import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/connectdb.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import courseRouter from "./routes/course.route.js";
import paymentRouter from "./routes/payment.route.js";
import reviewRouter from "./routes/reviewRoute.js";
import announcementRouter from "./routes/announcement.route.js";
import notificationRouter from "./routes/notification.route.js";
import progressRouter from "./routes/progress.route.js";
import { ipRateLimiter } from "./middleware/rateLimiter.js";
import "./workers/emailWorker.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(ipRateLimiter);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/course", courseRouter);
app.use('/api/payment', paymentRouter);
app.use("/api/review", reviewRouter);
app.use("/api", announcementRouter);
app.use("/api", notificationRouter);
app.use("/api/progress", progressRouter);

app.get("/", (req, res) => {
  res.send("Hello from backend");
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
  connectDb();
});
