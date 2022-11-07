import express from "express";
import { postPush, putPushToken } from "../controller/pushController.js";
import { ensureAuthorized } from "../middlewares.js";

const router = express.Router();

router.put("/setPushToken", ensureAuthorized, putPushToken);
router.post("/:userId([0-9a-f]{24})", ensureAuthorized, postPush); //게시글 전체 불러오기

export default router;
