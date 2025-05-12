import express from "express";
import {

  adminLogin,
 
  getProductType,
  getProductWithType
} from "../controller/admin.js";

import multer from "multer";

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Admin login route
router.post("/login", adminLogin);

router.get("/get_productS_Type", getProductType);

router.get("/get_product_with_type", getProductWithType );
export default router;
