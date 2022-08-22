import Marker from "../models/Marker.js";
import Post from "../models/Post.js";

export const getMarker = async (req, res) => {
  const marker = await Marker.find({});
  res.json(marker);
};

export const getPostsFromMarker = async (req, res) => {
  const { markerId } = req.params;
  const posts = await Post.find({ marker: markerId });
  res.status(200).json({ posts });
};

export const postCreateMarker = (req, res) => {
  console.log(req.body);
  res.json({});
};
