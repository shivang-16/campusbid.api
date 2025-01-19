"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Following = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const followingSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});
followingSchema.index({ userId: 1, followingId: 1 }, { unique: true });
exports.Following = mongoose_1.default.model('Following', followingSchema);
