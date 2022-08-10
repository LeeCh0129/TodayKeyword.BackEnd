import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    store: { type: String },
    category: { type: String },
    imageUrls: {
      type: [{ type: String }],
      validate: [imageArrayLimit, "이미지는 최소 1장에서 최대 5장입니다."],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    address: { type: String },
    marker: { type: mongoose.Schema.Types.ObjectId, ref: "Marker" },
    review: { type: String, required: true, maxLength: 20 },
    like: { type: Number, default: 0, required: true },
    state: { type: String, default: "active", required: true },
    keyword: {
      type: [String],
      validate: [keywordArrayLimit, "키워드는 최소 1개에서 최대 3개입니다."],
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

function keywordArrayLimit(val) {
  return val.length <= 3 && val.length >= 1;
}

function imageArrayLimit(val) {
  return val.length <= 5 && val.length >= 1;
}

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
  match: { parentComment: null },
});

const Post = mongoose.model("Post", postSchema);

export default Post;
