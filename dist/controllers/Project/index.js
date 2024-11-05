"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectStatus = exports.fetchAssignedBid = exports.assignBidToProject = exports.getProjectsListing = exports.updateSupportingDocs = exports.createProject = void 0;
const error_1 = require("../../middlewares/error");
const projectModel_1 = __importDefault(require("../../models/projectModel"));
const processDouments_1 = require("../../helpers/processDouments");
const userModel_1 = __importDefault(require("../../models/userModel"));
const bidModel_1 = __importDefault(require("../../models/bidModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const createProject = async (req, res, next) => {
    try {
        const { title, description, budget, deadline, category, skillsRequired, supportingDocs } = req.body;
        const postedBy = req.user._id; // Assuming user ID is attached to the request (e.g., from middleware)
        const user = await userModel_1.default.findById(req.user._id);
        if (!user)
            next(new error_1.CustomError("User not exists", 404));
        const docsInfo = await (0, processDouments_1.processDocuments)(supportingDocs);
        // Create a new project instance
        const newProject = new projectModel_1.default({
            title,
            description,
            budget,
            deadline,
            category,
            skillsRequired,
            postedBy,
            location: {
                city: user?.address.city,
                state: user?.address.state
            },
            college: user?.academic.schoolOrCollegeName,
            supportingDocs: docsInfo?.map(doc => ({
                fileName: doc?.name,
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
        const project = await projectModel_1.default.findById(projectId);
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
                fileName: doc?.name,
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
        const collegeProjects = await projectModel_1.default.find({ "college.College_Name": schoolOrCollegeName })
            .populate("postedBy", "college location")
            .exec();
        // Find nearby projects by location
        const nearbyProjects = await projectModel_1.default.find({
            "location.city": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: userCoordinates,
                    },
                    $maxDistance: MAX_DISTANCE,
                },
            },
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
        next(new error_1.CustomError(error.message));
    }
};
exports.getProjectsListing = getProjectsListing;
const assignBidToProject = async (req, res, next) => {
    try {
        const bidId = req.query.bidId;
        const projectId = req.query.projectId;
        const project = await projectModel_1.default.findOne({ bid: bidId });
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
        res.status(200).json({ message: "Bidder assigned to project successfully" });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.assignBidToProject = assignBidToProject;
const fetchAssignedBid = async (req, res, next) => {
    try {
        const projectId = req.query.projectId; // Explicitly cast to string
        const project = await projectModel_1.default.findById(projectId);
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
        await projectModel_1.default.findOneAndUpdate({
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
