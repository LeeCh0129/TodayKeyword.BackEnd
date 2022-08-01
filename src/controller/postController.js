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
