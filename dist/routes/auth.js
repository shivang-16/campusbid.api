"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const checkAuth_1 = require("../middlewares/checkAuth");
const router = express_1.default.Router();
router.post("/register", auth_1.register);
router.post("/verify", auth_1.otpVerification);
router.post("/resend", auth_1.resentOtp);
router.post("/login", auth_1.login);
router.post("/token/verify", auth_1.verifyToken);
router.get("/logout", auth_1.logout);
router.post("/forgetpassword", auth_1.forgotPassword);
router.post("/resetpassword/:token", auth_1.resetpassword);
router.get("/user", checkAuth_1.checkAuth, auth_1.getUser);
exports.default = router;
