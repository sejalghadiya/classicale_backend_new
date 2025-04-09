import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    favorite: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "favorite.modelName", // Dynamic reference based on modelName
        },
        modelName: {
          type: String,
        },
      },
    ],

    uuid: { type: String, default: null },
    token: { type: String, default: null },
    read: { type: [String] },
    write: { type: [String] },
    phone: { type: [String] },
    assignedPins: { type: String },
    fName: { type: [String] },
    lName: { type: [String] },
    mName: { type: [String] },
    email: { type: String },
    password: { type: String },
    gender: { type: [String] },
    DOB: { type: [String] },
    occupationId: { type: mongoose.Schema.Types.ObjectId, ref: "Occupation" },
    // occupationId: { type: String },
    state: { type: [String] },
    district: { type: [String] },
    country: { type: String },
    area: { type: [String] },
    profileImage: { type: [String] },
    aadhaarCardImage1: { type: [String] },
    aadhaarCardImage2: { type: [String] },
    aadharNumber: { type: [String] },
    role: { type: String, enum: ["admin", "user"] },
    userCategory: { type: String, enum: ["A", "B"] },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isPinVerified: { type: Boolean, default: false },
    isOtpVerified: { type: Boolean, default: false },
    oneTimePin: { type: String },
    otp: { type: String },
    otpExpire: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("user", UserSchema);
