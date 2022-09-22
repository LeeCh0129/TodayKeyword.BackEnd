import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const getPost = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId)
    .populate({
      path: "comments",
      model: "Comment",
      populate: { path: "owner", model: "User" },
    })
    .populate({ path: "owner", model: "User" })
    .populate({
      path: "like",
      model: "User",
    })
    .populate({ path: "marker", model: "Marker" });
  return post;
};

export const getPosts = async (req, res) => {
  const posts = await Post.find({ state: "active" })
    .sort({ createdAt: -1 })
    .populate({
      path: "comments",
      model: "Comment",
      populate: { path: "owner", mode: "User" },
    })
    .populate({ path: "owner", model: "User" })
    .populate({ path: "marker", model: "Marker" });
  res.json({ posts });
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
  const post = await Post.findById(postId).select("state");
  if (post.state == "deleted")
    res.status(400).json({ errorMessage: "이미 삭제된 게시글입니다." });
  if (post.state == "active") {
    post.state = "deleted";
  }
  post.save();
  res.status(200).json(post);
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const user = await User.findOne({ firebaseId: req.user.uid }).select("_id");

  // userId 찾아서 comment 작성자가 동일한지 체크

  const newComment = await Comment.findByIdAndUpdate(commentId, {
    isDeleted: true,
  });
  res.status(200).json(newComment);
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
      owner: user._id,
      post: postId,
      parentComment,
      comment,
    });
    res.status(200).json(newComment);
  } catch (e) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};
