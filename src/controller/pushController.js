import User from "../models/User.js";
import admin from "firebase-admin";

export const putPushToken = async (req, res) => {
  const pushToken = req.body.pushToken;
  let user = await User.findByIdAndUpdate(req.user.userId, { pushToken });
  return res.status(200).json({ msg: "토큰 저장 성공" });
};

export const postPush = async (req, res) => {
  const body = req.body.body;
  let deviceToken =
    "cK2KIoGnRWCTqk1PDfhxv3:APA91bEfZkxQhgYByfsBpsGGmPFaScfP636Liv3k3vrr3s4spVzCz62TGW-_-ZN9GWsEqR6q-YKSnSL7EG2diyOdcWtWr70LYdYlGpMSdCwo2wwXXx9vre3UkVwbS4IwTGT83CgkOuzQ";

  let message = {
    notification: {
      title: "🔔 테스트 알림이 도착했어요!",
      body,
    },
    token: deviceToken,
  };

  admin
    .messaging()
    .send(message)
    .then(function (response) {
      console.log("Successfully sent message: : ", response);
      return res.status(200).json({ success: true });
    })
    .catch(function (err) {
      console.log("Error Sending message!!! : ", err);
      return res.status(400).json({ success: false });
    });
};
