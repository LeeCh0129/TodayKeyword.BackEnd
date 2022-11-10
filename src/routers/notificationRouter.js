import express from "express";
import { patchDeviceToken } from "../controller/notificationController.js";
import { ensureAuthorized } from "../middlewares.js";

const router = express.Router();

router.patch("/setDeviceToken", ensureAuthorized, patchDeviceToken);
// router.post("/:userId([0-9a-f]{24})", ensureAuthorized, sendNotification); //게시글 전체 불러오기

export default router;
