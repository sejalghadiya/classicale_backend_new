import express from "express";
import {
  userSignUp,
  updateUser,
  userLogin,
  deleteUser,
  verifyOtp,
  createNewPassword,
  checkBothUser,
  getOtherOccupations,
  verifyPin,
  getOccupation,
  resetPassword,
  getProductTypes,
  getProductSubType,
} from "../controller/user.js";
import { upload } from "../upload.js";
import authenticateUser from "../auth/middle.js";
const router = express.Router();

router.post("/createNewPassword", createNewPassword);
router.get("/getOccupation", getOccupation);
router.post("/verifyPin", verifyPin);

router.post("/verifyOtpUser", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/login", userLogin);

router.post(
  "/signup",
  upload.fields([
    // { name: "profileImage", maxCount: 1 },
    // { name: "aadhaarCardImage1", maxCount: 1 },
    // { name: "aadhaarCardImage2", maxCount: 1 },
  ]),
  userSignUp
);
router.put(
  "/updateUser",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "aadhaarCardImage1", maxCount: 1 },
    { name: "aadhaarCardImage2", maxCount: 1 },
  ]),
  updateUser
);

router.delete("/deleteUser/:userId", authenticateUser, deleteUser);

router.post("/checkBoth", checkBothUser);

router.get("/get-occupations", getOtherOccupations);

router.get("/get-productType", getProductTypes);

router.get("/get-sub-product-type/:sub_product_type_id", getProductSubType);

export default router;

//  http://localhost:3000/api/signup
