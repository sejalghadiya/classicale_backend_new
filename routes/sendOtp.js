import express from "express";
import {
  forgotPassword, changePassword, verifyOTP,
} from "../controller/sendOtp.js";

const router = express.Router();


router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOTP);

router.post("/change-password", changePassword);

//router.post("/reset-password", verifyOTPAndResetPassword);

export default router;
