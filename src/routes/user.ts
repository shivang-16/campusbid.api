import express from "express";
import {
  savePersonalInfo,
  updateUserMode
} from "../controllers/user";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.post("/save/info", checkAuth, savePersonalInfo);
router.put("/update/mode", checkAuth, updateUserMode);


export default router;
   