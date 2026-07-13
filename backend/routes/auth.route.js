import express from "express";
import { signup, login, logout, sendOTP, sendSignupOTP, verifyOTP, resetPassword, googleAuth } from "../controller/auth.controller.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import { otpRateLimiter } from "../middleware/otpRateLimiter.js";

const router = express.Router();

router.post("/signup", loginRateLimiter, signup);
router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);
router.post("/signup-otp", otpRateLimiter, sendSignupOTP);
router.post("/sendotp", otpRateLimiter, sendOTP);
router.post('/verifyotp', verifyOTP);
router.post('/resetpassword', resetPassword);
router.post('/googleauth/', googleAuth);

export default router;