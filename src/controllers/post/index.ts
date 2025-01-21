import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { processFiles } from "../../helpers/processDouments";
import Post from "../../models/postModel";
import PostVote from "../../models/postVoteModel";
import mongoose from "mongoose";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text, files, isComment, refPost,type } = req.body;
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
            isComment: {
                comment: isComment,
                refPost: refPost? new mongoose.Types.ObjectId(refPost): undefined
            },
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
        const userId = req.user._id; // Assuming `req.user` is populated with the logged-in user's info

        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: 'postvotes', // Name of the PostVote collection in the database
                    let: { postId: '$_id', userId: new mongoose.Types.ObjectId(userId) },
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
        await Post.populate(posts, { path: 'user', select: 'name email username' });

        res.json({
            success: true,
            posts
        });
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
};

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

        if(!post.analytics){
            post.analytics = {
                upvotes: 0,
                downvotes: 0,
                special: 0,
                views: 0,
                engagement: 0
            };
        }

        const decrementAnalytics = (field: 'upvotes' | 'downvotes' | 'special') => {
            if (post.analytics[field] > 0) {
                post.analytics[field] -= 1;
            }
        };

        if (existingVote) {
            if (existingVote.type === type) {
                // Remove vote if the same type already exists
                await existingVote.deleteOne();
                decrementAnalytics(type + 's' as 'upvotes' | 'downvotes' | 'special');
            } else if (type !== 'special' && existingVote.type !== 'special') {
                // Change vote type between upvote/downvote
                decrementAnalytics(existingVote.type + 's' as 'upvotes' | 'downvotes' | 'special');
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
                    decrementAnalytics(existingVote.type + 's' as 'upvotes' | 'downvotes' | 'special');
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
        console.log(error)
        next(new CustomError((error as Error).message));
    }
};


export const checkVote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId, userId } = req.query as { postId: string, userId: string};


        const postVote = await PostVote.find({ user: new mongoose.Types.ObjectId(userId), post: new mongoose.Types.ObjectId(postId) });
        if (!postVote) {
             res.status(404).json({
                success: false,
                voted: false
            });
        } 
        else {
            console.log(postVote, 'here is ============================>')
             res.status(200).json({
                success: true,
                voted: true,
                vote: postVote
            });
        }
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}