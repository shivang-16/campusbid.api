"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVote = exports.votePost = exports.getPosts = exports.createPost = void 0;
const error_1 = require("../../middlewares/error");
const postModel_1 = __importDefault(require("../../models/postModel"));
const postVoteModel_1 = __importDefault(require("../../models/postVoteModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const createPost = async (req, res, next) => {
    try {
        const { text, files, isComment, refPost, type } = req.body;
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
            isComment: {
                comment: isComment,
                refPost: refPost ? new mongoose_1.default.Types.ObjectId(refPost) : undefined
            },
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
        const userId = req.user._id; // Assuming `req.user` is populated with the logged-in user's info
        const posts = await postModel_1.default.aggregate([
            {
                $lookup: {
                    from: 'postvotes', // Name of the PostVote collection in the database
                    let: { postId: '$_id', userId: new mongoose_1.default.Types.ObjectId(userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$post', '$$postId'] },
                                        { $eq: ['$user', '$$userId'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'userVote'
                }
            },
            {
                $addFields: {
                    userVote: {
                        $cond: {
                            if: { $gt: [{ $size: '$userVote' }, 0] },
                            then: { $arrayElemAt: ['$userVote.type', 0] },
                            else: null
                        }
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);
        // Populate the user field after the aggregation
        await postModel_1.default.populate(posts, { path: 'user', select: 'name email username' });
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
        if (!post.analytics) {
            post.analytics = {
                upvotes: 0,
                downvotes: 0,
                special: 0,
                views: 0,
                engagement: 0
            };
        }
        const decrementAnalytics = (field) => {
            if (post.analytics[field] > 0) {
                post.analytics[field] -= 1;
            }
        };
        if (existingVote) {
            if (existingVote.type === type) {
                // Remove vote if the same type already exists
                await existingVote.deleteOne();
                decrementAnalytics(type + 's');
            }
            else if (type !== 'special' && existingVote.type !== 'special') {
                // Change vote type between upvote/downvote
                decrementAnalytics(existingVote.type + 's');
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
                    decrementAnalytics(existingVote.type + 's');
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
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.votePost = votePost;
const checkVote = async (req, res, next) => {
    try {
        const { postId, userId } = req.query;
        const postVote = await postVoteModel_1.default.find({ user: new mongoose_1.default.Types.ObjectId(userId), post: new mongoose_1.default.Types.ObjectId(postId) });
        if (!postVote) {
            res.status(404).json({
                success: false,
                voted: false
            });
        }
        else {
            console.log(postVote, 'here is ============================>');
            res.status(200).json({
                success: true,
                voted: true,
                vote: postVote
            });
        }
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.checkVote = checkVote;
