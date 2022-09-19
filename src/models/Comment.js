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
    comment: { type: String, maxLength: 20, required: true },
    like: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
    isDeleted: { type: Boolean, default: false, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

commentSchema.virtual("childComments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
  match: { parentComment: null },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
