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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const locationDataModels_1 = require("./helper/locationDataModels");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        default: null,
    },
    username: {
        type: String,
        unique: true,
        editLimit: 2,
    },
    email: { type: String, required: true, unique: true, default: null },
    mode: { type: String, enum: ['public', 'anonymous'], default: "public" },
    address: {
        country: { type: String, default: null },
        city: locationDataModels_1.citySchema,
        state: locationDataModels_1.stateSchema,
        addressLine: { type: String, default: null },
        pincode: { type: Number, default: null },
    },
    academic: {
        branch: { type: String, default: null },
        standard: { type: Number, default: null },
        schoolOrCollegeName: locationDataModels_1.collegeSchema,
        schoolOrCollegeAddress: { type: String, default: null },
    },
    about: {
        dateOfBirth: { type: String, default: null },
        gender: { type: String, default: null },
    },
    password: { type: String, select: false, default: null },
    salt: { type: String, default: null },
    avatar: {
        url: { type: String, default: null },
        key: { type: String, default: null },
    },
    badges: [
        {
            name: { type: String, default: "Beginner" },
            url: { type: String, default: "default_url" },
        },
    ],
    resetPasswordToken: { type: String, default: null },
    resetTokenExpiry: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
// Pre-save hook for email validation
userSchema.pre("save", function (next) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
        return next(new Error("Please enter a valid email address"));
    }
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const hashedPassword = await new Promise((resolve, reject) => {
            crypto_1.default.pbkdf2(candidatePassword, this.salt, 1000, 64, "sha512", (err, derivedKey) => {
                if (err)
                    reject(err);
                resolve(derivedKey.toString("hex"));
            });
        });
        return hashedPassword === this.password;
    }
    catch (error) {
        throw new Error("Error comparing password.");
    }
};
userSchema.methods.getToken = async function () {
    const resetToken = crypto_1.default.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
