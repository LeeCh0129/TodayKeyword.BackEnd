import express from "express";
import { ensureAuthorized } from "../middlewares.js";
import {
  signIn,
  getProfile,
  getBookmark,
  patchBookmark,
  signUp,
  getUser,
  deleteUser,
} from "../controller/userController.js";

const router = express.Router();

router.get("/:userId([0-9a-f]{24})", ensureAuthorized, getUser);
router.post("/signin", signIn);
router.post("/signup", signUp);
router.get("/bookmark/:userId([0-9a-f]{24})", ensureAuthorized, getBookmark);
router.patch(
  "/bookmark/:postId([0-9a-f]{24})",
  ensureAuthorized,
  patchBookmark
);
router.get("/user/bookmark/add/:bookmarkId", ensureAuthorized);
router.get("/profile/:userId([0-9a-f]{24})", ensureAuthorized, getProfile);
router.delete("/:userId([0-9a-f]{24})", ensureAuthorized, deleteUser);

export default router;
