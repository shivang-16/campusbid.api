import express from "express";
import {
  assignBidToProject,
  createProject,
  fetchAssignedBid,
  getProjectById,
  getProjectsListing,
  updateSupportingDocs
} from "../controllers/Freelance";
import { checkAuth } from "../middlewares/checkAuth";
import checkRole from "../middlewares/checkRole";

const router = express.Router();

// client routes
router.post("/create", checkAuth, checkRole('client'), createProject);
router.put('/update/docs', checkAuth, checkRole('client'), updateSupportingDocs)
router.get("/assign/bid", checkAuth, checkRole('client'), assignBidToProject);

// provider routes
router.get("/get", checkAuth, checkRole('freelancer'), getProjectsListing);

// all
router.get("/assign", checkAuth, fetchAssignedBid);
router.get("/get/:projectId", checkAuth, getProjectById);

export default router;
   