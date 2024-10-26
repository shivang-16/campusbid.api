import express from "express";
import {
  searchCities,
  searchColleges, 
  searchStates
} from "../controllers/data";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.get("/cities/get", checkAuth, searchCities);
router.get("/states/get", checkAuth, searchStates);
router.get("/colleges/get", checkAuth, searchColleges);


export default router;
   