import express from "express";
import { ensureAuthorized } from "../middlewares.js";
import { signIn, getProfile } from "../controller/userController.js";

const apiRouter = express.Router();

apiRouter.post("/signIn", signIn);
apiRouter.get("/profile/:userId([0-9a-f]{24})", ensureAuthorized, getProfile);

export default apiRouter;
