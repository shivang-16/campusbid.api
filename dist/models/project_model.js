"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const supportingDocModel_1 = require("./helper/supportingDocModel");
const { Schema, model } = mongoose_1.default;
const projectSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        // required: true,
        // maxlength: 1000,
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    categories: [{
            type: String,
            trim: true,
            ref: "Optionset"
        }],
    media: [supportingDocModel_1.SupportingDocSchema], // Array of supporting documents
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
// Middleware to update updatedAt on each save
projectSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const Project = model('Project', projectSchema);
exports.default = Project;
