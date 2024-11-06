"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importStar(require("express"));
const dotenv_1 = require("dotenv");
const error_1 = __importDefault(require("./middlewares/error"));
const express_winston_1 = __importDefault(require("express-winston"));
const winston_1 = __importDefault(require("winston"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const googleAuth_1 = __importDefault(require("./routes/googleAuth"));
const user_1 = __importDefault(require("./routes/user"));
const project_1 = __importDefault(require("./routes/project"));
const bid_1 = __importDefault(require("./routes/bid"));
const data_1 = __importDefault(require("./routes/data"));
(0, dotenv_1.config)({
    path: "./.env",
});
exports.app = (0, express_1.default)();
exports.app.use(express_winston_1.default.logger({
    transports: [new winston_1.default.transports.Console()],
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.cli()),
    meta: true,
    expressFormat: true,
    colorize: true,
}));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, express_1.urlencoded)({ extended: true }));
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 ||
            /\.vercel\.app$/.test(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
};
exports.app.use((0, cors_1.default)(corsOptions));
exports.app.use("/api/auth", auth_1.default);
exports.app.use("/api/google", googleAuth_1.default);
exports.app.use("/api/user", user_1.default);
exports.app.use("/api/project", project_1.default);
exports.app.use("/api/bid", bid_1.default);
exports.app.use("/api/data", data_1.default);
exports.app.get('/', (req, res) => {
    res.send("Welcome to CampusBid Server");
});
exports.app.use(error_1.default);
