import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import Bid from "../../models/bidModel";
import Project from "../../models/freelance_task"; // Assuming Project model is available
import { processDocuments } from "../../helpers/processDouments";
import { EmailOptions } from "../../utils/sendMail";
import mongoose from "mongoose";
import User from "../../models/userModel";
import { NotificationOptions, sendNotification } from "../../helpers/sendNotification";

export const createBid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId, amount, proposal, days, supportingDocs } = req.body;
        const user = req.user._id; 

        // Validate required fields
        if (!projectId || !amount || !proposal) {
            return next(new CustomError("Project ID, amount, and proposal are required.", 404))
        }

        // Check if the project exists
        const projectExists = await Project.findById(projectId);
        if (!projectExists) {
            return next(new CustomError("Project not found.", 404))
        }

        if (projectExists.postedBy.toString() === user.toString()) {
            return next(new CustomError("You cannot place a bid on your own project.", 400));
        }

        // Check if the user has already placed a bid on this project
        const existingBid = await Bid.findOne({ projectId: new mongoose.Types.ObjectId(projectId), user });
        if (existingBid) {
            return next(new CustomError("You have already placed a bid on this project.", 400))
        }

        const docsInfo = await processDocuments(supportingDocs)

        // Create a new bid
        const newBid = new Bid({
            projectId,
            user,
            amount,
            proposal,
            status: "pending",
            "deliveredIn.days": days, 
            supportingDocs: docsInfo?.map(doc => ({
                fileName: doc?.fileName!,
                fileUrl: doc?.getUrl!,
                key: doc?.key!,
                ...doc
              }))
        });

        // Save the bid to the database
        await newBid.save();

        projectExists?.bids.push(newBid)
        await projectExists?.save() 

        const notification: NotificationOptions = {
            senderId: req.user._id,
            receiverId: projectExists.postedBy.toString(),
            message: "New Bid",
            projectId: projectId.toString(),
            bidId: newBid._id.toString()
        }

        const projectUser = await User.findById(projectExists.postedBy)
        if(!projectUser) return next(new CustomError("User not exists", 500))

        const email: EmailOptions = {
            email: projectUser.email,
            subject: "A new bid in your project",
            message: `A user has bid in your project ${newBid._id}`
        }

        await sendNotification(notification, email)

        res.status(201).json({
            success: true,
            message: "Bid created successfully",
            bid: newBid,
            signedUrls: docsInfo?.map(doc => doc?.putUrl)
        });
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
};

export const listBidders = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params
        // Validate required fields
        if (!projectId ) {
            return next(new CustomError("Project ID is required.", 404))
        }

        const bids = await Bid.find({projectId})
        if(!bids) return next(new CustomError("No bids", 404))

        res.status(200).json({
            success: true,
            bids
        })
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}

export const getBid = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { bidId } = req.params

        if (!bidId ) {
            return next(new CustomError("Bid ID is required.", 404))
        }

        const bid = await Bid.findById(bidId).populate({
                path: "user",  
                select: "name", 
            })

        if(!bid) return next(new CustomError("Bid not exists", 404))

        res.status(200).json({
            success: true,
            bid
        })
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}

export const closeBid = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { bidId } = req.params

        if (!bidId ) {
            return next(new CustomError("Bid ID is required.", 404))
        }

        const bid = await Bid.findById(bidId)
        if(!bid) return next(new CustomError("Bid not exists", 404))

        bid.status = 'closed' 
        await bid.save()
              
        res.status(200).json({
            success: true,
            message: "Bid closed"
        })
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}
