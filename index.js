const express = require("express");
const app = express();

app.get("/api", (req, res) => res.send("API Working!"));

app.listen(process.env.port || 4000, function () {
  console.log("Now Listening for Requests");
});
