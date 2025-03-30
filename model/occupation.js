import mongoose from "mongoose";

const occupationSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

export const OccupationModel = mongoose.model("occupation", occupationSchema);

