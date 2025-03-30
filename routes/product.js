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
  searchProduct,
} from "../controller/product.js";
import { authenticateUser } from "../auth/middle.js";
// In routes or other files
//import { protect, admin } from '../auth/productAuth.js';

const router = express.Router();
//const memoryStorage = multer.memoryStorage();
//const upload = multer({ storage: memoryStorage });

//router.post("/add", authenticateUser, upload.array("images",5), addProduct);
// router.post(
//   "/add",
//   upload.fields([
//     { name: "images", maxCount: 5 },
//     { name: "pdfResume", maxCount: 1 },
//   ]),
//   addProduct
// );

router.get("/get", searchProduct);
router.get("/showProduct", showProduct);
router.delete("/deleteProduct", authenticateUser, softDeleteProduct);
router.get("/getProduct", showUserAddProduct);
router.put("/update", authenticateUser, updateProduct);
router.post("/favorites", authenticateUser, addFavoriteProduct);
router.get("/getFavoriteProduct", authenticateUser, getFavoriteProducts);

router.post(
  "/add",
  upload.fields([{ name: "images", maxCount: 5 }]),
  addProduct
);
export default router;
