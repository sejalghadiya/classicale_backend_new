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
  getAllProducts,
  getProductById,
  addOtherProduct,
  getProductByCategory,
  getProductsByUser,
  deleteProduct,
  deleteProductImage,
  toggleProductVisibility,
  getProductType,
  getSubProductType,
  filterProduct,
  getProductTypesWithSubCategories,
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
//router.delete("/deleteProduct", authenticateUser, softDeleteProduct);
router.get("/getProduct", showUserAddProduct);
router.put("/update", updateProduct);
router.post("/favorites", addFavoriteProduct);
router.get("/getFavoriteProduct/:userId", getFavoriteProducts);
router.post("/add-other-product", addOtherProduct);

router.post("/add", addProduct);

router.get("/get-product", getAllProducts);
router.get("/get-product-by-id", getProductById);
router.get("/get-product-by-category", getProductByCategory);
router.get("/get-product-by-userId", getProductsByUser);

router.delete("/softDelete/:productId/:productType", deleteProduct);
router.delete("/delete-product-image", deleteProductImage);
router.post("/product-active-inactive", toggleProductVisibility);
router.get("/get-product-type", getProductType);
router.get("/get-product-sub-type-by-id/:productSubTypeId", getSubProductType);
router.get(
  "/get-get-product-types-with-sub-categories",
  getProductTypesWithSubCategories
);

router.get("/filter", filterProduct);
export default router;
