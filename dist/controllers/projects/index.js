"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteProject = exports.createProject = void 0;
const error_1 = require("../../middlewares/error");
const processDouments_1 = require("../../helpers/processDouments");
const projectModel_1 = __importDefault(require("../../models/projectModel"));
const projectVoteModel_1 = __importDefault(require("../../models/projectVoteModel"));
const createProject = async (req, res, next) => {
    try {
        const { title, description, files } = req.body;
        if (!title || !files)
            return next(new error_1.CustomError(("Text or Media is required")));
        const filesInfo = await (0, processDouments_1.processFiles)(files);
        // Create a new bid
        const newProject = new projectModel_1.default({
            postedBy: req.user._id,
            title,
            description,
            files: filesInfo?.map(doc => ({
                fileName: doc?.fileName,
                fileUrl: doc?.getUrl,
                key: doc?.key,
                ...doc
            }))
        });
        res.json({
            success: true,
            message: "Project created successfully",
            project: newProject,
            signedUrl: filesInfo?.map(doc => doc?.putUrl)
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.createProject = createProject;
const voteProject = async (req, res, next) => {
    try {
        const { projectId, userId, type } = req.query;
        if (!projectId || !userId) {
            return next(new error_1.CustomError("Post ID and User ID are required.", 404));
        }
        if (!["upvote", "downvote", "special"].includes(type)) {
            return next(new error_1.CustomError("Invalid vote type.", 400));
        }
        const existingVote = await projectVoteModel_1.default.findOne({ user: userId, project: projectId });
        const project = await projectModel_1.default.findById(projectId);
        if (!project)
            return next(new error_1.CustomError("Project does not exist", 404));
        if (existingVote) {
            if (existingVote.type === type) {
                // Remove vote if the same type already exists
                await existingVote.deleteOne();
                project.analytics[type + 's'] -= 1;
            }
            else if (type !== 'special' && existingVote.type !== 'special') {
                // Change vote type between upvote/downvote
                project.analytics[existingVote.type + 's'] -= 1;
                existingVote.type = type;
                project.analytics[type + 's'] += 1;
                await existingVote.save();
            }
            else {
                // Handle special vote independently
                if (type === 'special') {
                    await projectVoteModel_1.default.create({
                        user: userId,
                        project: projectId,
                        type: type
                    });
                    project.analytics.special += 1;
                }
                else {
                    project.analytics[existingVote.type + 's'] -= 1;
                    await existingVote.deleteOne();
                    await projectVoteModel_1.default.create({
                        user: userId,
                        project: projectId,
                        type: type
                    });
                    project.analytics[type + 's'] += 1;
                }
            }
        }
        else {
            // Create new vote
            await projectVoteModel_1.default.create({
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
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.voteProject = voteProject;
