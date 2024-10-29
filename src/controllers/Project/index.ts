import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import Project from "../../models/projectModel";
import { IProject } from "../../types/IProject";
import { processDocuments } from "../../helpers/processDouments";
import User from "../../models/userModel";
import { db } from "../../db/db";

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, budget, deadline, category, skillsRequired, supportingDocs } = req.body;
        const postedBy = req.user._id; // Assuming user ID is attached to the request (e.g., from middleware)

        const docsInfo = await processDocuments(supportingDocs)
        // Create a new project instance
        const newProject: IProject = new Project({
            title,
            description,
            budget,
            deadline,
            category,
            skillsRequired,
            postedBy,
            supportingDocs: docsInfo?.map(doc => ({
                fileName: doc?.name!,
                fileUrl: doc?.getUrl!,
                key: doc?.key!,
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
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
};


export const updateSupportingDocs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        const { docsToRemove, newSupportingDocs } = req.body; // Expect docsToRemove as an array of document keys or filenames

        // Find the project by ID and ensure it exists
        const project = await Project.findById(projectId);
        if (!project) {
            throw new CustomError("Project not found.", 404);
        }

        // Filter out documents to be removed from existing supportingDocs
        if(docsToRemove) {
            project.supportingDocs = project.supportingDocs.filter(doc => !docsToRemove.includes(doc.key));
        }

        // If new supporting documents are provided, process and add them to the array
        if (newSupportingDocs && newSupportingDocs.length > 0) {
            const newDocsInfo = await processDocuments(newSupportingDocs);
            project.supportingDocs.push(
                ...newDocsInfo.map(doc => ({
                    fileName: doc?.name!,
                    fileUrl: doc?.getUrl!,
                    key: doc?.key!,
                    ...doc
                }))
            );
        }

        // Save the updated project document
        await project.save();

        // Respond with updated project data
        res.status(200).json({
            message: "Supporting documents updated successfully",
            project: project,
        });
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
};

export const getProjectsListing = async (req: Request, res: Response, next: NextFunction) => {

   
    try {
        const userId = req.user._id;

        // Get the current user with academic college and location data
        const currentUser = await User.findById(userId).select("academic.schoolOrCollegeName address.city address.state");

        if (!currentUser) throw new CustomError("User not found", 404);

        const { schoolOrCollegeName } = currentUser.academic;
        const { city } = currentUser.address; // Assuming location has coordinates [longitude, latitude]

        // Distance in meters for nearby projects (e.g., 20km)
        const MAX_DISTANCE = 20000;

        // Find projects from the same college
        const collegeProjects = await Project.find({ "postedBy.college": schoolOrCollegeName })
            .populate("postedBy", "academic.college address.location") // Populate to get user data for sorting later
            .exec();

        // Find nearby projects by location
        const nearbyProjects = await Project.find({
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
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
};