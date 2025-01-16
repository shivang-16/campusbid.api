"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.votePost = exports.createPost = void 0;
const error_1 = require("../../middlewares/error");
const processDouments_1 = require("../../helpers/processDouments");
const postModel_1 = __importDefault(require("../../models/postModel"));
const voteModel_1 = __importDefault(require("../../models/voteModel"));
const createPost = async (req, res, next) => {
    try {
        const { text, media, isComment } = req.body;
        if (!text || !media)
            return next(new error_1.CustomError(("Text or Media is required")));
        const mediaInfo = await (0, processDouments_1.processDocuments)(media);
        // Create a new bid
        const newPost = new postModel_1.default({
            user: req.user._id,
            text,
            media: mediaInfo?.map(doc => ({
                fileName: doc?.fileName,
                fileUrl: doc?.getUrl,
                key: doc?.key,
                ...doc
            }))
        });
        res.json({
            success: true,
            message: "Post created successfully",
            post: newPost,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.createPost = createPost;
const votePost = async (req, res, next) => {
    try {
        const { postId, userId, type } = req.query;
        if (!postId && !userId) {
            return next(new error_1.CustomError("Post ID and User ID is required.", 404));
        }
        if (type !== "upvote" && type !== "downvote") {
            return next(new error_1.CustomError("Invalid vote type.", 400));
        }
        await voteModel_1.default.create({
            user: userId,
            post: postId,
            type: type
        });
        const post = await postModel_1.default.findById(postId);
        if (!post)
            return next(new error_1.CustomError("Post not exists", 404));
        if (type === "upvote") {
            post.analytics.upvotes += 1;
        }
        else if (type === "downvote") {
            post.analytics.downvotes += 1;
        }
        else if (type === "special") {
            post.analytics.special += 1;
        }
        await post.save();
        res.status(200).json({
            success: true,
            message: `${type} successfully`
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.votePost = votePost;
