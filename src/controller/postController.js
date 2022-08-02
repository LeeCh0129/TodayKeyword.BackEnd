import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

export const getPost = async (req, res) => {
  const posts = await Post.find({});
  let newPosts = [];
  posts.forEach(async (post) => {
    post.comments = await Comment.find({ post: post.id });
    console.log(post);
  });
  res.json({ posts });
};

export const postCreatePost = async (req, res) => {
  let imageUrls = [];
  req.files.forEach((file) => imageUrls.push(file.key));
  const post = await Post.create({
    owner: "62dd1457e2f3f416f9a5e8df",
    imageUrls,
    review: req.body.review,
  });
  res.json({ status: "success", post });
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const { comment } = req.body;
  const newComment = await Comment.findByIdAndUpdate(commentId, {
    isDeleted: true,
  });
  res.json(newComment);
};

export const postEditComment = async (req, res) => {
  const { commentId } = req.params;
  const { comment } = req.body;
  const newComment = await Comment.findByIdAndUpdate(commentId, {
    comment,
  });
  res.json(newComment);
};

export const getComments = async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ parentComment: null })
    .sort({ createdAt: -1 })
    .populate("childComments");
  res.json(comments);
};

export const createComment = async (req, res) => {
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
};
