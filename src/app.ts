// server.ts
import express, { json, urlencoded } from "express";
import helmet from "helmet";
import { httpLogger } from "./middlewares/logger.middleware";
import cookieParser from "cookie-parser";
import { AuthUser } from "./types/auth.type";
import cors from "cors";
import { config } from "./config";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
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
        message: "Coding platform app is running",
        success: true,
      });
    })
    .use(
      cors({
        origin: config.frontend_url,
        credentials: true,
      })
    )
    .get("/health", (req, res) => {
      res.json({
        message: "Coding platform app is running and it's healthy",
        success: true,
      });
    });

  return app;
}
