import express from "express";
import { checkVote, createPost, getPosts, votePost } from "../controllers/post";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.use(checkAuth);

router.post("/create", createPost);
router.get("/get", getPosts);
router.post("/vote", votePost);
router.get("/vote/check", checkVote);

export default router;
