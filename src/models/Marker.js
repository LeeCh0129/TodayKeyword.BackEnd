import mongoose from "mongoose";

const markerSchema = new mongoose.Schema({
  position: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  store: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, required: true },
  state: { type: String, required: true, default: "active" },
});

const Marker = mongoose.model("Marker", markerSchema);

export default Marker;
