import { NextFunction, Request, Response } from "express";
import { processFiles } from "../../helpers/processDouments";
import { CustomError } from "../../middlewares/error";

export const uploadFiles = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const files  = req.body;

        console.log(files, "here is req body")
        if(!files) return next(new CustomError("Files are required", 400))

        const filesInfo = await processFiles(files);

        console.log(filesInfo, "here is fileinofo")
        
        res.json({
            success: true,
            message: "Files processed successfully",
            files: filesInfo
        })
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
}