import express from "express";
import {
  assignBidToProject,
  createProject,
  fetchAssignedBid,
  getProjectsListing,
  updateSupportingDocs
} from "../controllers/Project";
import { checkAuth } from "../middlewares/checkAuth";
import checkRole from "../middlewares/checkRole";

const router = express.Router();

// client routes
router.post("/create", checkAuth, checkRole('client'), createProject);
router.put('/update/docs', checkAuth, checkRole('client'), updateSupportingDocs)
router.get("/assign", checkAuth, checkRole('client'), assignBidToProject);

// provider routes
router.get("/get", checkAuth, checkRole('provider'), getProjectsListing);

// all
router.get("/assign", checkAuth, fetchAssignedBid);

export default router;
   