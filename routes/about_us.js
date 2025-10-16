import express from "express";
import {
  createAboutUs,
  getAboutUs,
  updateAboutUs,
} from "../controller/about_us.js";

const router = express.Router();

// Create About Us (Admin only)
router.post("/", createAboutUs);

// Get About Us information (Public)
router.get("/", getAboutUs);

// Update About Us (Admin only)
router.put("/", updateAboutUs);

export default router;
