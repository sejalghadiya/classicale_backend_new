import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  Country_Code: { type: String, required: true },

  Postal_Code: { type: String, required: true },
  Location_Name: { type: String, required: true },
  State: { type: String, required: true },

  State_Code: { type: String, required: true },

  District: { type: String, required: true },

  Sub_district_Code: { type: String, required: true },
  Sub_district_Name: { type: String, required: true },
});

export const LocationModel = mongoose.model("location", LocationSchema);
