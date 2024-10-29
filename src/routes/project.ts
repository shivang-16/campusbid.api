import express from "express";
import {
  createProject,
  getProjectsListing,
  updateSupportingDocs
} from "../controllers/Project";
import { checkAuth } from "../middlewares/checkAuth";
import checkRole from "../middlewares/checkRole";

const router = express.Router();

router.post("/create", checkAuth, checkRole('client'), createProject);
router.put('/update/docs', checkAuth, checkRole('client'), updateSupportingDocs)
router.get("/get", checkAuth, checkRole('provider'), getProjectsListing);


export default router;
   