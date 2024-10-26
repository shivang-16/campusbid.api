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

export const getProjectBasedOnProfile = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const colleges = await db.collection("colleges_data").find().toArray();
        
        for (const college of colleges) {
            console.log(college.State)
            // Find the state data, trimming whitespace and using case-insensitive matching for accuracy
            const stateData = await db.collection("states_data").findOne({ 
                name: { $regex: new RegExp(`^${college.State.trim()}$`, "i") } 
            });
            
            const stateCode = stateData?.isoCode || null; // Default to `null` if no match found
            
            // Update the document with `stateCode` (will create field if it doesn’t exist)
            await db.collection("colleges_data").updateOne(
                { _id: college._id },
                { $set: { stateCode } }
            );
            
            if (stateCode) {
                console.log(`Updated college: ${college.College_Name} with stateCode: ${stateCode}`);
            } else {
                console.warn(`State code not found for state: ${college.State} in college: ${college.College_Name}`);
            }
        }

        console.log("State code update for all colleges is complete.");
    } catch (error) {
        console.error("Error updating state code in college data:", error);
    }
    // try {
    //     const userId = req.user._id;

    //     // Get the current user with academic college and location data
    //     const currentUser = await User.findById(userId).select("academic.college address.city address.location");

    //     if (!currentUser) throw new CustomError("User not found", 404);

    //     const { college } = currentUser.academic;
    //     const { location } = currentUser.address; // Assuming location has coordinates [longitude, latitude]

    //     // Distance in meters for nearby projects (e.g., 20km)
    //     const MAX_DISTANCE = 20000;

    //     // Find projects from the same college
    //     const collegeProjects = await Project.find({ "postedBy.college": college })
    //         .populate("postedBy", "academic.college address.location") // Populate to get user data for sorting later
    //         .exec();

    //     // Find nearby projects by location
    //     const nearbyProjects = await Project.find({
    //         "postedBy.location": {
    //             $near: {
    //                 $geometry: {
    //                     type: "Point",
    //                     coordinates: location.coordinates, // User's location coordinates
    //                 },
    //                 $maxDistance: MAX_DISTANCE,
    //             },
    //         },
    //     })
    //     .populate("postedBy", "academic.college address.location")
    //     .exec();

    //     // Combine and order results: same-college projects first, then nearby projects
    //     const projects = [...collegeProjects, ...nearbyProjects];

    //     res.status(200).json({
    //         message: "Projects fetched based on profile",
    //         projects,
    //     });
    // } catch (error) {
    //     next(new CustomError((error as Error).message));
    // }
};