import { HTTP_STATUS } from "../../config/httpCodes";
import { codeRunnerQueue } from "../../queues/codeExecution.queue";
import { ApiError } from "../../utils/ApiError";
import { RedisClient } from "../../utils/redisClient";
import { QueueDataType } from "../types/queue.type";
import { TCustomRun } from "../types/run.type";
import { v4 as uuidv4 } from "uuid";

export class RunService {
    static run = async (data: TCustomRun) => {
        const runId = uuidv4();
        const newData: QueueDataType = {...data, runId };
        
        // update in cache
        await RedisClient.getInstance().setForRun(runId, JSON.stringify({ status: "Queued" }));

        codeRunnerQueue.add("execute-run-only", newData);

        return runId;
    };

    static getResult = async (runId: string) => {
        if (!runId) {
            new ApiError("No run id found", HTTP_STATUS.BAD_REQUEST);
        }
        // get result from redis
        let result = await RedisClient.getInstance().getResult(runId);
        if (!result) {
            throw new ApiError("No submission found for given run id", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        const data = JSON.parse(result);
        if (data.status == "Failed") {
            throw new ApiError("Failed to execute the code", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return data;   
    }
}