"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Project_1 = require("../controllers/Project");
const checkAuth_1 = require("../middlewares/checkAuth");
const router = express_1.default.Router();
router.post("/create", checkAuth_1.checkAuth, Project_1.createProject);
router.get("/get", checkAuth_1.checkAuth, Project_1.getProjectBasedOnProfile);
exports.default = router;
