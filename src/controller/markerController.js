import Marker from "../models/Marker.js";
import Post from "../models/Post.js";
import moment from "moment";

export const getMarker = async (req, res) => {
  const marker = await Marker.find().populate({
    path: "category",
    model: "Category",
  });
  res.json(marker);
};

export const getPostsFromMarker = async (req, res) => {
  const { markerId } = req.params;
  const posts = await Post.find({ marker: markerId });
  res.status(200).json({ posts });
};

export const getHotPlace = async (req, res) => {
  const posts = await Post.find({
    createdAt: {
      $gte: moment().startOf("day").subtract(60, "days"),
      $lt: moment(),
    },
  }).select("marker");
  let markers = {};

  posts.forEach((post) => {
    let markerId = post.marker._id.toString();
    if (!markers[markerId]) {
      markers[markerId] = 1;
    } else {
      markers[markerId]++;
    }
  });

  const sortedData = Object.keys(
    Object.fromEntries(Object.entries(markers).sort(([, a], [, b]) => a - b))
  );

  if (sortedData.length > 10) {
    sortedData.length = 10;
  }

  const hotPlace = await Marker.find({
    _id: {
      $in: sortedData,
    },
  });

  return res.status(200).json(hotPlace);
};

export const postCreateMarker = async (req, res) => {
  const { lat, lng, category, store, address } = req.body;
  const newMarker = await Marker.create({
    position: {
      lat,
      lng,
    },
    store,
    category,
    address,
  });
  res.status(200).json(newMarker);
};
