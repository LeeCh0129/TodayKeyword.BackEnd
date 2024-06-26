import User from "../models/User.js";
import admin from "firebase-admin";
import Post, { postDefaultPopulate } from "../models/Post.js";
import Notification from "../models/Notification.js";

export const getUser = async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.status(200).json(user);
};

export const postSignIn = async (req, res) => {
  const user = await User.findOne({ firebaseId: req.body.uid }).select(
    "_id state"
  );
  if (!user) {
    return res.status(204).json({ errorMessage: "회원가입을 진행해주세요." });
  }
  if (user.state == "deleted") {
    return res.status(400).json({ errorMessage: "탈퇴한 회원입니다." });
  }
  const customToken = await createCustomToken(req, user._id); //토큰 발급
  return res.status(200).json({ msg: "토큰 생성 완료", token: customToken });
};

export const postSignUp = async (req, res) => {
  const user = req.body;
  const newUser = await User.create({
    service: user.service,
    email: user.email,
    firebaseId: user.uid,
    name: user.name,
    nickname: user.nickname,
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
  const posts = await Post.find({
    owner: req.user.userId,
    state: "active",
  }).populate(postDefaultPopulate);

  if (!posts) {
    res.status(400).json({ errorMessage: "절못된 요청입니다." });
  }
  res.status(200).json({ posts });
};

export const getNotification = async (req, res) => {
  const notifications = await Notification.find({
    receiver: req.user.userId,
  });
  return res.status(200).json(notifications);
};

export const getBookmark = async (req, res) => {
  const bookmark = await User.findById(req.params.userId).populate({
    path: "bookmarkPosts",
    model: "Post",
    match: { state: "active" },
    populate: postDefaultPopulate,
  });

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

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.userId != userId) {
      return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
    }
    await User.findByIdAndUpdate(userId, {
      state: "deleted",
      deletedAt: Date.now(),
    });
    return res.status(200).json({ msg: "성공적으로 탈퇴가 완료되었습니다." });
  } catch (e) {
    return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};

export const getStored = async (req, res) => {
  try {
    const storedPost = await Post.find({
      state: "stored",
      owner: req.user.userId,
    }).populate(postDefaultPopulate);
    return res.status(200).json(storedPost);
  } catch (e) {
    return res.status(400).json({ errorMessage: "잘못된 요청입니다." });
  }
};
