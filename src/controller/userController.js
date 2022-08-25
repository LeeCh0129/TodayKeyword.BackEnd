import axios from "axios";
import User from "../models/User.js";

export const signIn = async (req, res) => {
  const { service, email, uid } = req.body; //요청에서 회원가입에 필요한 데이터를 변수로 저장
  const response = await postFirebaseFunction(req.body); //인증서버 로그인 또는 회원가입 후 토큰 반환
  const exists = await User.exists({ firebaseId: uid }); //DB에서 유저 확인
  // const { service, email, uid, signUp: { name, nickName }} = req.body; //요청에서 회원가입에 필요한 데이터를 변수로 저장
  if (!exists) {
    await User.create({
      //DB에 유저 생성
      service,
      email,
      firebaseId: uid,
    });
  }
  const customToken = response.data;
  if (!customToken) {
    return res
      .status(400)
      .json({ errorMessage: "데이터가 올바르지 않습니다." });
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
