"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    receiver: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    details: {
        message: String,
        projectId: mongoose_1.default.Schema.Types.ObjectId,
        bidId: mongoose_1.default.Schema.Types.ObjectId,
    },
    tag: String,
    unread: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
exports.Notification = mongoose_1.default.model("Notification", notificationSchema);
