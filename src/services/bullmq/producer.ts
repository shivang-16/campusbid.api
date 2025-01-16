import { Queue } from "bullmq";
import { Redis, RedisOptions } from "ioredis";
import { config } from "dotenv";
config();

const redisUri = process.env.REDIS_URI as string;

const redisConnection = new Redis(redisUri);

// Reuse the ioredis instance
export const otpQueue = new Queue("otp-queue", { connection: redisConnection });