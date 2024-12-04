import express from "express";
import multer from "multer";

import {
  addFavoriteProduct,
  addProduct,
  showProduct,
  updateProduct,
  getFavoriteProducts,
} from "../controller/product.js";
import { authenticateUser } from "../auth/middle.js";
// In routes or other files
//import { protect, admin } from '../auth/productAuth.js';

const router = express.Router();
//const memoryStorage = multer.memoryStorage();
//const upload = multer({ storage: memoryStorage });
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

router.post("/add", upload.single('image'), authenticateUser, addProduct);

router.get("/showProduct", showProduct);


router.post("/add", upload.array("image"), authenticateUser, addProduct);
router.get("/showProduct", showProduct);

router.put("/update", authenticateUser, updateProduct);
router.post("/favorites", authenticateUser, addFavoriteProduct);
router.get("/getFavoriteProduct", authenticateUser, getFavoriteProducts);
export default router;
