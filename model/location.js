import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  countryCode: { type: String, required: true },
  postalCode: { type: String, required: true },
  locationName: { type: String, required: true },
  state: { type: String, required: true },
  stateCode: { type: String, required: true },
  district: { type: String, required: true },
  subDistrictCode: { type: String, required: true },
  subDistrictName: { type: String, required: true },
});

export const LocationModel = mongoose.model("Location", LocationSchema);
