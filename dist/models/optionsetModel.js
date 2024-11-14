"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optionset = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const optionsetSchema = new mongoose_1.default.Schema({
    option: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        default: 'general'
    },
    type: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
});
exports.Optionset = mongoose_1.default.model('Optionset', optionsetSchema);
