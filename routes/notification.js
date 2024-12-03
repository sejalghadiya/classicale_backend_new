import express from "express";
import { getNotification } from "../controller/notification.js";

const router = express.Router(); 

router.get('/getNotification', getNotification);

export default router;
