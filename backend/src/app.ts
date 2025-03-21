import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
