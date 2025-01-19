"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectStatus = exports.fetchAssignedBid = exports.assignBidToProject = exports.getProjectsListing = exports.getProjectById = exports.updateSupportingDocs = exports.createProject = void 0;
const error_1 = require("../../middlewares/error");
const freelance_task_1 = __importDefault(require("../../models/freelance_task"));
const processDouments_1 = require("../../helpers/processDouments");
const userModel_1 = __importDefault(require("../../models/userModel"));
const bidModel_1 = __importDefault(require("../../models/bidModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const sendNotification_1 = require("../../helpers/sendNotification");
const createProject = async (req, res, next) => {
    try {
        const { title, description, budget, deadline, categories, skillsRequired, supportingDocs } = req.body;
        const postedBy = req.user._id; // Assuming user ID is attached to the request (e.g., from middleware)
        const user = await userModel_1.default.findById(req.user._id);
        if (!user)
            next(new error_1.CustomError("User not exists", 404));
        const docsInfo = await (0, processDouments_1.processDocuments)(supportingDocs);
        // Create a new project instance
        const newProject = new freelance_task_1.default({
            title,
            description,
            budget,
            deadline,
            categories,
            skillsRequired,
            postedBy,
            location: {
                city: user?.address.city,
                state: user?.address.state
            },
            college: user?.academic.schoolOrCollegeName,
            supportingDocs: docsInfo?.map(doc => ({
                fileName: doc?.fileName,
                fileUrl: doc?.getUrl,
                key: doc?.key,
                ...doc
            }))
        });
        // Save the project to the database
        await newProject.save();
        // Respond with the created project data
        res.status(201).json({
            message: "Project created successfully",
            project: newProject,
            signedUrls: docsInfo?.map(doc => doc?.putUrl)
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.createProject = createProject;
const updateSupportingDocs = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { docsToRemove, newSupportingDocs } = req.body; // Expect docsToRemove as an array of document keys or filenames
        // Find the project by ID and ensure it exists
        const project = await freelance_task_1.default.findById(projectId);
        if (!project) {
            throw new error_1.CustomError("Project not found.", 404);
        }
        // Filter out documents to be removed from existing supportingDocs
        if (docsToRemove) {
            project.supportingDocs = project.supportingDocs.filter(doc => !docsToRemove.includes(doc.key));
        }
        // If new supporting documents are provided, process and add them to the array
        if (newSupportingDocs && newSupportingDocs.length > 0) {
            const newDocsInfo = await (0, processDouments_1.processDocuments)(newSupportingDocs);
            project.supportingDocs.push(...newDocsInfo.map(doc => ({
                fileName: doc?.fileName,
                fileUrl: doc?.getUrl,
                key: doc?.key,
                ...doc
            })));
        }
        // Save the updated project document
        await project.save();
        // Respond with updated project data
        res.status(200).json({
            message: "Supporting documents updated successfully",
            project: project,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.updateSupportingDocs = updateSupportingDocs;
const getProjectById = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        if (!projectId)
            return next(new error_1.CustomError("ProjectId required", 400));
        const project = await freelance_task_1.default.findById(projectId).populate("postedBy skillsRequired categories").populate({
            path: "bids", // Populate the bids array
            select: "user proposal amount currency status deliveredIn supportingDocs", // Only select specific fields in bids
            populate: {
                path: "user", // Populate the user inside each bid
                select: "name", // Only select the 'name' field of user
            },
        }).populate({
            path: "assignedBid", // Populate the assignedBid field
            select: "user proposal amount currency status deliveredIn supportingDocs", // Only select specific fields in assignedBid
            populate: {
                path: "user", // Populate the user inside assignedBid
                select: "name", // Only select the 'name' field of user
            }
        });
        if (!project)
            return next(new error_1.CustomError("Project not exists", 404));
        // Check if the user is a client and if they are trying to access their own project
        if (req.user.role === "client" && project.postedBy._id.toString() !== req.user._id.toString()) {
            return next(new error_1.CustomError("Access denied. You can only access your own projects.", 403));
        }
        res.status(200).json({
            success: true,
            project
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.getProjectById = getProjectById;
const getProjectsListing = async (req, res, next) => {
    try {
        const userId = req.user._id;
        // Get the current user with academic college and location data
        const currentUser = await userModel_1.default.findById(userId).select("academic.schoolOrCollegeName address.city address.state");
        if (!currentUser)
            throw new error_1.CustomError("User not found", 404);
        const { schoolOrCollegeName } = currentUser.academic;
        const { city } = currentUser.address;
        // Assuming city has latitude and longitude
        const userCoordinates = [city.longitude, city.latitude];
        // Distance in meters for nearby projects (e.g., 40km)
        const MAX_DISTANCE = 40000;
        // Find projects from the same college
        const collegeProjects = await freelance_task_1.default.find({ "college.College_Name": schoolOrCollegeName?.College_Name, postedBy: { $ne: userId } })
            .populate("postedBy", "college location")
            .exec();
        // Find nearby projects by location
        const nearbyProjects = await freelance_task_1.default.find({
            "college.College_Name": { $ne: schoolOrCollegeName?.College_Name },
            postedBy: { $ne: userId }
        })
            .populate("postedBy", "college location")
            .exec();
        res.status(200).json({
            message: "Projects fetched based on profile",
            collegeProjects,
            nearbyProjects
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.getProjectsListing = getProjectsListing;
const assignBidToProject = async (req, res, next) => {
    try {
        const bidId = new mongoose_1.default.Types.ObjectId(req.query.bidId);
        const projectId = new mongoose_1.default.Types.ObjectId(req.query.projectId);
        if (!projectId || !bidId)
            return next(new error_1.CustomError("ProjectId and BidId are required"));
        const project = await freelance_task_1.default.findOne({ bids: bidId });
        if (!project)
            return next(new error_1.CustomError("Project not exists", 400));
        const bid = await bidModel_1.default.findById(bidId);
        if (!bid)
            return next(new error_1.CustomError("Bid not exists", 400));
        const bids = await bidModel_1.default.find({ projectId });
        if (!bids)
            return next(new error_1.CustomError("No Bid not exists", 400));
        project.assignedBid = new mongoose_1.default.Types.ObjectId(bidId);
        project.status = "in_progress"; // updating project status
        bid.status = "accepted"; // updating bid status
        const unassignedBids = bids.filter(bid => bid._id === project.assignedBid);
        for (let unassignedBid of unassignedBids) {
            unassignedBid.status = "rejected";
            await unassignedBid.save();
        }
        await bid.save();
        await project.save();
        const notification = {
            senderId: req.user._id,
            receiverId: bid.user,
            message: "Bid Assigned",
            projectId: projectId.toString(),
            bidId: bidId.toString()
        };
        const bidUser = await userModel_1.default.findById(bid.user);
        if (!bidUser)
            return next(new error_1.CustomError("User not exists", 500));
        const email = {
            email: bidUser.email,
            subject: "Bid assigned succesfully",
            message: `Your bid is assigned to project ${projectId}`
        };
        await (0, sendNotification_1.sendNotification)(notification, email);
        res.status(200).json({ success: true, message: "Bidder assigned to project successfully" });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.assignBidToProject = assignBidToProject;
const fetchAssignedBid = async (req, res, next) => {
    try {
        const projectId = req.query.projectId; // Explicitly cast to string
        const project = await freelance_task_1.default.findById(projectId);
        if (!project)
            return next(new error_1.CustomError("Project not exists", 400));
        const bid = await bidModel_1.default.findById(project.assignedBid);
        if (!bid)
            return next(new error_1.CustomError("Bid not exists", 400));
        res.status(200).json({
            success: true,
            bid
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.fetchAssignedBid = fetchAssignedBid;
const updateProjectStatus = async (req, res, next) => {
    try {
        const { status } = req.query;
        const { projectId } = req.params;
        if (!status)
            return next(new error_1.CustomError("Please provide status"));
        const statusTypes = ['open', 'in_progress', 'completed', 'closed'];
        if (!statusTypes.includes(status?.toString()))
            return next(new error_1.CustomError(`Status must be from ${statusTypes}`, 400));
        if (status === 'completed' || status === 'closed' && req.user.status === 'in_progress')
            return next(new error_1.CustomError("Project status is in progress. We need assigned bidder approval"));
        await freelance_task_1.default.findOneAndUpdate({
            _id: new mongoose_1.default.Types.ObjectId(projectId)
        }, {
            $set: {
                status: status
            }
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.updateProjectStatus = updateProjectStatus;
