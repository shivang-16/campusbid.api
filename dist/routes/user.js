"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const checkAuth_1 = require("../middlewares/checkAuth");
const checkRole_1 = __importDefault(require("../middlewares/checkRole"));
const router = express_1.default.Router();
// all
router.post("/save/info", checkAuth_1.checkAuth, user_1.savePersonalInfo);
router.put("/update/mode", checkAuth_1.checkAuth, user_1.updateUserMode);
// providers
router.get("/list/bids", checkAuth_1.checkAuth, (0, checkRole_1.default)("provider"), user_1.listUserBids);
// clients
router.get("/list/projects", checkAuth_1.checkAuth, (0, checkRole_1.default)("client"), user_1.listUsersProjects);
exports.default = router;
