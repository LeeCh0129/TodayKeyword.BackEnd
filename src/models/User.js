import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    firebaseId: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    avatar: { type: String },
    state: { type: String, default: "active" },
    name: { type: String },
    nickName: { type: String },
    bookmarkPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    univ: { type: String },
  },
  { timestamps: true }
);

userSchema.virtual("myPosts", {
  ref: "Post",
  localField: "_id",
  foreignField: "owner",
});

userSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "owner",
});

const User = mongoose.model("User", userSchema);

export default User;
