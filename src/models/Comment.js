import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    post: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Post" },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    childComments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    },
    comment: { type: String, maxLength: 20, required: true },
    like: { type: Number, default: 0, required: true },
    isDeleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
