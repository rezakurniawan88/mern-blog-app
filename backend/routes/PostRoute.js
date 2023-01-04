import express from "express";
import {
    getPost,
    getAllPost,
    getPostById,
    createPost,
    updatePost,
    deletePost
} from "../controllers/PostController.js";

const route = express.Router();

route.get("/blog", getPost);
route.get("/all-blogs", getAllPost);
route.get("/blog/:slug", getPostById);
route.post("/blog", createPost);
route.patch("/blog/:slug", updatePost);
route.delete("/blog/:slug", deletePost);

export default route;