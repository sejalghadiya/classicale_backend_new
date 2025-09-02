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
  trackProductView,
} from "../controller/product.js";
import { authenticateAdmin, authenticateUser } from "../auth/middle.js";
// In routes or other files
//import { protect, admin } from '../auth/productAuth.js';

const router = express.Router();

router.get("/get", authenticateUser,searchProduct);
router.get("/showProduct", authenticateUser, showProduct);
router.get("/getProduct", authenticateUser,showUserAddProduct);
router.put("/update", authenticateUser, updateProduct);
router.post("/favorites", authenticateUser, addFavoriteProduct);
router.get(
  "/getFavoriteProduct/:userId",
  authenticateUser,
  getFavoriteProducts
);
router.post("/add-other-product", authenticateUser, addOtherProduct);

router.post("/add", authenticateUser, addProduct);

router.get("/get-product", authenticateUser, getAllProducts);
router.get("/get-product-by-id", authenticateUser, getProductById);
router.get("/get-product-by-category", authenticateUser, getProductByCategory);
router.get("/get-product-by-userId", authenticateUser, getProductsByUser);

router.delete(
  "/softDelete/:productId/:productType",
  authenticateUser,
  deleteProduct
);
router.delete("/delete-product-image", authenticateUser, deleteProductImage);
router.post(
  "/product-active-inactive",
  // authenticateAdmin,
  toggleProductVisibility
);
router.get("/get-product-type", authenticateUser, getProductType);
router.get(
  "/get-product-sub-type-by-id/:productSubTypeId",
  getSubProductType
);
router.get(
  "/get-get-product-types-with-sub-categories",
  getProductTypesWithSubCategories
);

router.post("/track-product-view", authenticateUser, trackProductView);
router.get("/filter", filterProduct);
export default router;
