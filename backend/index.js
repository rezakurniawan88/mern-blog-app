import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import cors from "cors";
import cookieParser from "cookie-parser";
import PostRoute from "./routes/PostRoute.js";
import UserRoute from "./routes/UserRoute.js";
dotenv.config();
const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000"}));
app.use(cookieParser());
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));
app.use(PostRoute);
app.use(UserRoute);

app.listen(5000, () => console.log("Server run at http://127.0.0.1:5000"));