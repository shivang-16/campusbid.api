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
const PostSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
    media: { type: [supportingDocModel_1.SupportingDocSchema], default: [] },
    analytics: {
        views: { type: Number, default: 0 },
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        special: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
    },
    isComment: {
        comment: { type: Boolean, required: true, default: false },
        post: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Post' },
    },
}, { timestamps: true });
PostSchema.index({ user: 1, createdAt: -1 });
// Pre-save hook to calculate and set the engagement
PostSchema.pre('save', function (next) {
    this.analytics.engagement = this.analytics.views + this.analytics.upvotes + this.analytics.downvotes + this.analytics.special;
    next();
});
// Validation for conditional requirement of `post` when `comment` is true
PostSchema.pre('save', function (next) {
    if (this.isComment.comment && !this.isComment.post) {
        return next(new Error('Post field is required if this document is a comment.'));
    }
    next();
});
const Post = mongoose_1.default.model('Post', PostSchema);
exports.default = Post;
