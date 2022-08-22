import express from "express";
import { uploadS3 } from "../s3.js";
import { ensureAuthorized } from "../middlewares.js";
import {
  getPost,
  postCreatePost,
  deleteComment,
  postEditComment,
  getComments,
  postCreateComment,
} from "../controller/postController.js";

const router = express.Router();

router.get("/", ensureAuthorized, getPost); //게시글 전체 불러오기

router.post(
  "/create",
  ensureAuthorized,
  uploadS3.array("files"),
  postCreatePost
);

// router.get("/:id", getPost); //게시글 단 건 불러오기

router
  .route("/:postId([0-9a-f]{24})/comment/:commentId([0-9a-f]{24})")
  .all(ensureAuthorized)
  .delete(deleteComment)
  .post(postEditComment); //댓글 삭제 및 수정

router.get("/:postId([0-9a-f]{24})/comment", ensureAuthorized, getComments); //댓글 전체 불러오기

router.post(
  "/:postId([0-9a-f]{24})/comment/create",
  ensureAuthorized,
  postCreateComment
); //댓글 생성

export default router;
