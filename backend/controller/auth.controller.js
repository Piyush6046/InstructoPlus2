import User from '../model/user.Model.js'
import validator from "validator"
import genToken from "../config/token.js"
import cookieParser from 'cookie-parser'
import bcrypt from "bcryptjs"
import redisClient from "../config/redis.js"
import { addEmailJob } from "../queues/emailQueue.js"
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const isVerified = await redisClient.get(`otp_verified:${email}`);
    if (!isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify OTP first.",
      });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 5 characters long",
      });
    }
    let hashPassword = await bcrypt.hash(password, 10);
    let user = await User.create({
      name,
      email,
      password: hashPassword,
      role,
    });
    await redisClient.del(`otp_verified:${email}`);
    let token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while signing up",
    });
  }
};

export const login=async(req,res)=>{
  try {
    const {email,password}=req.body
    let user=await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found"
      })
    }
    let isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
      return res.status(400).json({
        success:false,
        message:"Invalid credentials"
      })
    }
    let token=await genToken(user._id);
    res.cookie("token",token,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge:7*24*60*60*1000
    })
    res.status(200).json({
      success:true,
      message:"User logged in successfully",
      user,
      token
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"error while login",
      error
    })
  }
}

export const logout=async(req,res)=>{
  try {
    await res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.status(200).json({
      success:true,
      message:"User logged out successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"error while logout",
    })
  }
}

export const sendOTP= async (req, res) => {
  try {
    const {email}=req.body
    const user=await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found"
      })
    }
    const otp= Math.floor(1000+Math.random()*9000).toString();
    await redisClient.setex(`otp:${email}`, 5 * 60, otp);
    await redisClient.del(`otp_verified:${email}`);
    await addEmailJob(email, otp);
    return res.status(200).json({
      success:true,
      message:"OTP sent successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"error while sending otp",
      error
    })
  }
}

export const sendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await redisClient.setex(`otp:${email}`, 5 * 60, otp);
    await redisClient.del(`otp_verified:${email}`);
    await addEmailJob(email, otp, "signup");
    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error sending OTP", error });
  }
};

export const verifyOTP=async(req,res)=>{
  try {
    const {email,otp}=req.body
    const storedOtp = await redisClient.get(`otp:${email}`);
    if(!storedOtp){
      return res.status(400).json({
        success:false,
        message:"OTP expired or not found"
      })
    }
    if(storedOtp !== otp){
      return res.status(400).json({
        success:false,
        message:"Invalid OTP"
      })
    }
    await redisClient.del(`otp:${email}`);
    await redisClient.setex(`otp_verified:${email}`, 10 * 60, 'true');
    return res.status(200).json({
      success:true,
      message:"OTP verified successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"error while verifying otp",
      error
    })
  }
}

export const resetPassword =async(req,res)=>{
  try {
    const {email,password}=req.body
    const isVerified = await redisClient.get(`otp_verified:${email}`);
    if(!isVerified){
      return res.status(400).json({
        success:false,
        message:"OTP not verified or session expired"
      })
    }
    const user=await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found"
      })
    }
    let hashPassword=await bcrypt.hash(password,10)
    user.password=hashPassword
    await user.save()
    await redisClient.del(`otp_verified:${email}`);
    return res.status(200).json({
      success:true,
      message:"Password reset successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"error while resetting password",
      error
    })
  }
}

export const googleAuth = async (req, res) => {
  try {
    const { name, email, role, photo } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, role, password: "defaultPassword", photoUrl: photo });
    }
    let token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Authenticated successfully",
      user,
      token,
    });
  } catch (error) {
    console.log('auth error server side', error);
    return res.status(500).json({
      success: false,
      message: "error while google auth",
      error,
    });
  }
}
