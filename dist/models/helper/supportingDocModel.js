"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportingDocSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
exports.SupportingDocSchema = new Schema({
    fileName: {
        type: String,
        required: true,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
    },
    fileSize: {
        type: Number, // in bytes
        min: 0,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false } // _id is set to false as we don’t need unique ids for each document
);
