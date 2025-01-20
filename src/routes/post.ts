import express from "express";
import { createPost, getPosts } from "../controllers/post";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.use(checkAuth);

router.post("/create", createPost);
router.get("/get", getPosts);

export default router;
