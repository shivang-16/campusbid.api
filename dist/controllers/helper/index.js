"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = void 0;
const processDouments_1 = require("../../helpers/processDouments");
const error_1 = require("../../middlewares/error");
const uploadFiles = async (req, res, next) => {
    try {
        const files = req.body;
        console.log(files, "here is req body");
        if (!files)
            return next(new error_1.CustomError("Files are required", 400));
        const filesInfo = await (0, processDouments_1.processFiles)(files);
        console.log(filesInfo, "here is fileinofo");
        res.json({
            success: true,
            message: "Files processed successfully",
            files: filesInfo
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.uploadFiles = uploadFiles;
