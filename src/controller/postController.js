import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Marker from "../models/Marker.js";
import Notification from "../models/Notification.js";
import Category from "../models/Category.js";
import moment from "moment";

const numberOfPostsPerDay = 3;

export const getPost = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  res.status(200).json(post);
};

export const getPosts = async (req, res) => {
  const posts = await Post.find({ state: "active" }).sort({ createdAt: -1 });
  res.status(200).json({ posts });
};

export const postCreatePost = async (req, res) => {
  let imageUrls = [];
  const { userId } = req.user;
  if (!checkNumberOfPostsPerDay(userId)) {
    return res.status(400).json({
      errorMessage: `하루에 최대 ${numberOfPostsPerDay}개 이상 작성하실 수 없습니다`,
    });
  }

  req.files.forEach((file) => imageUrls.push(file.key));
  const { marker, review, keywords, rating } = req.body;
  const post = await Post.create({
    owner: userId,
    imageUrls,
    marker,
    review,
    keywords,
    rating,
  });
  res.json({ status: "success", post });
};

export const patchLike = async (req, res) => {
  const user = await User.findOne({ firebaseId: req.user.uid });
  const { postId } = req.params;
  let post = await Post.findById(postId);
  try {
    if (post.like.includes(user._id)) {
      const filteredLike = post.like.filter(function (value, index, arr) {
        return value != user.id;
      });
      post.like = filteredLike;
      post.save();
    } else {
      post.like.push(user._id);
      await post.save();
      if (!(await Notification.exists({ sender: user._id, post: post._id }))) {
        Notification.create({
          sender: user._id,
          receiver: post.owner,
          message: "좋아요를 남겼습니다.",
          post: post._id,
          type: "review",
        });
      }
    }
  } catch (e) {
    res.status(400).json({ errorMessage: "요청 처리중 에러가 발생했습니다." });
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
    return res.status(400).json({ errorMessage: "이미 삭제된 게시글입니다." });
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
        { path: "owner", model: "User" },
      ])
      .populate({ path: "owner", model: "User" });
    console.log(comments);
    res.status(200).json(comments);
  } catch (e) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};

export const postCreateComment = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.user.uid });
    const { postId } = req.params;
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
      .json({ status: "error", errorMessage: "잘못된 요청입니다." });
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

export const patchPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user.userId).select("_id");
    const post = await Post.findById(postId);
    if (post.owner != user.id) {
      return res
        .status(403)
        .json({ errorMessage: "해당 게시글의 작성자가 아닙니다." });
    }
    if (req.user.userId == post.owner) {
      post.save();
      res.status(200).json(post);
    }
  } catch (e) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};

const checkNumberOfPostsPerDay = async (userId) => {
  const user = await User.findById(userId)
    .select("id")
    .populate({
      path: "myPosts",
      model: "Post",
      select: "createdAt",
      match: {
        createdAt: {
          $gte: moment().startOf("day").toDate(),
          $lte: moment().endOf("day").toDate(),
        },
      },
    });
  if (user.myPosts.length >= numberOfPostsPerDay) return false;
  return true;
};

export const search = async (req, res) => {
  try {
    let result;
    switch (req.query.type) {
      case "review":
        result = await Post.find({ review: new RegExp(req.query.content) })
          .populate({ path: "owner", model: "User" })
          .populate({ path: "marker", model: "Marker" });
        break;
      case "marker":
        result = await Marker.find({ store: new RegExp(req.query.content) });
        break;
      default:
        return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
    }
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};

export const getCategories = async (req, res) => {
  try {
    const category = await Category.find({
      code: new RegExp("A"),
    }).select("title code");
    return res.status(200).json(category);
  } catch (e) {
    return res
      .status(500)
      .json({ errorMessage: "데이터 조회중 문제가 발생했습니다." });
  }
};

export const getKeywords = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const keywords = await Category.find({
      code: new RegExp("C"),
      parentCode: categoryId,
    });
    return res.status(200).json(keywords);
  } catch (e) {
    return res
      .status(500)
      .json({ errorMessage: "데이터 조회중 문제가 발생했습니다." });
  }
};

export const patchStored = async (req, res) => {
  const { postId } = req.params;
  const storedPost = await Post.findById(postId).select("owner state");
  try {
    if (storedPost.owner == req.user.userId && storedPost.state == "active") {
      storedPost.state = "stored";
      storedPost.save();
      return res.status(200).json(storedPost);
    }
    if (storedPost.owner == req.user.userId && storedPost.state == "deleted") {
      return res
        .status(400)
        .json({ errorMessage: "이미 삭제된 게시물입니다." });
    }
    if (storedPost.owner == req.user.userId && storedPost.state == "stored") {
      return res
        .status(400)
        .json({ errorMessage: "이미 보관된 게시물입니다." });
    }
  } catch (e) {
    return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};

export const getStored = async (req, res) => {
  const { userId } = req.params;
  if (userId != req.user.userId) {
    return res.status(400).json({ errorMessage: "게시글 작성자가 아닙니다." });
  }
  try {
    const storedPost = await Post.find({ state: "stored", owner: userId });
    return res.status(200).json({ storedPost });
  } catch (e) {
    return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};
