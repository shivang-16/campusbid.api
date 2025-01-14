"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveWaitlistCampusbid = exports.saveWaitlist = void 0;
const error_1 = require("../../middlewares/error");
const mongoose_1 = __importDefault(require("mongoose"));
const saveWaitlist = async (req, res, next) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const collection = mongoose_1.default.connection.collection('jobflow_waitlists');
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists in the waitlist" });
        }
        await collection.insertOne({ email });
        res.status(201).json({ message: "Email added to the waitlist" });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.saveWaitlist = saveWaitlist;
const saveWaitlistCampusbid = async (req, res, next) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const collection = mongoose_1.default.connection.collection('campusbid_waitlists');
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists in the waitlist" });
        }
        await collection.insertOne({ email });
        res.status(201).json({ success: true, message: "You are all set to go!" });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.saveWaitlistCampusbid = saveWaitlistCampusbid;
