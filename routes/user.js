import express from "express";
import multer from "multer";
import {
  userSignUp,
  updateUser,
  userLogin,
  deleteUser,
  resetPassword,
  requestPasswordReset,
} from "../controller/user.js";
import authenticateUser from "../auth/middle.js";

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({ storage });

export const uploadMiddleware = upload.fields([
  { name: "image", maxCount: 1 }, // Profile image
  { name: "aadhaarFrontImage", maxCount: 1 },
  { name: "aadhaarBackImage", maxCount: 1 }, // Aadhaar/proof image
]);
router.post("/signup", uploadMiddleware, userSignUp);

router.post("/login", userLogin);

router.post("/requestPassword", requestPasswordReset);

router.post("/resetPassword", resetPassword);

router.put("/updateUser", authenticateUser, updateUser);

router.delete("/deleteUser/:userId", authenticateUser, deleteUser);

export default router;

//  http://localhost:3000/api/signup
