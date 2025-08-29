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
router.post("/feature-requests", authenticateUser, createFeatureRequest);
router.get("/feature-requests", getAllFeatureRequests);
router.get("/feature-requests/:id", getFeatureRequestById);
router.put("/feature-requests/:id", updateFeatureRequest);
router.delete("/feature-requests/:id", deleteFeatureRequest);

// Admin feature request routes
router.get(
    "/admin/feature-requests",
    authenticateAdmin,
  getAllFeatureRequests
);
router.delete(
    "/admin/feature-requests/:id",
    authenticateAdmin,
  deleteFeatureRequest
);

export default router;
