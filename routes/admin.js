import express from "express";
import {
  adminLogin,
  deleteProduct,
  deleteUser,
  getAccesCode,
  getAllProductByCategory,
  getAllUser,
  getProductById,
  getProductType,
  getProductWithType,
  getReportCount,
  getReportDetailsById,
  getReportedProducts,
  getUserByUserCategory,
  getUserCategory,
  productActiveOrInactive,
  sendOtpToCategoryB,
  sendPinAccess,
  updateProduct,
  userAccess,
  userActiveOrInactive,
} from "../controller/admin.js";

import multer from "multer";
import { getProductByCategory } from "../controller/product.js";

const router = express.Router();

const memoryStorage = multer.memoryStorage();


// Admin login route
router.post("/login", adminLogin);

router.get("/get_productS_Type", getProductType);

router.get("/get_product_with_type", getProductWithType);

router.get("/get_user_by_userCategory", getUserByUserCategory);

router.get("/get_product", getProductById);

router.put("/update_product_for_admin", updateProduct);

router.delete("/delete_product_by_admin", deleteProduct);

router.get("/get_user_category", getUserCategory);

router.delete("/delete_user_by_admin", deleteUser);

router.get("/get_all_user", getAllUser);

router.get("/get-access-codes", getAccesCode);

router.post("/access_pin", sendPinAccess);

router.post("/access_otp", sendOtpToCategoryB);

router.post("/user-access", userAccess);

router.post("/user_active_inActive", userActiveOrInactive);

router.get("/report_product", getReportedProducts);

router.get("/get_report_product_by_id", getReportDetailsById);

router.get("/get_report_count", getReportCount);

router.get("/get_product_by_category", getAllProductByCategory);
//router.get("/product_active_inactive", productActiveOrInactive);
export default router;
