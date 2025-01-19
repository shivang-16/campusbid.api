"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeBid = exports.getBid = exports.listBidders = exports.createBid = void 0;
const error_1 = require("../../middlewares/error");
const bidModel_1 = __importDefault(require("../../models/bidModel"));
const freelance_task_1 = __importDefault(require("../../models/freelance_task")); // Assuming Project model is available
const processDouments_1 = require("../../helpers/processDouments");
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const sendNotification_1 = require("../../helpers/sendNotification");
const createBid = async (req, res, next) => {
    try {
        const { projectId, amount, proposal, days, supportingDocs } = req.body;
        const user = req.user._id;
        // Validate required fields
        if (!projectId || !amount || !proposal) {
            return next(new error_1.CustomError("Project ID, amount, and proposal are required.", 404));
        }
        // Check if the project exists
        const projectExists = await freelance_task_1.default.findById(projectId);
        if (!projectExists) {
            return next(new error_1.CustomError("Project not found.", 404));
        }
        if (projectExists.postedBy.toString() === user.toString()) {
            return next(new error_1.CustomError("You cannot place a bid on your own project.", 400));
        }
        // Check if the user has already placed a bid on this project
        const existingBid = await bidModel_1.default.findOne({ projectId: new mongoose_1.default.Types.ObjectId(projectId), user });
        if (existingBid) {
            return next(new error_1.CustomError("You have already placed a bid on this project.", 400));
        }
        const docsInfo = await (0, processDouments_1.processDocuments)(supportingDocs);
        // Create a new bid
        const newBid = new bidModel_1.default({
            projectId,
            user,
            amount,
            proposal,
            status: "pending",
            "deliveredIn.days": days,
            supportingDocs: docsInfo?.map(doc => ({
                fileName: doc?.fileName,
                fileUrl: doc?.getUrl,
                key: doc?.key,
                ...doc
            }))
        });
        // Save the bid to the database
        await newBid.save();
        projectExists?.bids.push(newBid);
        await projectExists?.save();
        const notification = {
            senderId: req.user._id,
            receiverId: projectExists.postedBy.toString(),
            message: "New Bid",
            projectId: projectId.toString(),
            bidId: newBid._id.toString()
        };
        const projectUser = await userModel_1.default.findById(projectExists.postedBy);
        if (!projectUser)
            return next(new error_1.CustomError("User not exists", 500));
        const email = {
            email: projectUser.email,
            subject: "A new bid in your project",
            message: `A user has bid in your project ${newBid._id}`
        };
        await (0, sendNotification_1.sendNotification)(notification, email);
        res.status(201).json({
            success: true,
            message: "Bid created successfully",
            bid: newBid,
            signedUrls: docsInfo?.map(doc => doc?.putUrl)
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.createBid = createBid;
const listBidders = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        // Validate required fields
        if (!projectId) {
            return next(new error_1.CustomError("Project ID is required.", 404));
        }
        const bids = await bidModel_1.default.find({ projectId });
        if (!bids)
            return next(new error_1.CustomError("No bids", 404));
        res.status(200).json({
            success: true,
            bids
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.listBidders = listBidders;
const getBid = async (req, res, next) => {
    try {
        const { bidId } = req.params;
        if (!bidId) {
            return next(new error_1.CustomError("Bid ID is required.", 404));
        }
        const bid = await bidModel_1.default.findById(bidId).populate({
            path: "user",
            select: "name",
        });
        if (!bid)
            return next(new error_1.CustomError("Bid not exists", 404));
        res.status(200).json({
            success: true,
            bid
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.getBid = getBid;
const closeBid = async (req, res, next) => {
    try {
        const { bidId } = req.params;
        if (!bidId) {
            return next(new error_1.CustomError("Bid ID is required.", 404));
        }
        const bid = await bidModel_1.default.findById(bidId);
        if (!bid)
            return next(new error_1.CustomError("Bid not exists", 404));
        bid.status = 'closed';
        await bid.save();
        res.status(200).json({
            success: true,
            message: "Bid closed"
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.closeBid = closeBid;
