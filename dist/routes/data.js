"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_1 = require("../controllers/data");
const checkAuth_1 = require("../middlewares/checkAuth");
const router = express_1.default.Router();
router.get("/cities/get", checkAuth_1.checkAuth, data_1.searchCities);
router.get("/states/get", checkAuth_1.checkAuth, data_1.searchStates);
router.get("/colleges/get", checkAuth_1.checkAuth, data_1.searchColleges);
exports.default = router;
