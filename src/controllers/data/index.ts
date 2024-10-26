import { Request, Response, NextFunction } from "express";
import { db } from "../../db/db";

// Search for Cities
export const searchCities = async (req: Request, res: Response, next: NextFunction) => {
    const searchTerm = req.query.q?.toString().trim() || "";
    const stateCode = req.query.stateCode?.toString().trim() || ""; 

    if (!searchTerm) {
        res.status(400).json({ message: "Search term is required." });
        return; 
    }
    try {
        const regex = new RegExp(searchTerm, "i");

        const query: any = { name: { $regex: regex } }; 

        if (stateCode) {
            query.stateCode = stateCode;
        }

        const cities = await db.collection("cities_data").find(query).limit(50).toArray();

        res.status(200).json({
            message: "Cities search results fetched successfully",
            data: cities,
        });
    } catch (error) {
        next(error);
    }
};


export const searchStates = async (req: Request, res: Response, next: NextFunction) => {
    const searchTerm = req.query.q?.toString().trim() || "";

    if (!searchTerm) {
        res.status(400).json({ message: "Search term is required." });
        return; 
    }

    try {
        const regex = new RegExp(searchTerm, "i");
        const states = await db.collection("states_data").find({ name: { $regex: regex } }).limit(50).toArray();

        res.status(200).json({
            message: "States search results fetched successfully",
            data: states,
        });
    } catch (error) {
        next(error);
    }
};

export const searchColleges = async (req: Request, res: Response, next: NextFunction) => {
    const searchTerm = req.query.q?.toString().trim() || "";

    if (!searchTerm) {
        res.status(400).json({ message: "Search term is required." });
        return; 
    }

    try {
        const regex = new RegExp(searchTerm, "i");
        const colleges = await db.collection("colleges_data").find({ College_Name: { $regex: regex } }).limit(50).toArray();

        res.status(200).json({
            message: "Colleges search results fetched successfully",
            data: colleges,
        });
    } catch (error) {
        next(error);
    }
};
