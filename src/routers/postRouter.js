import express from "express";
import { uploadS3 } from "../s3.js";
import { ensureAuthorized } from "../middlewares.js";
import {
  getPosts,
  postCreatePost,
  deletePost,
  deleteComment,
  postEditComment,
  getComments,
  postCreateComment,
  patchLike,
  patchCommentLike,
  patchPost,
  getHotPlace,
  search,
  getCategories,
  getKeywords,
  patchStorage,
} from "../controller/postController.js";

const router = express.Router();

router.get("/", ensureAuthorized, getPosts);

router.post(
  "/create",
  ensureAuthorized,
  uploadS3.array("files"),
  postCreatePost
);

router
  .route("/:postId([0-9a-f]{24})")
  .all(ensureAuthorized)
  .delete(deletePost)
  .patch(patchPost);
router.patch("/:postId([0-9a-f]{24})/like", ensureAuthorized, patchLike);

router
  .route("/:postId([0-9a-f]{24})/comment/:commentId([0-9a-f]{24})")
  .all(ensureAuthorized)
  .delete(deleteComment)
  .post(postEditComment);

router.get("/:postId([0-9a-f]{24})/comment", ensureAuthorized, getComments);

router.post(
  "/:postId([0-9a-f]{24})/comment/create",
  ensureAuthorized,
  postCreateComment
);

router.patch(
  "/:postId([0-9a-f]{24})/comment/:commentId([0-9a-f]{24})/like",
  ensureAuthorized,
  patchCommentLike
);

router.get("/search", search);

export default router;

router.get("/hot-place", getHotPlace);

router.get("/categories", ensureAuthorized, getCategories);
router.get("/keywords/:categoryId([0-9a-f]{24})", getKeywords);
router.patch("/:postId([0-9a-f]{24})/storage", ensureAuthorized, patchStorage);
