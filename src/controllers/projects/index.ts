import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { processDocuments, processFiles } from "../../helpers/processDouments";
import Project from "../../models/projectModel";
import ProjectVote from "../../models/projectVoteModel";

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, files } = req.body

        if (!title || !files) return next(new CustomError(("Text or Media is required")))
        
        const filesInfo = await processFiles(files)

        // Create a new bid
        const newProject = new Project({
            postedBy: req.user._id,
            title,
            description,
            files: filesInfo?.map(doc => ({
                fileName: doc?.fileName!,
                fileUrl: doc?.getUrl!,
                key: doc?.key!,
                ...doc
            }))
        });
        
        res.json({
            success: true,
            message: "Project created successfully",
            project: newProject,
        })
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}


export const voteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId, userId, type } = req.query as { projectId: string, userId: string, type: string };

        if (!projectId || !userId) {
            return next(new CustomError("Post ID and User ID are required.", 404));
        }

        if (!["upvote", "downvote", "special"].includes(type)) {
            return next(new CustomError("Invalid vote type.", 400));
        }

        const existingVote = await ProjectVote.findOne({ user: userId, project: projectId });

        const project = await Project.findById(projectId) as any;
        if (!project) return next(new CustomError("Project does not exist", 404));

        if (existingVote) {
            if (existingVote.type === type) {
                // Remove vote if the same type already exists
                await existingVote.deleteOne();
                project.analytics[type + 's'] -= 1;
            } else if (type !== 'special' && existingVote.type !== 'special') {
                // Change vote type between upvote/downvote
                project.analytics[existingVote.type + 's'] -= 1;
                existingVote.type = type as "upvote" | "downvote" | "special";
                project.analytics[type + 's'] += 1;
                await existingVote.save();
            } else {
                // Handle special vote independently
                if (type === 'special') {
                    await ProjectVote.create({
                        user: userId,
                        project: projectId,
                        type: type
                    });
                    project.analytics.special += 1;
                } else {
                    project.analytics[existingVote.type + 's'] -= 1;
                    await existingVote.deleteOne();
                    await ProjectVote.create({
                        user: userId,
                        project: projectId,
                        type: type
                    });
                    project.analytics[type + 's'] += 1;
                }
            }
        } else {
            // Create new vote
            await ProjectVote.create({
                user: userId,
                project: projectId,
                type: type
            });
            project.analytics[type + 's'] += 1;
        }

        await project.save();

        res.status(200).json({
            success: true,
            message: `${type} successfully`
        });

    } catch (error) {
        next(new CustomError((error as Error).message));
    }
};
