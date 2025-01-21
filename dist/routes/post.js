"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_1 = require("../controllers/post");
const checkAuth_1 = require("../middlewares/checkAuth");
const router = express_1.default.Router();
router.use(checkAuth_1.checkAuth);
router.post("/create", post_1.createPost);
router.get("/get", post_1.getPosts);
router.post("/vote", post_1.votePost);
router.get("/vote/check", post_1.checkVote);
exports.default = router;
