"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const supportingDocModel_1 = require("./helper/supportingDocModel");
const { Schema, model } = mongoose_1.default;
const ProjectSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000,
    },
    budget: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    },
    deadline: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'completed', 'closed'],
        default: 'open',
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bids: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            amount: { type: Number, required: true },
            message: { type: String, maxlength: 500 },
            bidDate: { type: Date, default: Date.now },
        },
    ],
    category: {
        type: String,
        enum: ['writing', 'design', 'development', 'data-entry', 'marketing'],
        required: true,
    },
    skillsRequired: [
        {
            type: String,
            trim: true,
        },
    ],
    supportingDocs: [supportingDocModel_1.SupportingDocSchema], // Array of supporting documents
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
ProjectSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const Project = model('Project', ProjectSchema);
exports.default = Project;
