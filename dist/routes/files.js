"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helper_1 = require("../controllers/helper");
const checkAuth_1 = require("../middlewares/checkAuth");
const router = express_1.default.Router();
router.use(checkAuth_1.checkAuth);
router.post("/upload", helper_1.uploadFiles);
exports.default = router;
