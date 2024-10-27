import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import checkRole from "../middlewares/checkRole";
import { createBid } from "../controllers/bid";

const router = express.Router();

router.post("/create", checkAuth, checkRole('provider'), createBid);

export default router;
   