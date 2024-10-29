"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsListing = exports.updateSupportingDocs = exports.createProject = void 0;
const error_1 = require("../../middlewares/error");
const projectModel_1 = __importDefault(require("../../models/projectModel"));
const processDouments_1 = require("../../helpers/processDouments");
const userModel_1 = __importDefault(require("../../models/userModel"));
const createProject = async (req, res, next) => {
    try {
        const { title, description, budget, deadline, category, skillsRequired, supportingDocs } = req.body;
        const postedBy = req.user._id; // Assuming user ID is attached to the request (e.g., from middleware)
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
        const { city } = currentUser.address; // Assuming location has coordinates [longitude, latitude]
        // Distance in meters for nearby projects (e.g., 20km)
        const MAX_DISTANCE = 20000;
        // Find projects from the same college
        const collegeProjects = await projectModel_1.default.find({ "postedBy.college": schoolOrCollegeName })
            .populate("postedBy", "academic.college address.location") // Populate to get user data for sorting later
            .exec();
        // Find nearby projects by location
        const nearbyProjects = await projectModel_1.default.find({
            "postedBy.location": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: {}, // User's location coordinates
                    },
                    $maxDistance: MAX_DISTANCE,
                },
            },
        })
            .populate("postedBy", "academic.college address.location")
            .exec();
        // Combine and order results: same-college projects first, then nearby projects
        const projects = [...collegeProjects, ...nearbyProjects];
        res.status(200).json({
            message: "Projects fetched based on profile",
            projects,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.getProjectsListing = getProjectsListing;
