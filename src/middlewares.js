import firebaseAdmin from "./firebase.js";

export const ensureAuthorized = async (req, res, next) => {
  try {
    const bearer = req.headers["authorization"].split(" ");
    const idToken = bearer[1];
    req.user = await firebaseAdmin.auth().verifyIdToken(idToken);
    next();
  } catch (error) {
    return res.status(401).json({ errorMessage: "토큰이 유효하지 않습니다." });
  }
};
