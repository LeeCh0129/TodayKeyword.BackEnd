import express from "express";
import { ensureAuthorized } from "../middlewares.js";
import { signIn, getProfile } from "../controller/userController.js";

const apiRouter = express.Router();

apiRouter.post("/user/signIn/:userId([0-9a-f]{24})", signIn);
apiRouter.get("/user/profile", ensureAuthorized, getProfile);

export default apiRouter;
