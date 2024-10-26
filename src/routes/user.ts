import express from "express";
import {
  savePersonalInfo
} from "../controllers/user";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.post("/save/info", checkAuth, savePersonalInfo);


export default router;
   