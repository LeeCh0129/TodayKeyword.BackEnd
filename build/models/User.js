import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  service: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  firebaseId: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

export default User;