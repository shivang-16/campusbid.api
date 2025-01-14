import { Response, Request, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import mongoose from "mongoose";

export const saveWaitlist = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const collection = mongoose.connection.collection('jobflow_waitlists');
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists in the waitlist" });
    }

    await collection.insertOne({ email });
    res.status(201).json({ message: "Email added to the waitlist" });

  } catch (error: any) {
    next(new CustomError(error.message));
  }
}

export const saveWaitlistCampusbid = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const collection = mongoose.connection.collection('campusbid_waitlists');
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists in the waitlist" });
    }

    await collection.insertOne({ email });
    res.status(201).json({ message: "Email added to the waitlist" });

  } catch (error: any) {
    next(new CustomError(error.message));
  }
}