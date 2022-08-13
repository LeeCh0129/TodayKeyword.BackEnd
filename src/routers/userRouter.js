import express from "express";
import { ensureAuthorized } from "../middlewares.js";
import { signIn, getProfile } from "../controller/userController.js";

const router = express.Router();

router.post("/signIn", signIn);
router.get("/profile/:userId([0-9a-f]{24})", ensureAuthorized, getProfile);

export default router;
