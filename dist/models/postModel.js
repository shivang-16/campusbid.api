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
const analyticsSchema_1 = require("./helper/analyticsSchema");
const PostSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, maxlength: 500 },
    files: { type: [supportingDocModel_1.SupportingDocSchema], default: [] },
    analytics: analyticsSchema_1.analyticsSchema,
    type: {
        type: String,
        enum: ['post', 'spill'],
        required: true,
        default: 'post',
    },
    isComment: {
        comment: { type: Boolean, required: true, default: false },
        refPost: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Post' },
    },
    bgColor: { type: String }, // Add bgColor field to the schema
}, { timestamps: true });
PostSchema.index({ user: 1, createdAt: -1 });
// Colors array
const colorsHex = [
    "#fee2e2", "#fce7f3", "#f3e8ff", "#e0e7ff", "#ebf8ff",
    "#e6fffa", "#f0fdf4", "#fefcbf", "#ffedd5", "#ecfeff",
    "#f7fee7", "#fffbeb", "#fdf4ff", "#fff1f2", "#f5e6ff",
    "#dcfce7", "#f0f9ff", "#f8fafc", "#fafaf9", "#f5f5f4"
];
// Pre-save hook to choose a random background color before saving the post
PostSchema.pre('save', function (next) {
    // If the document is a comment, we do not set the bgColor
    if (!this.isComment.comment) {
        const randomColor = colorsHex[Math.floor(Math.random() * colorsHex.length)];
        this.bgColor = randomColor; // Set random bgColor
    }
    next();
});
// Validation for conditional requirement of `post` when `comment` is true
PostSchema.pre('save', function (next) {
    if (this.isComment.comment && !this.isComment.refPost) {
        return next(new Error('Post field is required if this document is a comment.'));
    }
    next();
});
const Post = mongoose_1.default.model('Post', PostSchema);
exports.default = Post;
