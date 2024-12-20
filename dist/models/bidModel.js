"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const supportingDocModel_1 = require("./helper/supportingDocModel");
const BidSchema = new mongoose_1.Schema({
    projectId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR"
    },
    proposal: {
        type: String,
        required: true,
        maxlength: 2000,
    },
    supportingDocs: [supportingDocModel_1.SupportingDocSchema],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'closed', 'completed'],
        default: 'pending',
    },
    deliveredIn: {
        days: Number,
        date: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
BidSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
BidSchema.pre('save', function (next) {
    if (this.isModified('deliveredIn.days')) {
        const today = new Date();
        this.deliveredIn.date = new Date(today.setDate(today.getDate() + this.deliveredIn.days));
    }
    next();
});
// Unique index on user and projectId
BidSchema.index({ user: 1, projectId: 1 }, { unique: true });
const Bid = mongoose_1.default.model('Bid', BidSchema);
exports.default = Bid;
