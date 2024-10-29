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

// providers
router.get("/list/bids", checkAuth, checkRole("provider"), listUserBids);

// clients
router.get("/list/projects", checkAuth, checkRole("client"), listUsersProjects);

export default router;
   