import express from "express";
import { upload } from "../auth/image.js"; // Default import

import {
  addFavoriteProduct,
  addProduct,
  showProduct,
  updateProduct,
  getFavoriteProducts,
  softDeleteProduct,
  showUserAddProduct,
} from "../controller/product.js";
import { authenticateUser } from "../auth/middle.js";
// In routes or other files
//import { protect, admin } from '../auth/productAuth.js';

const router = express.Router();
//const memoryStorage = multer.memoryStorage();
//const upload = multer({ storage: memoryStorage });

router.post(
  "/products/add",
  authenticateUser,
  upload.array("images", 12),
  addProduct
);

router.get("/showProduct", showProduct);
router.delete("/deleteProduct", authenticateUser, softDeleteProduct);
router.get("/getProduct", showUserAddProduct);
router.put("/update", authenticateUser, updateProduct);
router.post("/favorites", authenticateUser, addFavoriteProduct);
router.get("/getFavoriteProduct", authenticateUser, getFavoriteProducts);
export default router;
