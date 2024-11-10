import express from "express";
import {
  getOptions,
  searchCities,
  searchColleges, 
  searchStates
} from "../controllers/data";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.get("/cities/get", checkAuth, searchCities);
router.get("/states/get", checkAuth, searchStates);
router.get("/colleges/get", checkAuth, searchColleges);
router.get("/options/get", checkAuth, getOptions);


export default router;
   