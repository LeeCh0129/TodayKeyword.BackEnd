import express from "express";
import {
  getMarker,
  postCreateMarker,
  getPostsFromMarker,
  getHotPlace,
} from "../controller/markerController.js";
import { ensureAuthorized } from "../middlewares.js";

const router = express.Router();

router.post("/createMarker", ensureAuthorized, postCreateMarker);
router.get("/", ensureAuthorized, getMarker);
router.get("/:markerId([0-9a-f]{24})", ensureAuthorized, getPostsFromMarker);
router.get("/hot-place", getHotPlace);

export default router;
