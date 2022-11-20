import Post, { postDefaultPopulate } from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Marker from "../models/Marker.js";
import Notification from "../models/Notification.js";
import Category from "../models/Category.js";
import moment from "moment";

const numberOfPostsPerDay = 3;

export const getPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate(postDefaultPopulate);
    return res.status(200).json(post);
  } catch (e) {
    return res
      .status(400)
      .json({ errorMessage: "데이터를 불러오는데 실패했습니다." });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ state: "active" })
      .populate(postDefaultPopulate)
      .sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (e) {
    return res
      .status(400)
      .json({ errorMessage: "데이터를 불러오는데 실패했습니다." });
  }
};

export const postCreatePost = async (req, res) => {
  const { userId } = req.user;
  if (!checkNumberOfPostsPerDay(userId)) {
    return res.status(400).json({
      errorMessage: `하루에 최대 ${numberOfPostsPerDay}개 이상 작성하실 수 없습니다`,
    });
  }
  let imageUrls = [];
  req.files.forEach((file) => imageUrls.push(file.key));
  const { marker, review, keywords, rating } = req.body;
  try {
    const post = await Post.create({
      owner: userId,
      imageUrls,
      marker,
      review,
      keywords,
      rating,
    });
    return res.json({ status: "success", post });
  } catch (e) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 작성에 실패했습니다." });
  }
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
    res.status(200).json(comments);
  } catch (e) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};

export const postCreateComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { parentCommentId, comment } = req.body;
    const { userId } = req.user;

    const post = await Post.findById(postId).select("owner");
    let newComment = await Comment.create({
      owner: userId,
      post: postId,
      parentComment: parentCommentId,
      comment,
    });
    newComment = await newComment.populate({ path: "owner", ref: "User" });
    const parentComment = await Comment.findById(parentCommentId).select(
      "owner"
    );
    Notification.create({
      sender: userId,
      receiver: post.owner,
      message: "댓글을 남겼습니다.",
      post: postId,
      type: "review",
    });
    if (parentComment) {
      Notification.create({
        sender: userId,
        receiver: parentComment.owner,
        message: "대댓글을 남겼습니다.",
        post: postId,
        type: "comment",
      });
      const comments = await Comment.find({
        parentComment: parentCommentId,
      }).select("owner");
      comments.forEach((comment) => {
        if (comment.owner != userId) {
          Notification.create({
            sender: userId,
            receiver: comment.owner,
            message: "대댓글을 남겼습니다.",
            post: postId,
            type: "comment",
          });
        }
      });
    }
    return res.status(200).json(newComment);
  } catch (e) {
    return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
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
    if (
      !(await Notification.exists({
        sender: user._id,
        target: req.params.commentId,
      }))
    ) {
      Notification.create({
        sender: user._id,
        receiver: comment.owner._id,
        message: "좋아요를 남겼습니다.",
        post: req.params.postId,
        target: req.params.commentId,
        type: "comment",
      });
    }
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
      res.status(200).json({ msg: "업데이트 성공" });
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

export const getSearch = async (req, res) => {
  try {
    let result;
    switch (req.query.type) {
      case "review":
        result = await Post.find({
          review: new RegExp(req.query.content),
        }).populate(postDefaultPopulate);
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
    if (storedPost.owner == req.user.userId) {
      switch (storedPost.state) {
        case "active":
          storedPost.state = "stored";
          storedPost.save({ timestamps: { updatedAt: false } });
          return res.status(200).json({ msg: "성공적으로 보관되었습니다." });
          break;
        case "deleted":
          return res
            .status(400)
            .json({ errorMessage: "이미 삭제된 게시물입니다. " });
          break;
        case "stored":
          storedPost.state = "active";
          storedPost.save({ timestamps: { updatedAt: false } });
          return res.status(200).json({ msg: "보관이 해제되었습니다." });
          break;
      }
    }
    return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  } catch (e) {
    return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};
