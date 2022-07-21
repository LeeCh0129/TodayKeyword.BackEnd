const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

router.get("/user", async (req, res) => {
  const firebaseToken = req.headers.authorization?.split(" ")[1];
  let firebaseUser;
  if (firebaseToken) {
    firebaseUser = await admin.auth().verifyIdToken(firebaseToken);
  }
  //   uid = req.headers.authorization;
  //   console.log(await admin.auth().verifyIdToken(uid));
  return res.send("bye");
});

module.exports = router;
