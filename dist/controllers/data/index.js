"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchColleges = exports.searchStates = exports.searchCities = void 0;
const db_1 = require("../../db/db");
// Search for Cities
const searchCities = async (req, res, next) => {
    const searchTerm = req.query.q?.toString().trim() || "";
    const stateCode = req.query.stateCode?.toString().trim() || "";
    try {
        const regex = new RegExp(searchTerm, "i");
        const query = {};
        if (searchTerm) {
            query.name = { $regex: regex };
        }
        if (stateCode) {
            query.stateCode = stateCode;
        }
        const cities = await db_1.db.collection("cities_data").find(query).limit(50).toArray();
        res.status(200).json({
            message: "Cities search results fetched successfully",
            data: cities,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchCities = searchCities;
const searchStates = async (req, res, next) => {
    const searchTerm = req.query.q?.toString().trim() || "";
    try {
        let states;
        if (searchTerm) {
            const regex = new RegExp(searchTerm, "i");
            states = await db_1.db.collection("states_data").find({ name: { $regex: regex } }).limit(50).toArray();
        }
        else {
            states = await db_1.db.collection("states_data").find().limit(50).toArray();
        }
        res.status(200).json({
            message: "States search results fetched successfully",
            data: states,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchStates = searchStates;
const searchColleges = async (req, res, next) => {
    const searchTerm = req.query.q?.toString().trim() || "";
    try {
        let colleges;
        if (searchTerm) {
            const regex = new RegExp(searchTerm, "i");
            colleges = await db_1.db.collection("colleges_data").find({ College_Name: { $regex: regex } }).limit(50).toArray();
        }
        else {
            colleges = await db_1.db.collection("colleges_data").find().limit(50).toArray();
        }
        res.status(200).json({
            message: "Colleges search results fetched successfully",
            data: colleges,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchColleges = searchColleges;
