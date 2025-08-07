import express from "express";
import {
  createAppVersion,
  getAllVersions,
  getLatestVersion,
  getVersionById,
  updateVersion,
  deleteVersion,
} from "../controller/app_version.js";

const router = express.Router();

// Create new app version
router.post("/", createAppVersion);

// Get all versions
router.get("/all", getAllVersions);

// Get latest version
router.get("/latest", getLatestVersion);

// Get specific version
router.get("/:id", getVersionById);

// Update version
router.put("/:id", updateVersion);

// Delete version
router.delete("/:id", deleteVersion);

export default router;
