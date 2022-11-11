import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  parentCode: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
