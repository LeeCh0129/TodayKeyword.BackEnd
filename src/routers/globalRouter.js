import express from "express";
import { getSearch } from "../controller/postController.js";
import { postSignIn, postSignUp } from "../controller/userController.js";
import { ensureAuthorized } from "../middlewares.js";

const router = express.Router();

router.post("/signin", postSignIn);
router.post("/signup", postSignUp);
router.get("/search", ensureAuthorized, getSearch);

export default router;
