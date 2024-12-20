import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isExpired: { type: Boolean, default: false },
});

// Delete expired OTPs automatically after expiration
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTPModel = mongoose.model("OTPModel", OTPSchema);
//export const UserModel = mongoose.model("User", userSchema);
