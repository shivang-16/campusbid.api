import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import Bid from "../../models/bidModel";
import Project from "../../models/projectModel"; // Assuming Project model is available
import { processDocuments } from "../../helpers/processDouments";

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
        const bids = await Bid.find({projectId})
        if(!bids) next(new CustomError("No bids", 404))

        res.status(200).json({
            success: true,
            bids
        })
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}
