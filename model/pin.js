import mongoose from "mongoose";

const tableDataSchema = new mongoose.Schema({
  tableId: { type: Number, required: true },
  column2: { type: String },
  assignedCount: { type: Number, default: 0 },
});

export const TableData = mongoose.model("TableData", tableDataSchema);
