import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import Freelance_Task from "../../models/freelance_task";
import { IFreelance } from "../../types/IProject";
import { processDocuments } from "../../helpers/processDouments";
import User from "../../models/userModel";
import Bid from "../../models/bidModel";
import mongoose from "mongoose";
import { NotificationOptions, sendNotification } from "../../helpers/sendNotification";
import { EmailOptions } from "../../utils/sendMail";

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, budget, deadline, categories, skillsRequired, supportingDocs } = req.body;
        const postedBy = req.user._id; // Assuming user ID is attached to the request (e.g., from middleware)
        const user = await User.findById(req.user._id)
        if(!user) next(new CustomError("User not exists", 404))

        const docsInfo = await processDocuments(supportingDocs)
        // Create a new project instance
        const newProject: IFreelance = new Freelance_Task({
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
                fileName: doc?.fileName!,
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
            signedUrls: docsInfo?.map(doc => doc?.putUrl)

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
        const project = await Freelance_Task.findById(projectId);
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
                    fileName: doc?.fileName!,
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

export const getProjectById = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        if (!projectId) return next(new CustomError("ProjectId required", 400));

        const project = await Freelance_Task.findById(projectId).populate("postedBy skillsRequired categories").populate({
            path: "bids",  // Populate the bids array
            select: "user proposal amount currency status deliveredIn supportingDocs",  // Only select specific fields in bids
            populate: {
                path: "user",  // Populate the user inside each bid
                select: "name",  // Only select the 'name' field of user
            },
        }).populate({
            path: "assignedBid",  // Populate the assignedBid field
            select: "user proposal amount currency status deliveredIn supportingDocs",  // Only select specific fields in assignedBid
            populate: {
              path: "user",  // Populate the user inside assignedBid
              select: "name",  // Only select the 'name' field of user
            }
        }) as any;

        if (!project) return next(new CustomError("Project not exists", 404));

        // Check if the user is a client and if they are trying to access their own project
        if (req.user.role === "client" && project.postedBy._id.toString() !== req.user._id.toString()) {
            return next(new CustomError("Access denied. You can only access your own projects.", 403));
        }

        res.status(200).json({
            success: true,
            project
        });

    } catch (error) {
        console.log(error)
        next(new CustomError((error as Error).message));
    }
}

export const getProjectsListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;

        // Get the current user with academic college and location data
        const currentUser = await User.findById(userId).select("academic.schoolOrCollegeName address.city address.state");

        if (!currentUser) throw new CustomError("User not found", 404);

        const { schoolOrCollegeName } = currentUser.academic;
        const { city } = currentUser.address;

        // Assuming city has latitude and longitude
        const userCoordinates = [city.longitude, city.latitude];

        // Distance in meters for nearby projects (e.g., 40km)
        const MAX_DISTANCE = 40000;

        // Find projects from the same college
        const collegeProjects = await Freelance_Task.find({ "college.College_Name": schoolOrCollegeName?.College_Name,  postedBy: { $ne: userId } })
            .populate("postedBy", "college location")
            .exec();

        // Find nearby projects by location
        const nearbyProjects = await Freelance_Task.find({
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
    } catch (error) {
        console.log(error)
        next(new CustomError((error as Error).message));
    }
};

export const assignBidToProject = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const bidId = new mongoose.Types.ObjectId(req.query.bidId as string) ; 
        const projectId = new mongoose.Types.ObjectId(req.query.projectId as string);

        if (!projectId || !bidId) return next(new CustomError("ProjectId and BidId are required"));

        const project = await Freelance_Task.findOne({ bids: bidId });
        if (!project) return next(new CustomError("Project not exists", 400));

        const bid = await Bid.findById(bidId)
        if (!bid) return next(new CustomError("Bid not exists", 400));
        
        const bids = await Bid.find({projectId});
        if (!bids) return next(new CustomError("No Bid not exists", 400));

        project.assignedBid = new mongoose.Types.ObjectId(bidId);
        project.status = "in_progress"; // updating project status
        bid.status = "accepted"; // updating bid status
        
        const unassignedBids = bids.filter(bid => bid._id === project.assignedBid)
        for (let unassignedBid of unassignedBids) {
            unassignedBid.status = "rejected"
            await unassignedBid.save()
        }

        await bid.save()
        await project.save(); 

        const notification: NotificationOptions = {
            senderId: req.user._id,
            receiverId: bid.user,
            message: "Bid Assigned",
            projectId: projectId.toString(),
            bidId: bidId.toString()
        }

        const bidUser = await User.findById(bid.user)
        if(!bidUser) return next(new CustomError("User not exists", 500))

        const email: EmailOptions = {
            email: bidUser.email,
            subject: "Bid assigned succesfully",
            message: `Your bid is assigned to project ${projectId}`
        }

        await sendNotification(notification, email)

        res.status(200).json({ success: true, message: "Bidder assigned to project successfully" });
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}

export const fetchAssignedBid = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const projectId = req.query.projectId as string; // Explicitly cast to string

        const project = await Freelance_Task.findById(projectId);
        if (!project) return next(new CustomError("Project not exists", 400));
        
        const bid = await Bid.findById(project.assignedBid);
        if (!bid) return next(new CustomError("Bid not exists", 400));

        res.status(200).json({
            success: true,
            bid
        })

    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}


export const updateProjectStatus = async(req: Request, res: Response, next: NextFunction) => {
   try {
      const { status } = req.query 
      const { projectId } = req.params

      if(!status) return next(new CustomError("Please provide status"))

      const statusTypes = ['open', 'in_progress', 'completed', 'closed']

      if(!statusTypes.includes(status?.toString())) return next(new CustomError(`Status must be from ${statusTypes}`, 400))

      if( status === 'completed' || status === 'closed' && req.user.status === 'in_progress') return next(new CustomError("Project status is in progress. We need assigned bidder approval"))

      await Freelance_Task.findOneAndUpdate({
        _id: new mongoose.Types.ObjectId(projectId)
      },{
        $set: {
            status: status
        }
      }
    )
   } catch (error) {
    next(new CustomError((error as Error).message));
   }
}