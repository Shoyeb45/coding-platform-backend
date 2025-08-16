// server.ts
import express, {json, urlencoded } from "express";
import helmet from "helmet";
import { httpLogger } from "./middlewares/logger.middleware";




export function createHttpServer() {
    const app = express();

    app
        .use(json())
        .use(httpLogger)
        .use(urlencoded())
        .use(helmet())
        .get("/", (req, res) => {
            res.json({
                "message": "Coding platform app is running",
                success: true
            })
        })
        .get("/health", (req, res) => {
            res.json({
                "message": "Coding platform app is running and it's healthy",
                success: true
            })
        })



    const PORT = process.env.PORT || 4000;


    return app; 
}