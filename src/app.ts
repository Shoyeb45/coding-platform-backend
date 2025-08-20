// server.ts
import express, { json, urlencoded } from "express";
import helmet from "helmet";
import { httpLogger } from "./middlewares/logger.middleware";
import cookieParser from "cookie-parser";
import { AuthUser, UserRole } from "./types/auth.type";
import cors from "cors";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function createHttpServer() {
  const app = express();

  app
    .use(json())
    .use(httpLogger)
    .use(urlencoded())
    .use(helmet())
    .use(cookieParser())
    .get("/", (req, res) => {
      res.json({
        "message": "Coding platform app is running",
        success: true
      })
    })
    .use(cors({
      origin: "http://localhost:3000",
      credentials: true
    }))
    .get("/health", (req, res) => {
      res.json({
        "message": "Coding platform app is running and it's healthy",
        success: true
      })
    })



  const PORT = process.env.PORT || 4000;


  return app;
}