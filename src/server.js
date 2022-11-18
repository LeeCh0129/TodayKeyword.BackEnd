import "./db.js";
import express from "express";
import morgan from "morgan";
import userRouter from "./routers/userRouter.js";
import postRouter from "./routers/postRouter.js";
import markerRouter from "./routers/markerRouter.js";
import pushRouter from "./routers/notificationRouter.js";
import globalRouter from "./routers/globalRouter.js";
import "dotenv/config";

const app = express();
const logger = morgan("dev");
const PORT = process.env.PORT || 4000;

app.use(logger);
app.use("/assets", express.static("assets"));
app.use(express.static("./views"));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  return res.send("<h1>Welcome to TodayKeyword</h1>");
});

app.get("/map", (req, res) => {
  res.sendFile(process.cwd() + "/src/views/naver_map.html");
});

app.use("/", globalRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/marker", markerRouter);
app.use("/notification", pushRouter);
app.listen(PORT, function () {
  console.log(`✅ 서버 열림 port:${PORT}`);
});
