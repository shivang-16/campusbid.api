import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import checkRole from "../middlewares/checkRole";
import { closeBid, createBid, getBid, listBidders } from "../controllers/bid";

const router = express.Router();

router.post("/create", checkAuth, checkRole('freelancer'), createBid);
router.get("/list/:projectId", checkAuth, listBidders);
router.get("/find/:bidId", checkAuth, checkRole('freelancer'), getBid);
router.put("/close/:bidId", checkAuth, checkRole('freelancer'), closeBid);

export default router;
   