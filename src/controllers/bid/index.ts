import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import Bid from "../../models/bidModel";
import Project from "../../models/projectModel"; // Assuming Project model is available
import { processDocuments } from "../../helpers/processDouments";
import { sendMail } from "../../utils/sendMail";

export const createBid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId, amount, proposal, supportingDocs } = req.body;
        const user = req.user._id; // Assuming the user ID is attached by authentication middleware

        // Validate required fields
        if (!projectId || !amount || !proposal) {
            return next(new CustomError("Project ID, amount, and proposal are required.", 404))
        }

        // Check if the project exists
        const projectExists = await Project.findById(projectId);
        if (!projectExists) {
            return next(new CustomError("Project not found.", 404))
        }

        // Check if the user has already placed a bid on this project
        const existingBid = await Bid.findOne({ projectId, user });
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
            supportingDocs: docsInfo?.map(doc => ({
                fileName: doc?.name!,
                fileUrl: doc?.getUrl!,
                key: doc?.key!,
                ...doc
              }))
        });

        // Save the bid to the database
        await newBid.save();

        projectExists?.bids.push(newBid)
        await projectExists?.save() 

        try {
            await sendMail({
                email: req.user.email,
                subject: `Application sent for ${projectExists.title}`,
                message: projectExists.title,
            })
        } catch (error) {
            console.log(error)
        }

        res.status(201).json({
            success: true,
            message: "Bid created successfully",
            bid: newBid,
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
