import express from "express";
import {
  createFeatureRequest,
  getAllFeatureRequests,
  getFeatureRequestById,
  updateFeatureRequest,
  deleteFeatureRequest,
} from "../controller/feedback.js";
import authenticateUser, { authenticateAdmin } from "../auth/middle.js";

const router = express.Router();

// Feature request routes
router.post("/", authenticateUser, createFeatureRequest);
router.get("/", getAllFeatureRequests);
router.get("/:id", getFeatureRequestById);
router.put("/feature-requests:id", updateFeatureRequest);
router.delete("/:id", deleteFeatureRequest);

// Admin feature request routes
router.get("/admin/list", authenticateAdmin, getAllFeatureRequests);
router.delete("/admin/:id", authenticateAdmin, deleteFeatureRequest);

export default router;
