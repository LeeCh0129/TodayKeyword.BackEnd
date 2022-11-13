import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    firebaseId: { type: String, required: true, unique: true },
    deviceToken: { type: String },
    email: { type: String, unique: true },
    avatar: { type: String },
    state: { type: String, enum: ["active", "deleted"], default: "active" },
    name: { type: String },
    nickname: { type: String },
    bookmarkPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    univ: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false,
  }
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
