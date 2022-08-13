import express from "express";
import { getMarker, postCreateMarker } from "../controller/markerController.js";

const router = express.Router();

router.post("/createMarker", postCreateMarker);
router.get("/", getMarker);

export default router;
