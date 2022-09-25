import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const getPost = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId)
    .populate({ path: "owner", model: "User" })
    .populate({ path: "marker", model: "Marker" });
  res.status(200).json(post);
};

export const getPosts = async (req, res) => {
  const posts = await Post.find({ state: "active" })
    .sort({ createdAt: -1 })
    .populate({
      path: "comments",
      model: "Comment",
      select: "id",
    })
    .populate({ path: "owner", model: "User" })
    .populate({ path: "marker", model: "Marker" });
  res.status(200).json({ posts });
};

export const postCreatePost = async (req, res) => {
  let imageUrls = [];
  const user = await User.findOne({ firebaseId: req.user.uid });
  req.files.forEach((file) => imageUrls.push(file.key));
  const { marker, review, keyword, rating } = req.body;
  const post = await Post.create({
    owner: user._id,
    imageUrls,
    marker,
    review,
    keyword,
    rating,
  });
  res.json({ status: "success", post });
};

export const patchLike = async (req, res) => {
  const user = await User.findOne({ firebaseId: req.user.uid });
  const { postId } = req.params;
  let post = await Post.findById(postId);
  if (post.like.includes(user.id)) {
    const filteredLike = post.like.filter(function (value, index, arr) {
      return value != user.id;
    });
    post.like = filteredLike;
    post.save();
  } else {
    post.like.push(user.id);
    post.save();
  }
  res.json({ status: "success", like: post.like });
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId).select("state owner");
  if (req.user.userId != post.owner) {
    return res.status(400).json({ errorMessage: "작성자가 아닙니다." });
  }
  if (post.state == "deleted")
    res.status(400).json({ errorMessage: "이미 삭제된 게시글입니다." });
  if (post.state == "active") {
    post.state = "deleted";
  }
  post.save();
  return res.status(200).json(post);
};

export const postEditComment = async (req, res) => {
  const { commentId } = req.params;
  const { comment } = req.body;
  const newComment = await Comment.findByIdAndUpdate(commentId, {
    comment,
  });
  res.status(200).json(newComment);
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId, parentComment: null })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "childComments",
          model: "Comment",
          populate: { path: "owner", model: "User" },
        },
        { path: "owner", mode: "User" },
      ])
      .populate({ path: "owner" });
    res.status(200).json(comments);
  } catch (e) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};

export const postCreateComment = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.user.uid });
    const { postId } = req.params;
    //parentComment가 null이면 null을 넣고 생성
    //parentComment가 ObjectId면 부모 객체를 찾아서 children에 추가
    const { parentComment, comment } = req.body;
    const newComment = await Comment.create({
      owner: user,
      post: postId,
      parentComment,
      comment,
    });
    res.status(200).json(newComment);
  } catch (e) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};

export const patchCommentLike = async (req, res) => {
  const user = await User.findById(req.user.userId);
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    res
      .status(400)
      .json({ status: "error", errorMessage: "올바르지 않은 요청입니다." });
  } else if (comment.like.includes(user.id)) {
    const filteredLike = comment.like.filter(function (value, index, arr) {
      return value != user.id;
    });
    comment.like = filteredLike;
    comment.save();
  } else {
    comment.like.push(user.id);
    comment.save();
  }
  res.status(200).json(comment.like);
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = await User.findById(req.user.userId).select("_id");
    const comment = await Comment.findById(commentId).select("owner isDeleted");
    if (comment.owner != user.id) {
      return res.status(400).json({ errorMessage: "작성자가 아닙니다." });
    }
    if (comment.isDeleted) {
      return res.status(400).json({ errorMessage: "이미 삭제된 댓글입니다." });
    }
    comment.isDeleted = true;
    comment.save();
    return res.status(200).json(comment);
  } catch (e) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};
