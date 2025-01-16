import Redis from "ioredis";
import { config } from "dotenv";
import { Worker, WorkerOptions } from "bullmq";
import { sendMail } from "../../utils/sendMail";
import { logger } from "../../utils/winstonLogger";

config();

const redisUri = process.env.REDIS_URI as string;
const sharedConnection = new Redis(redisUri, { maxRetriesPerRequest: null });

const workerOptions: WorkerOptions = {
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
export const otpWorker = new Worker(
  "otp-queue",
  async (job) => {
    await sendMail(job.data?.options);
    logger.info(`Job ${job.id} completed successfully`);
  },
  workerOptions
);

otpWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`OTP Job ${job.id} failed with error: ${err.message}`);
  } else {
    logger.error(`OTP Job failed with error: ${err.message}`);
  }
});

otpWorker.on('completed', (job) => {
  if (job) {
    logger.info(`OTP Job ${job.id} completed successfully`);
  }
});

