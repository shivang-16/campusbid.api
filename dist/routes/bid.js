"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../middlewares/checkAuth");
const checkRole_1 = __importDefault(require("../middlewares/checkRole"));
const bid_1 = require("../controllers/bid");
const router = express_1.default.Router();
router.post("/create", checkAuth_1.checkAuth, (0, checkRole_1.default)('provider'), bid_1.createBid);
router.get("/list/:projectId", checkAuth_1.checkAuth, bid_1.listBidders);
router.get("/find/:bidId", checkAuth_1.checkAuth, (0, checkRole_1.default)('provider'), bid_1.getBid);
router.put("/close/:bidId", checkAuth_1.checkAuth, (0, checkRole_1.default)('provider'), bid_1.closeBid);
exports.default = router;
