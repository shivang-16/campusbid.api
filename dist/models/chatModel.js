"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chatSchema = new mongoose_1.default.Schema({
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    chatRoom: { type: String },
    senderName: { type: String },
    isRead: { type: Boolean, default: false },
    chatType: String
});
exports.Chat = mongoose_1.default.model('Chat', chatSchema);
