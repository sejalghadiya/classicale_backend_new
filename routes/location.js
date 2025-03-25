// routes/locations.js

import express from "express";
import { getLocations } from "../controller/location.js"; // import controller

const router = express.Router();

// Route for fetching unique locations
router.get("/locations", getLocations);

export default router;
