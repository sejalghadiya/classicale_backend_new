import mongoose from "mongoose";

const appVersionSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d+\.\d+$/.test(v); // Validates format like "1.0", "1.1", etc.
        },
        message: (props) =>
          `${props.value} is not a valid version number! Use format like "1.0", "1.1", etc.`,
      },
    },
    versionName: {
      type: String,
      required: true,
      unique: true,
    },
    releaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    apkLink: {
      type: String,
      required: true,
    },
    changes: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AppVersion = mongoose.model("AppVersion", appVersionSchema);
