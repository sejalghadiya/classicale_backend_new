import express from "express";
import {
  forgotPassword,
  verifyOTPAndResetPassword,
} from "../controller/sendOtp.js";

const router = express.Router();


router.post("/forgot-password", forgotPassword);
router.post("/reset-password", verifyOTPAndResetPassword);

export default router;
