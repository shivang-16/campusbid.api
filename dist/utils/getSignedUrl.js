"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectSignedUrl = exports.getPutObjectSignedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_1 = __importDefault(require("../aws/s3"));
const getPutObjectSignedUrl = async (info) => {
    try {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: info.Bucket,
            Key: info.Key,
            ContentType: info.ContentType
        });
        const requestUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_1.default, command);
        return requestUrl;
    }
    catch (error) {
        console.error("Error generating put signed URL:", error);
        throw error;
    }
};
exports.getPutObjectSignedUrl = getPutObjectSignedUrl;
const getObjectSignedUrl = async (info) => {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: info.Bucket,
            Key: info.Key,
        });
        const requestURL = await (0, s3_request_presigner_1.getSignedUrl)(s3_1.default, command);
        return requestURL;
    }
    catch (error) {
        console.error("Error generating get signed URL:", error);
        throw error;
    }
};
exports.getObjectSignedUrl = getObjectSignedUrl;
