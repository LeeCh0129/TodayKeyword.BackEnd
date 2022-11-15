import mongoose from "mongoose";
import { sendNotification } from "../controller/notificationController.js";

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    target: { type: mongoose.Schema.Types.ObjectId },
    type: { type: String, required: true, enum: ["review", "free", ""] },
    read: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

notificationSchema.pre("save", async function () {
  await this.populate([
    {
      path: "sender",
      model: "User",
      select: "name",
    },
    {
      path: "receiver",
      model: "User",
      select: ["deviceToken", "name"],
    },
  ]);
  return sendNotification(this);
});

notificationSchema.pre("find", function (next) {
  this.populate({
    path: "receiver",
    model: "User",
  })
    .populate({ path: "sender", model: "User" })
    .populate({
      path: "post",
      model: "Post",
      select: "imageUrls",
    });
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

// sender님이 receiver님의 type에 message.
