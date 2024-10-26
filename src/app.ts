import express, { urlencoded } from 'express'
import {config} from 'dotenv'
import errorMiddleware from './middlewares/error';
import expressWinston from "express-winston";
import winston from "winston";
import cookieParser from "cookie-parser";
import cors from "cors"
import authRoutes from "./routes/auth";
import googleRoutes from "./routes/googleAuth";
import userRoutes from "./routes/user";
import projectRoutes from "./routes/project";
import dataRoutes from "./routes/project";


config({
    path: "./.env",
  });

  
export const app = express()

app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.cli()
      ),
      meta: true,
      expressFormat: true,
      colorize: true,
    })
  );


app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));

const allowedOrigins = [process.env.FRONTEND_URL!, "http://localhost:3000"];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/data", dataRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to CampusBid Server")
})

app.use(errorMiddleware);
