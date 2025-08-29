import { createHttpServer } from "./app";
import { config } from "./config";
import { errorHandler } from "./middlewares/error.middleware";
import { successHandler } from "./middlewares/response.middleware";
const app = createHttpServer();

// include routes
import { router } from "./v1/routes/index";
import { logger } from "./utils/logger";
app.use("/api/v1", router);

app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
});

// global handlers
app.use(successHandler);
app.use(errorHandler);
