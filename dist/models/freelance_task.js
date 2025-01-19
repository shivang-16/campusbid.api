"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const supportingDocModel_1 = require("./helper/supportingDocModel");
const locationDataModels_1 = require("./helper/locationDataModels");
const { Schema, model } = mongoose_1.default;
const freelanceSchema = new Schema({
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
    budget: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        currency: { type: String, default: "INR" }
    },
    deadline: {
        type: Schema.Types.Mixed,
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'completed', 'closed'],
        default: 'open',
    },
    assignedBid: {
        type: Schema.Types.ObjectId,
        ref: "Bid"
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bids: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Bid',
        },
    ],
    categories: [{
            type: String,
            trim: true,
            ref: "Optionset"
        }],
    skillsRequired: [
        {
            type: String,
            trim: true,
            ref: "Optionset"
        },
    ],
    supportingDocs: [supportingDocModel_1.SupportingDocSchema], // Array of supporting documents
    college: locationDataModels_1.collegeSchema,
    location: {
        city: locationDataModels_1.citySchema,
        state: locationDataModels_1.stateSchema
    },
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
freelanceSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const Freelance_Task = model('Freelance_Task', freelanceSchema);
exports.default = Freelance_Task;
