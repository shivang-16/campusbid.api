import express from "express";
import {
  createProject,
  getProjectBasedOnProfile
} from "../controllers/Project";
import { checkAuth } from "../middlewares/checkAuth";

const   router = express.Router();

router.post("/create", checkAuth, createProject);
router.get("/get", checkAuth, getProjectBasedOnProfile);


export default router;
   