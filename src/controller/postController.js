import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Marker from "../models/Marker.js";
import moment from "moment";

const numberOfPostsPerDay = 3;

export const getPost = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId)
    .populate({
      path: "comments",
      model: "Comment",
      populate: { path: "owner", model: "User" },
    })
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

export const getHotPlace = async (req, res) => {
  //작성일이 오늘보다 작고 x일보다 크다면 조회
  const posts = await Post.find({
    createdAt: {
      $gte: moment().startOf("day").subtract(60, "days"),
      $lt: moment(),
    },
  }).select("marker");

  //빈 객체 생성
  //posts를 람다식으로 돌려 marker 키가 없다면 추가하고 값에 1 대입 있다면 1을 더함
  posts.forEach((post) => {
    let markerId = post.marker.toString();
    if (!markers[markerId]) {
      markers[markerId] = 1;
    } else {
      markers[markerId]++;
    }
  });

  //빈 배열 생성
  let array = [];
  //객체를 람다식으로 돌려서 크기 순으로 정렬하여 배열에 넣음
  const sortedData = Object.keys(
    Object.fromEntries(Object.entries(markers).sort(([, a], [, b]) => a - b))
  );

  if (sortedData.length > 10) {
    sortedData.length = 10;
  }

  //배열의 마커를 DB에서 조회해 클라이언트에 전달
  const hotPlace = await Marker.find({
    _id: {
      $in: sortedData,
    },
  });

  return res.status(200).json(hotPlace);
};

export const postCreatePost = async (req, res) => {
  let imageUrls = [];
  const user = await User.findById(req.user.userId).select("id").populate({
    path: "myPosts",
    model: "Post",
    select: "createdAt",
  });
  if (checkNumberOfPostsPerDay(user)) {
    return res.status(400).json({
      errorMessage: `하루에 최대 ${numberOfPostsPerDay}개 이상 작성하실 수 없습니다`,
    });
  }
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

export const patchPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user.userId).select("_id");
    const post = await Post.findById(postId);
    console.log(post);
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
