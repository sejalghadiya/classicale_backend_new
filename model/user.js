import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  //favorites: [{ type: String }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  chatList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }],
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
  lastName: {
    type: String,
  },
  NewLastName: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
  },
  NewGender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
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
  token: {
    type: String,
  },
  resetToken: { type: String },

  resetPasswordToken: { type: String },
  resetTokenExpiration: { type: Date },

  role: { type: String, default: "user" },
});

export const UserModel = mongoose.model("user", UserSchema);
