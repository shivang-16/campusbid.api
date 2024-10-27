import { Request, Response, NextFunction } from "express";
import { db } from "../../db/db";

// Search for Cities
export const searchCities = async (req: Request, res: Response, next: NextFunction) => {
    const searchTerm = req.query.q?.toString().trim() || "";
    const stateCode = req.query.stateCode?.toString().trim() || ""; 

    try {
        const regex = new RegExp(searchTerm, "i");

        const query: any = {};
        
        if(searchTerm) {
            query.name = { $regex: regex }
        }

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


    try {
        let states;
        if(searchTerm) {
            const regex = new RegExp(searchTerm, "i");
            states = await db.collection("states_data").find({ name: { $regex: regex } }).limit(50).toArray();
        } else {
            states = await db.collection("states_data").find().limit(50).toArray();
        }
   

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

    try {
        let colleges;
        if (searchTerm) {
            const regex = new RegExp(searchTerm, "i");
            colleges = await db.collection("colleges_data").find({ College_Name: { $regex: regex } }).limit(50).toArray();
        } else {
            colleges = await db.collection("colleges_data").find().limit(50).toArray();
        }

        res.status(200).json({
            message: "Colleges search results fetched successfully",
            data: colleges,
        });
    } catch (error) {
        next(error);
    }
};

