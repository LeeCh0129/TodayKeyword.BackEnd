import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import express from "express";
import { uploadS3 } from "../s3";
import multer from "multer";
import { ensureAuthorized } from "../middlewares";
import { getPost } from "../controller/postController";
const upload = multer({ storage: multer.memoryStorage() });
const postRouter = express.Router();

postRouter.get("/", ensureAuthorized, getPost);

postRouter.post("/create", uploadS3.array("files"), async (req, res) => {
  let imageUrls = [];
  req.files.forEach((file) => imageUrls.push(file.key));
  const post = await Post.create({
    owner: "62dd1457e2f3f416f9a5e8df",
    imageUrls,
    review: req.body.review,
  });
  res.json({ status: "success", post });
});

// postRouter.get("/:id", getPost); //게시글 단 건 불러오기

postRouter.delete(
  "/:postId([0-9a-f]{24})/comment/:commentId([0-9a-f]{24})",
  async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;
    const newComment = await Comment.findByIdAndUpdate(commentId, {
      isDeleted: true,
    });
    res.json(newComment);
  }
);

postRouter.post(
  "/:postId([0-9a-f]{24})/comment/:commentId([0-9a-f]{24})",
  async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;
    const newComment = await Comment.findByIdAndUpdate(commentId, {
      comment,
    });
    res.json(newComment);
  }
); //게시글 업데이트

postRouter.get("/:postId([0-9a-f]{24})/comment", async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ parentComment: null })
    .sort({ createdAt: -1 })
    .populate("childComments");
  res.json(comments);
}); //댓글 전체 불러오기

postRouter.post("/:postId([0-9a-f]{24})/comment/create", async (req, res) => {
  const { postId } = req.params;
  //parentComment가 null이면 null을 넣고 생성
  //parentComment가 ObjectId면 부모 객체를 찾아서 children에 추가
  const { parentComment, comment } = req.body;
  const newComment = await Comment.create({
    owner: "62dd1457e2f3f416f9a5e8df",
    post: "62e52ace6ad637d1d2281675",
    parentComment,
    comment,
  });
  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment, {
      $push: { childComments: newComment },
    });
  }
  res.json({ newComment });
}); //댓글 생성

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export default postRouter;
