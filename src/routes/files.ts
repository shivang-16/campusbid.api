import express from "express";
import { uploadFiles } from "../controllers/helper";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.use(checkAuth);

router.post("/upload", uploadFiles);

export default router;
