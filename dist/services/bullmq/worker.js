"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpWorker = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = require("dotenv");
const bullmq_1 = require("bullmq");
const sendMail_1 = require("../../utils/sendMail");
const winstonLogger_1 = require("../../utils/winstonLogger");
(0, dotenv_1.config)();
const redisUri = process.env.REDIS_URI;
const sharedConnection = new ioredis_1.default(redisUri, { maxRetriesPerRequest: null });
const workerOptions = {
    connection: sharedConnection,
    concurrency: 1,
    limiter: {
        max: 10,
        duration: 1000,
    },
    lockDuration: 60000,
    removeOnComplete: {
        age: 30000,
    },
    removeOnFail: {
        age: 20 * 24 * 60 * 60,
    },
};
// OTP Worker
exports.otpWorker = new bullmq_1.Worker("otp-queue", async (job) => {
    await (0, sendMail_1.sendMail)(job.data?.options);
    winstonLogger_1.logger.info(`Job ${job.id} completed successfully`);
}, workerOptions);
exports.otpWorker.on('failed', (job, err) => {
    if (job) {
        winstonLogger_1.logger.error(`OTP Job ${job.id} failed with error: ${err.message}`);
    }
    else {
        winstonLogger_1.logger.error(`OTP Job failed with error: ${err.message}`);
    }
});
exports.otpWorker.on('completed', (job) => {
    if (job) {
        winstonLogger_1.logger.info(`OTP Job ${job.id} completed successfully`);
    }
});
