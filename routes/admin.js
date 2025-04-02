import express from "express";
import {
  addProductType,
  addSubProductType,
  adminLogin,
  adminVerifyUser,
  deleteProduct,
  deleteUser,
  getAllConversation,
  getDeletedMessages,
  getFavoriteProduct,
  getProductTypes,
  getSubProductTypes,
  getUser,
  getUserChats,
  getUserProducts,
  updateProduct,addCode,
  assignCodeToUser
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
router.delete("/deletedMessages", authenticateToken, admin, getDeletedMessages);
router.post("/verifyUser", adminVerifyUser);


router.post("/addProductTypes", addProductType);
router.post("/addSubProductTypes", addSubProductType);

router.get("/getProductType", getProductTypes),
router.get("/getSubProduct", getSubProductTypes),
router.post("/add-code", addCode)

router.post("/assign-code-to-user", assignCodeToUser);
export default router;
