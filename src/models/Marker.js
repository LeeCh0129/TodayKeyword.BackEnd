import mongoose from "mongoose";

const markerSchema = new mongoose.Schema({
  position: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  store: { type: String, required: true },
  address: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  state: { type: String, required: true, default: "active" },
});

markerSchema.pre("find", function (next) {
  this.populate({
    path: "category",
    model: "Category",
  });
  next();
});

const Marker = mongoose.model("Marker", markerSchema);

export default Marker;
