const express = require("express");
const mongoose = require("mongoose");
const apiRouter = require("./apiRouter");
const admin = require("firebase-admin");
const serviceAccount = require("../../todaykeyword-firebase-adminsdk-nx5ao-623f01acaa.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
mongoose.connect("mongodb://localhost/todaykeyword");

app.use(express.json());
app.get("/", (req, res) => {
  res.send("hi");
});
app.use("/api", apiRouter);

app.listen(4000, function () {
  console.log("Now Listening for Requests");
});
