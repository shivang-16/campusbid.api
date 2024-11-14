"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = exports.searchColleges = exports.searchStates = exports.searchCities = void 0;
const db_1 = require("../../db/db");
const error_1 = require("../../middlewares/error");
const optionsetModel_1 = require("../../models/optionsetModel");
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
        next(new error_1.CustomError(error.message));
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
        next(new error_1.CustomError(error.message));
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
        next(new error_1.CustomError(error.message));
    }
};
exports.searchColleges = searchColleges;
const getOptions = async (req, res, next) => {
    try {
        const { option, type } = req.query;
        const searchTerm = req.query.q?.toString().trim() || "";
        if (!option)
            return next(new error_1.CustomError("Option parameter is required in query", 400));
        const query = { option };
        if (type)
            query.type = type;
        // If a searchTerm is provided, use it to filter the options
        if (searchTerm) {
            const regex = new RegExp(searchTerm, "i");
            query.value = regex;
        }
        const options = await optionsetModel_1.Optionset.find(query).limit(50);
        console.log(options.length, "her eis the ");
        res.status(200).json({
            success: true,
            options
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.getOptions = getOptions;
