import axios from "axios";
import User from "../models/User.js";
import admin from "firebase-admin";
import Post from "../models/Post.js";

export const getUser = async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.status(200).json(user);
};

export const signIn = async (req, res) => {
  const userId = await User.findOne({ firebaseId: req.body.uid }).select("_id"); //DB에서 유저 확인
  if (!userId) {
    return res.status(204).json({ errorMessage: "회원가입을 진행해주세요." });
  }
  const customToken = await createCustomToken(req, userId._id); //토큰 발급
  return res.status(200).json({ msg: "토큰 생성 완료", token: customToken });
};

export const signUp = async (req, res) => {
  const user = req.body;
  const newUser = await User.create({
    service: user.service,
    email: user.email,
    firebaseId: user.uid,
    name: user.name,
    nickName: user.nickName,
    univ: user.univ,
  });
  const customToken = await createCustomToken(req, newUser._id);
  res.status(201).json(customToken);
};

export const createCustomToken = async (req, userId) => {
  const user = req.body;
  const params = {
    email: user.email,
    service: user.service,
  };

  try {
    await admin.auth().updateUser(user.uid, params);
  } catch (e) {
    params["uid"] = user.uid;
    await admin.auth().createUser(params);
  }

  await admin.auth().setCustomUserClaims(user.uid, {
    userId: userId,
  });

  const customToken = await admin.auth().createCustomToken(user.uid);
  return customToken;
};

export const getProfile = async (req, res) => {
  const posts = await Post.find({ owner: req.user.userId, state: "active" })
    .populate({
      path: "comments",
      model: "Comment",
      select: "id",
    })
    .populate({ path: "owner", model: "User" })
    .populate({ path: "marker", model: "Marker" });

  if (!posts) {
    res.status(400).json({ errorMessage: "절못된 요청입니다." });
  }
  res.status(200).json({ posts });
};

export const getBookmark = async (req, res) => {
  const bookmark = await User.findById(req.params.userId).populate({
    path: "bookmarkPosts",
    model: "Post",
    populate: [
      {
        path: "comments",
        model: "Comment",
        select: "id",
      },
      { path: "owner", model: "User" },
      { path: "marker", model: "Marker" },
    ],
  });
  // .populate({ path: "owner", model: "User" })
  // .populate({ path: "marker", model: "Marker" });

  if (!bookmark) {
    res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
  res.status(200).json(bookmark);
};

export const patchBookmark = async (req, res) => {
  const { postId } = req.params;
  const user = await User.findById(req.user.userId).select("bookmarkPosts");
  if (user.bookmarkPosts.includes(postId)) {
    const filteredBookmarkPosts = user.bookmarkPosts.filter(function (
      value,
      index,
      arr
    ) {
      return value != postId;
    });
    user.bookmarkPosts = filteredBookmarkPosts;
    user.save();
  } else {
    user.bookmarkPosts.push(postId);
    user.save();
  }
  res.status(200).json(user);
};
