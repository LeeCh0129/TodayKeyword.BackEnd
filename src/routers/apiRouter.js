import express from "express";
import axios from "axios";
import User from "../models/User.js";
import { ensureAuthorized } from "../middlewares.js";
// import admin from "../firebase";

const router = express.Router();

router.post("/user/signIn", async (req, res) => {
  const response = await postFirebaseFunction(req.body);
  const customToken = response.data;
  console.log("커스텀 토큰 : ", customToken);
  if (!customToken) {
    return res
      .status(400)
      .json({ errorMessage: "데이터가 올바르지 않습니다." });
  }
  const exists = await User.exists({ firebaseId: req.body.uid });
  if (!exists) {
    const createdUser = await User.create({
      service: req.body.service,
      email: req.body.email,
      firebaseId: req.body.uid,
    });
    console.log(`유저 생성 완료 ${createdUser}`);
  }
  return res.status(200).json({ msg: "토큰 생성 완료", token: customToken });
});

router.get("/user/myProfile", ensureAuthorized, async (req, res) => {
  console.log(req.user);
  const user = await User.findOne({ firebaseId: req.user.uid });
  console.log("몽고DB: ", user);
  res.status(200).json(user);
});

const postFirebaseFunction = (user) =>
  axios
    .post(
      "https://us-central1-todaykeyword.cloudfunctions.net/createCustomToken",
      user
    )
    .catch((error) => console.log(error));

export default router;
