import express from "express";
import { 
getUsers,
Register,
Login,
Logout
} from "../controllers/Users/UserController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/Users/RefreshToken.js";

const route = express.Router();

route.get("/users", verifyToken, getUsers);
route.post("/users", Register);
route.post("/login", Login);
route.get("/token", refreshToken);
route.delete("/logout", Logout);

export default route;