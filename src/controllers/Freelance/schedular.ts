import cron from "node-cron";
import User from "../../models/userModel";

// Job runs at midnight every day
cron.schedule("15 0 * * *", async () => {
  try {
   
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
