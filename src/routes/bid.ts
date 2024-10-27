import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import checkRole from "../middlewares/checkRole";
import { closeBid, createBid, getBid, listBidders } from "../controllers/bid";

const router = express.Router();

router.post("/create", checkAuth, checkRole('provider'), createBid);
router.get("/list/:projectId", checkAuth, listBidders);
router.get("/find/:bidId", checkAuth, checkRole('provider'), getBid);
router.put("/close/:bidId", checkAuth, checkRole('provider'), closeBid);

export default router;
   