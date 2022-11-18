import express from "express";
import { ensureAuthorized } from "../middlewares.js";
import {
  getProfile,
  getBookmark,
  patchBookmark,
  getUser,
  deleteUser,
  getNotification,
} from "../controller/userController.js";

const router = express.Router();

router.get("/:userId([0-9a-f]{24})", ensureAuthorized, getUser);
router.get("/bookmark/:userId([0-9a-f]{24})", ensureAuthorized, getBookmark);
router.patch(
  "/bookmark/:postId([0-9a-f]{24})",
  ensureAuthorized,
  patchBookmark
);
router.get("/notification", ensureAuthorized, getNotification);
router.get("/profile/:userId([0-9a-f]{24})", ensureAuthorized, getProfile);
router.delete("/:userId([0-9a-f]{24})", ensureAuthorized, deleteUser);

export default router;
