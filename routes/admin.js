import express from "express";
import {
  adminLogin,
  deleteProduct,
  getProductById,
  getProductType,
  getProductWithType,
  getUserByUserCategory,
  updateProduct
} from "../controller/admin.js";

import multer from "multer";

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Admin login route
router.post("/login", adminLogin);

router.get("/get_productS_Type", getProductType);

router.get("/get_product_with_type", getProductWithType);

router.get("/get_user_by_userCategory", getUserByUserCategory);

router.get("/get_product", getProductById);

router.put("/update_product_for_admin", updateProduct);

router.delete("/delete_product_by_admin", deleteProduct);
export default router;
