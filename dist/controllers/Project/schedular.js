"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
// Job runs at midnight every day
node_cron_1.default.schedule("15 0 * * *", async () => {
    try {
    }
    catch (error) {
        console.error("Error in cron job:", error);
    }
});
