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
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

router.post("/signup", upload.single("image"), userSignUp);

router.post("/login", userLogin);

router.post("/requestPassword", requestPasswordReset);

router.post("/resetPassword", resetPassword);

router.put("/updateUser", authenticateUser, updateUser);

router.delete("/deleteUser/:userId", authenticateUser, deleteUser);

export default router;

//  http://localhost:3000/api/signup
