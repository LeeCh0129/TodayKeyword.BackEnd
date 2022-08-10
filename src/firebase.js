import admin from "firebase-admin";
import serviceAccount from "../todaykeyword-firebase-adminsdk-nx5ao-623f01acaa.json" assert { type: "json" };

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default firebaseAdmin;
