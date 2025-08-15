import { createHttpServer } from "./app";
import { config } from "./config";
import { errorHandler } from "./middlewares/error.middleware";
import { successHandler } from "./middlewares/response.middleware";
const app = createHttpServer();

// include routes
import { router } from "./v1/routes/index";
import { logger } from "./utils/logger";
app.use("/api/v1", router);

import { prisma } from "./utils/prisma";
import { asyncHandler } from "./utils/asyncHandler";
import { rmSync } from "fs";

app.get("/add", async (req, res) => {
    const data = await prisma.teacher.create({
        data: {
            name: "Aryan",
            designation: "TeachingAssistant",
            email: "aryn@pwioi.com",
            phone: "9882123123",
            password: "12345678",
            linkedin: "https://linkedin.com",
            experience: "4 years",
            gender: "MALE",
            centerId:  "cme4060i40001n58w3vof40xx",

        }
    })
    res.json({data})
});

app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
});


app.use(successHandler);
app.use(errorHandler);
