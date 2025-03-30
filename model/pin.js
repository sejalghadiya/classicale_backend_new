import mongoose from "mongoose";

const tableDataSchema = new mongoose.Schema({
  code: { type: String },
  use_count: { type: Number },
  max_count:{type:Number,default:100}
});

export const TableData = mongoose.model("code", tableDataSchema);
