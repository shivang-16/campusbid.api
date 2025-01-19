"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFreelancerAssignedProjects = exports.listUsersProjects = exports.listUserBids = exports.followUser = exports.updateUserMode = exports.savePersonalInfo = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const error_1 = require("../../middlewares/error");
const processDouments_1 = require("../../helpers/processDouments");
const bidModel_1 = __importDefault(require("../../models/bidModel"));
const freelance_task_1 = __importDefault(require("../../models/freelance_task"));
const followersModel_1 = require("../../models/followersModel");
const savePersonalInfo = async (req, res, next) => {
    try {
        const bodyData = req.body;
        const user = (await userModel_1.default.findById(req.user._id));
        if (!user) {
            return next(new error_1.CustomError('User not found', 404));
        }
        if (bodyData.name) {
            user.name = bodyData.name;
        }
        if (bodyData.username) {
            user.username = bodyData.username;
        }
        if (bodyData.mode) {
            user.mode = bodyData.mode;
        }
        if (bodyData.dateOfBirth) {
            user.about.dateOfBirth = bodyData.dateOfBirth;
        }
        if (bodyData.phone) {
            user.phone.personal = bodyData.phone;
        }
        if (bodyData.gender) {
            user.about.gender = bodyData.gender;
        }
        if (bodyData.address) {
            user.address.addressLine = bodyData.address;
        }
        if (bodyData.pinCode) {
            user.address.pincode = bodyData.pinCode;
        }
        if (bodyData.country) {
            user.address.country = bodyData.country;
        }
        if (bodyData.state) {
            user.address.state = bodyData.state;
        }
        if (bodyData.city) {
            user.address.city = bodyData.city;
        }
        if (bodyData.class) {
            user.academic.standard = bodyData.standard;
        }
        if (bodyData.branch) {
            user.academic.branch = bodyData.branch;
        }
        if (bodyData.schoolOrCollegeName) {
            user.academic.schoolOrCollegeName = bodyData.schoolOrCollegeName;
        }
        if (bodyData.schoolOrCollegeAddress) {
            user.academic.schoolOrCollegeAddress = bodyData.schoolOrCollegeAddress;
        }
        if (bodyData.avatar) {
            const avatar = await (0, processDouments_1.processAvatar)(bodyData.avatar);
            user.avatar = {
                url: avatar?.getUrl,
                key: avatar?.key
            };
        }
        let docsInfo;
        if (bodyData.documents) {
            docsInfo = await (0, processDouments_1.processDocuments)(bodyData.documents);
            const newDocuments = docsInfo?.map(doc => ({
                fileName: doc?.fileName,
                fileUrl: doc?.getUrl,
                fileSize: doc?.fileSize,
                fileType: doc?.fileType,
                key: doc?.key
            }));
            // Retrieve existing documents
            const existingDocuments = user.documents || [];
            // Merge existing and new documents
            user.documents = [...existingDocuments, ...newDocuments];
        }
        user.updatedAt = new Date();
        await user.save();
        res.status(200).json({
            message: "Personal information updated successfully",
            user,
            signedUrls: docsInfo?.map(doc => doc?.putUrl)
        });
    }
    catch (error) {
        console.error("Error updating personal info:", error);
        next(new error_1.CustomError(error.message));
    }
};
exports.savePersonalInfo = savePersonalInfo;
const updateUserMode = async (req, res, next) => {
    try {
        const { mode } = req.body;
        const user = await userModel_1.default.findById(req.user._id);
        if (!user)
            return next(new error_1.CustomError("User not exists", 404));
        if (user.role !== "client")
            return next(new error_1.CustomError("Anonymous mode is for clients only"));
        user.mode = mode;
        await user.save();
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.updateUserMode = updateUserMode;
const followUser = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const user = await userModel_1.default.findById(req.user._id);
        if (!user)
            return next(new error_1.CustomError("User not exists", 404));
        const followedUser = await userModel_1.default.findById(userId);
        if (!followedUser)
            return next(new error_1.CustomError("User not exists", 404));
        // Check if already following
        const existingFollow = await followersModel_1.Follower.findOne({
            userId: user._id,
            followerId: followedUser._id
        });
        if (existingFollow) {
            // If already following, remove from follower list
            await followersModel_1.Follower.deleteOne({
                userId: user._id,
                followerId: followedUser._id
            });
            res.status(200).json({
                success: true,
                message: "User unfollowed"
            });
        }
        else {
            // If not following, create a new follower entry
            await followersModel_1.Follower.create({
                userId: user._id,
                followerId: followedUser._id
            });
            res.status(200).json({
                success: true,
                message: "User followed"
            });
        }
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.followUser = followUser;
const listUserBids = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = { user: req.user._id };
        if (status)
            query.status = status;
        console.log(query);
        const bids = await bidModel_1.default.find(query).populate({
            path: "projectId",
            select: "title _id",
        });
        res.status(200).json({
            success: true,
            bids
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.listUserBids = listUserBids;
const listUsersProjects = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = { postedBy: req.user._id };
        if (status)
            query.status = status;
        console.log(query, "her eis qyer", req.user._id);
        const projects = await freelance_task_1.default.find(query);
        console.log(projects, "here");
        res.status(200).json({
            success: true,
            projects
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.listUsersProjects = listUsersProjects;
// this controller is for freelancer route
const listFreelancerAssignedProjects = async (req, res, next) => {
    try {
        const { status } = req.query;
        // Find all bids by the user
        const bids = await bidModel_1.default.find({ user: req.user._id });
        // Extract project IDs from the bids
        const projectIds = bids.map(bid => bid.projectId);
        // Find projects based on the extracted project IDs and optional status
        const query = { _id: { $in: projectIds } };
        if (status) {
            query.status = status;
        }
        const projects = await freelance_task_1.default.find(query);
        res.status(200).json({
            success: true,
            projects
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.listFreelancerAssignedProjects = listFreelancerAssignedProjects;
