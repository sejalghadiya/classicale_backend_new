import express from "express";
import {
  adminLogin,
  deleteProduct,
  deleteUser,
  getAllConversation,
  getFavoriteProduct,
  getUser,
  getUserChats,
  getUserProducts,
  updateProduct,
} from "../controller/admin.js";
import { getAllProducts } from "../controller/admin.js"; // Import the login function
import { authenticateToken, admin } from "../auth/admin.js";
import multer from "multer";

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Admin login route
router.post("/login", adminLogin);
router.get("/allProductShow", authenticateToken, admin, getAllProducts);
router.get("/getCon", authenticateToken, admin, getAllConversation);
router.put(
  "/updateProduct",
  authenticateToken,
  admin,
  upload.single("image"),
  updateProduct
);
router.delete("/deleted", authenticateToken, admin, deleteProduct);
router.get("/getUser", authenticateToken, admin, getUser);
router.post("/userAddProduct", getUserProducts);
router.get("/getUserChats", authenticateToken, admin, getUserChats);
router.get("/getFavorites", authenticateToken, admin, getFavoriteProduct);
router.delete("/deleteUser", authenticateToken, admin, deleteUser);

export default router;
