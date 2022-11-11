import User from "../models/User.js";
import admin from "firebase-admin";

export const patchDeviceToken = async (req, res) => {
  const deviceToken = req.body.pushToken;
  let user = await User.findByIdAndUpdate(req.user.userId, { deviceToken });
  return res.status(200).json({ msg: "토큰 저장 성공" });
};

export const sendNotification = async (notification) => {
  let type = "";
  switch (notification.type) {
    case "review":
      type = "리뷰";
      break;
    case "comment":
      type = "댓글";
  }

  let message = {
    notification: {
      title: "☘️오늘의 키워드",
      body: `${notification.sender.name}님이 ${notification.receiver.name}님의 ${type}에 ${notification.message}`,
    },
    token: notification.receiver.deviceToken,
  };

  admin
    .messaging()
    .send(message)
    .then(function (response) {
      console.log("Successfully sent message: : ", response);
    })
    .catch(function (err) {
      console.log("Error Sending message!!! : ", err);
    });
};
