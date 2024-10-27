"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBidders = exports.createBid = void 0;
const error_1 = require("../../middlewares/error");
const bidModel_1 = __importDefault(require("../../models/bidModel"));
const projectModel_1 = __importDefault(require("../../models/projectModel")); // Assuming Project model is available
const processDouments_1 = require("../../helpers/processDouments");
const createBid = async (req, res, next) => {
    try {
        const { projectId, amount, proposal, supportingDocs } = req.body;
        const user = req.user._id; // Assuming the user ID is attached by authentication middleware
        // Validate required fields
        if (!projectId || !amount || !proposal) {
            return next(new error_1.CustomError("Project ID, amount, and proposal are required.", 404));
        }
        // Check if the project exists
        const projectExists = await projectModel_1.default.findById(projectId);
        if (!projectExists) {
            return next(new error_1.CustomError("Project not found.", 404));
        }
        // Check if the user has already placed a bid on this project
        const existingBid = await bidModel_1.default.findOne({ projectId, user });
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
            supportingDocs: docsInfo?.map(doc => ({
                fileName: doc?.name,
                fileUrl: doc?.getUrl,
                key: doc?.key,
                ...doc
            }))
        });
        // Save the bid to the database
        await newBid.save();
        res.status(201).json({
            success: true,
            message: "Bid created successfully",
            bid: newBid,
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
        const bids = await bidModel_1.default.find({ projectId });
        if (!bids)
            next(new error_1.CustomError("No bids", 404));
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
