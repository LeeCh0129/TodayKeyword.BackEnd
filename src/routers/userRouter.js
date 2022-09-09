import express from "express";
import { ensureAuthorized } from "../middlewares.js";
import {
  signIn,
  getProfile,
  getBookmark,
  patchBookmark,
  signUp,
} from "../controller/userController.js";

const router = express.Router();

router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.get("/bookmark", ensureAuthorized, getBookmark);
router.patch("/bookmark/:postId([0-9a-f]{24})", patchBookmark);
router.get("/user/bookmark/add/:bookmarkId", ensureAuthorized);
router.get("/profile/:userId([0-9a-f]{24})", ensureAuthorized, getProfile);

export default router;
