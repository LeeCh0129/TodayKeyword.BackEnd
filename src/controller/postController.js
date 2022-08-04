import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const getPost = async (req, res) => {
  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .populate({
      path: "comments",
      model: "Comment",
      populate: [
        {
          path: "childComments",
          model: "Comment",
          populate: { path: "owner", model: "User" },
        },
        { path: "owner", mode: "User" },
      ],
    })
    .populate({ path: "owner" });
  res.json({ posts });
};

export const postCreatePost = async (req, res) => {
  let imageUrls = [];
  const user = await User.findOne({ firebaseId: req.user.uid });
  console.log(user._id);
  req.files.forEach((file) => imageUrls.push(file.key));
  const { store, category, address, review, keyword } = req.body;
  const post = await Post.create({
    store,
    owner: user._id,
    category,
    imageUrls,
    address,
    review,
    keyword,
  });
  res.json({ status: "success", post });
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
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
  console.log(await Comment.find({ post: postId, parentComment: null }));
  const comments = await Comment.find({ post: postId, parentComment: null })
    .populate([
      {
        path: "childComments",
        model: "Comment",
        populate: { path: "owner", model: "User" },
      },
      { path: "owner", mode: "User" },
    ])
    .populate({ path: "owner" });
  res.json(comments);
};

export const postCreateComment = async (req, res) => {
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
  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment, {
      $push: { childComments: newComment },
    });
  }
  res.status(200).json({ newComment });
};
