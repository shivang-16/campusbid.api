"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const S3 = new client_s3_1.S3Client({
    region: process.env.CAMPUSBID_AWS_REGION,
    credentials: {
        accessKeyId: process.env.CAMPUSBID_AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.CAMPUSBID_AWS_SECRET_KEY || '',
    },
});
exports.default = S3;
