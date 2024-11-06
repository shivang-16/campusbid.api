import express from "express";
import {
  listFreelancerAssignedProjects,
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


// freelancer
router.get("/list/bids", checkAuth, checkRole("freelancer"), listUserBids);
router.get("/freelancer/list/projects", checkAuth, checkRole("freelancer"), listFreelancerAssignedProjects);

// clients
router.get("/client/list/projects", checkAuth, checkRole("client"), listUsersProjects);


export default router;