"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.votePost = exports.getPosts = exports.createPost = void 0;
const error_1 = require("../../middlewares/error");
const postModel_1 = __importDefault(require("../../models/postModel"));
const postVoteModel_1 = __importDefault(require("../../models/postVoteModel"));
const createPost = async (req, res, next) => {
    try {
        const { text, files, isComment, type } = req.body;
        console.log(req.body);
        // Validate type
        if (!['post', 'spill'].includes(type)) {
            return next(new error_1.CustomError("Invalid type. Must be 'post' or 'spill'.", 400));
        }
        // Validate either text or files along with type
        if ((!text && !files) || (!type)) {
            return next(new error_1.CustomError("Either 'text' with 'type' or 'files' with 'type' is required.", 400));
        }
        // If both text and files are absent
        if (!text && !files) {
            return next(new error_1.CustomError("Both 'text' and 'files' cannot be empty.", 400));
        }
        // If files are provided, process them
        let filesInfo = [];
        if (files) {
            filesInfo = files;
        }
        // Create a new bid
        const newPost = await postModel_1.default.create({
            user: req.user._id,
            text,
            isComment,
            type,
            files: filesInfo?.map(doc => ({
                fileUrl: doc?.getUrl,
                ...doc
            }))
        });
        res.json({
            success: true,
            message: "Post created successfully",
            post: newPost,
            signedUrls: filesInfo?.map(doc => doc?.putUrl)
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.createPost = createPost;
const getPosts = async (req, res, next) => {
    try {
        const posts = await postModel_1.default.find().populate("user").sort({ createdAt: -1 });
        res.json({
            success: true,
            posts
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.getPosts = getPosts;
const votePost = async (req, res, next) => {
    try {
        const { postId, userId, type } = req.query;
        if (!postId || !userId) {
            return next(new error_1.CustomError("Post ID and User ID are required.", 404));
        }
        if (!["upvote", "downvote", "special"].includes(type)) {
            return next(new error_1.CustomError("Invalid vote type.", 400));
        }
        const existingVote = await postVoteModel_1.default.findOne({ user: userId, post: postId });
        const post = await postModel_1.default.findById(postId);
        if (!post)
            return next(new error_1.CustomError("Post does not exist", 404));
        if (existingVote) {
            if (existingVote.type === type) {
                // Remove vote if the same type already exists
                await existingVote.deleteOne();
                post.analytics[type + 's'] -= 1;
            }
            else if (type !== 'special' && existingVote.type !== 'special') {
                // Change vote type between upvote/downvote
                post.analytics[existingVote.type + 's'] -= 1;
                existingVote.type = type;
                post.analytics[type + 's'] += 1;
                await existingVote.save();
            }
            else {
                // Handle special vote independently
                if (type === 'special') {
                    await postVoteModel_1.default.create({
                        user: userId,
                        post: postId,
                        type: type
                    });
                    post.analytics.special += 1;
                }
                else {
                    post.analytics[existingVote.type + 's'] -= 1;
                    await existingVote.deleteOne();
                    await postVoteModel_1.default.create({
                        user: userId,
                        post: postId,
                        type: type
                    });
                    post.analytics[type + 's'] += 1;
                }
            }
        }
        else {
            // Create new vote
            await postVoteModel_1.default.create({
                user: userId,
                post: postId,
                type: type
            });
            post.analytics[type + 's'] += 1;
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
