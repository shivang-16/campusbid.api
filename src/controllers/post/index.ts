import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { processFiles } from "../../helpers/processDouments";
import Post from "../../models/postModel";
import PostVote from "../../models/postVoteModel";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text, files, isComment, type } = req.body;
        console.log(req.body)

        // Validate type
        if (!['post', 'spill'].includes(type)) {
            return next(new CustomError("Invalid type. Must be 'post' or 'spill'.", 400));
        }

        // Validate either text or files along with type
        if ((!text && !files) || (!type)) {
            return next(new CustomError("Either 'text' with 'type' or 'files' with 'type' is required.", 400));
        }

        // If both text and files are absent
        if (!text && !files) {
            return next(new CustomError("Both 'text' and 'files' cannot be empty.", 400));
        }

        // If files are provided, process them
        let filesInfo = [] as { putUrl: string, getUrl: string, key: string, fileName: string, type: string }[];
        if (files) {
            filesInfo = files
        }

        // Create a new bid
        const newPost = await Post.create({
            user: req.user._id,
            text,
            isComment,
            type,
            files: filesInfo?.map(doc => ({
                fileUrl: doc?.getUrl!,
                ...doc
              }))
        });
        
        res.json({
            success: true,
            message: "Post created successfully",
            post: newPost,
            signedUrls: filesInfo?.map(doc => doc?.putUrl)
        })
    } catch (error) {
        console.log(error)
        next(new CustomError((error as Error).message));
    }
}

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await Post.find().populate("user").sort({ createdAt: -1 });
        res.json({
            success: true,
            posts
        })
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}

export const votePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId, userId, type } = req.query as { postId: string, userId: string, type: string };

        if (!postId || !userId) {
            return next(new CustomError("Post ID and User ID are required.", 404));
        }

        if (!["upvote", "downvote", "special"].includes(type)) {
            return next(new CustomError("Invalid vote type.", 400));
        }

        const existingVote = await PostVote.findOne({ user: userId, post: postId });

        const post = await Post.findById(postId) as any;
        if (!post) return next(new CustomError("Post does not exist", 404));

        if (existingVote) {
            if (existingVote.type === type) {
                // Remove vote if the same type already exists
                await existingVote.deleteOne();
                post.analytics[type + 's'] -= 1;
            } else if (type !== 'special' && existingVote.type !== 'special') {
                // Change vote type between upvote/downvote
                post.analytics[existingVote.type + 's'] -= 1;
                existingVote.type = type as "upvote" | "downvote" | "special";
                post.analytics[type + 's'] += 1;
                await existingVote.save();
            } else {
                // Handle special vote independently
                if (type === 'special') {
                    await PostVote.create({
                        user: userId,
                        post: postId,
                        type: type
                    });
                    post.analytics.special += 1;
                } else {
                    post.analytics[existingVote.type + 's'] -= 1;
                    await existingVote.deleteOne();
                    await PostVote.create({
                        user: userId,
                        post: postId,
                        type: type
                    });
                    post.analytics[type + 's'] += 1;
                }
            }
        } else {
            // Create new vote
            await PostVote.create({
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

    } catch (error) {
        next(new CustomError((error as Error).message));
    }
};
