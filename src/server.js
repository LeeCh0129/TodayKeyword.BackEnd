import "./db.js";
import express from "express";
import morgan from "morgan";
import apiRouter from "./routers/apiRouter.js";

const app = express();
const logger = morgan("dev");
const PORT = process.env.PORT || 4000;

app.use(logger);
app.use(express.json());
app.use("/assets", express.static("assets"));
app.get("/", (req, res) => {
  return res.send("hi");
});
app.get("/map", (req, res) => {
  return res.sendFile(__dirname + "/views/naver_map.html");
});
app.use("/api", apiRouter);

app.listen(PORT, function () {
  console.log(`✅ 서버 열림 port:${PORT}`);
});
