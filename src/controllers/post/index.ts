import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { processDocuments } from "../../helpers/processDouments";
import Post from "../../models/postModel";
import Vote from "../../models/voteModel";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text, media, isComment } = req.body

        if (!text || !media) return next(new CustomError(("Text or Media is required")))
        
        const mediaInfo = await processDocuments(media)

        // Create a new bid
        const newPost = new Post({
            user: req.user._id,
            text,
            media: mediaInfo?.map(doc => ({
                fileName: doc?.fileName!,
                fileUrl: doc?.getUrl!,
                key: doc?.key!,
                ...doc
              }))
        });
        
        res.json({
            success: true,
            message: "Post created successfully",
            post: newPost,
        })
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}

export const votePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId, userId, type } = req.query

        if (!postId && !userId) {
            return next(new CustomError("Post ID and User ID is required.", 404));
        }

        if (type !== "upvote" && type !== "downvote") {
            return next(new CustomError("Invalid vote type.", 400));
        }

        await Vote.create({
            user: userId,
            post: postId,
            type: type
        })
        
        const post = await Post.findById(postId)
        if(!post) return next(new CustomError("Post not exists", 404))

        if (type === "upvote") {
            post!.analytics.upvotes += 1;
        } else if (type === "downvote") {
            post!.analytics.downvotes += 1;
        } else if (type === "special") {
            post!.analytics.special += 1;
        }

        await post!.save()

        res.status(200).json({
            success: true,
            message: `${type} successfully`
        })
        
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}