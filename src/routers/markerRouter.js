import express from "express";
import {
  getMarker,
  postCreateMarker,
  getPostsFromMarker,
} from "../controller/markerController.js";
import { ensureAuthorized } from "../middlewares.js";

const router = express.Router();

router.post("/createMarker", ensureAuthorized, postCreateMarker);
router.get("/", ensureAuthorized, getMarker);
router.get("/:markerId([0-9a-f]{24})", ensureAuthorized, getPostsFromMarker);

export default router;
