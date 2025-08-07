import mongoose from "mongoose";

const appVersionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
      unique: true,
      default: 0,
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

// Pre-save middleware to auto-increment version number
appVersionSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastVersion = await this.constructor.findOne(
      {},
      {},
      { sort: { versionNumber: -1 } }
    );
    this.versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 0;
  }
  next();
});

export const AppVersion = mongoose.model("AppVersion", appVersionSchema);
