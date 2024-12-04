import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  //favorites: [{ type: String }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  chatList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }],
  fcmToken: {
    type: String,
    required: false,
  },
  aadhaarFrontImage: { type: String },
  aadhaarBackImage: { type: String },
  userId: {
    type: Number,
    unique: true,
  },
  firstName: {
    type: String,
  },
  NewFirstName: {
    type: String,
  },
  middleName: {
    type: String,
  },
  NewMiddleName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  NewLastName: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "RATHER NOT TO SAY"],
  },
  NewGender: {
    type: String,
    enum: ["MALE", "FEMALE", "RATHER NOT TO SAY"],
  },
  dateOfBirth: {
    type: String,
  },
  NewDateOfBirth: {
    type: String,
  },
  password: {
    type: String,
  },
  countryCode: {
    type: String,
  },
  phone: {
    type: String,
  },
  NewPhone: {
    type: String,
  },
  Location: {
    type: String,
  },
  NewLocation: {
    type: String,
  },
  occupation: {
    type: String,
  },
  otherOccupation: {
    type: String,
  },

  NewOccupation: {
    type: String,
  },
  email: {
    type: String,
  },
  NewEmail: {
    type: String,
  },
  image: {
    type: String,
  },
  NewImage: {
    type: String,
  },
  both: {
    type: String,
  },
  city: { type: String },
  country: { type: String },
  NewBoth: {
    type: String,
  },
  profileImage: { type: String }, // Store base64 profile image
  proofFrontImage: { type: String }, // Store base64 proof image
  proofBackImage: { type: String },
  token: {
    type: String,
  },
  resetToken: { type: String },

  resetPasswordToken: { type: String },
  resetTokenExpiration: { type: Date },

  role: { type: String, default: "user" },
});

export const UserModel = mongoose.model("user", UserSchema);
