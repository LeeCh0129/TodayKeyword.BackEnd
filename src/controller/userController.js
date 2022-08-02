import axios from "axios";
import User from "../models/User.js";

export const signIn = async (req, res) => {
  const response = await postFirebaseFunction(req.body);
  const customToken = response.data;
  if (!customToken) {
    return res
      .status(400)
      .json({ errorMessage: "데이터가 올바르지 않습니다." });
  }
  const exists = await User.exists({ firebaseId: req.body.uid });
  if (!exists) {
    await User.create({
      service: req.body.service,
      email: req.body.email,
      firebaseId: req.body.uid,
    });
  }
  return res.status(200).json({ msg: "토큰 생성 완료", token: customToken });
};

export const getProfile = async (req, res) => {
  const user = await User.findOne({ firebaseId: req.user.uid });
  res.status(200).json(user);
};

const postFirebaseFunction = (user) =>
  axios
    .post(
      "https://us-central1-todaykeyword.cloudfunctions.net/createCustomToken",
      user
    )
    .catch((error) => console.log(error));
