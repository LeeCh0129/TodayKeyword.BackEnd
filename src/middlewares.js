import firebaseAdmin from "./firebase.js";

export const ensureAuthorized = async (req, res, next) => {
  try {
    const bearer = req.headers["authorization"].split(" ");
    const idToken = bearer[1];
    const user = await firebaseAdmin.auth().verifyIdToken(idToken);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ errorMessage: "토큰이 유효하지 않습니다." });
  }
};
