import express from "express";
import {
  listUserBids,
  listUsersProjects,
  savePersonalInfo,
  updateUserMode
} from "../controllers/user";
import { checkAuth } from "../middlewares/checkAuth";
import checkRole from "../middlewares/checkRole";

const router = express.Router();

// all
router.post("/save/info", checkAuth, savePersonalInfo);
router.put("/update/mode", checkAuth, updateUserMode);
router.get("/list/projects", checkAuth, listUsersProjects);

// providers
router.get("/list/bids", checkAuth, checkRole("freelancer"), listUserBids);

// clients


export default router;