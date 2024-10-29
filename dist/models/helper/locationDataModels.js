"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collegeSchema = exports.stateSchema = exports.citySchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.citySchema = new mongoose_1.default.Schema({
    name: String,
    countryCode: String,
    stateCode: String,
    latitude: String,
    longitude: String
});
exports.stateSchema = new mongoose_1.default.Schema({
    name: String,
    isoCode: String,
    countryCode: String,
    latitude: String,
    longitude: String
});
exports.collegeSchema = new mongoose_1.default.Schema({
    College_Name: String,
    State: String,
    StateCode: String,
    Stream: String,
});
