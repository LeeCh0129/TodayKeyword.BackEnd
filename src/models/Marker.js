import mongoose from "mongoose";

const markerSchema = new mongoose.Schema({
  position: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  storeName: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, required: true },
  keyword: {
    type: [String],
    validate: [keywordArrayLimit, "키워드는 최소 1개에서 최대 3개입니다."],
  },
  state: { type: String, required: true, default: "active" },
});

function keywordArrayLimit(val) {
  return val.length <= 3 && val.length >= 1;
}

const Marker = mongoose.model("Marker", markerSchema);

export default Marker;
