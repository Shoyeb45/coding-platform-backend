import { HTTP_STATUS } from "../../config/httpCodes";
import { codeRunnerQueue } from "../../queues/codeExecution.queue";
import { ApiError } from "../../utils/ApiError";
import { convertToNormalString } from "../../utils/helper";
import { RedisClient } from "../../utils/redisClient";
import { ProblemRepository } from "../repositories/problem.repository";
import { QueueDataType, RedisSubmission } from "../types/queue.type";
import { TCustomRun } from "../types/run.type";
import { v4 as uuidv4 } from "uuid";

export class RunService {
    static run = async (data: TCustomRun) => {
        const runId = uuidv4();
        // fetch driver code
        const driverCodes = await ProblemRepository.getDriverCode(data.problemId, data.languageId)
        if (!driverCodes?.prelude || !driverCodes?.driverCode) {
            throw new ApiError("No driver code found for given problem");
        } 
        
        driverCodes.prelude = convertToNormalString(driverCodes.prelude);
        driverCodes.boilerplate = convertToNormalString(driverCodes.boilerplate);
        driverCodes.driverCode = convertToNormalString(driverCodes.driverCode);
        // concatenate code
        data.code = `${driverCodes?.prelude}\n\n${data.code}\n\n${driverCodes?.driverCode}`;

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
        const result = await RedisClient.getInstance().getResult(runId);
        if (!result) {
            throw new ApiError("No submission found for given run id", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        const data: RedisSubmission = JSON.parse(result);
        if (data.status == "Failed") {
            throw new ApiError("Failed to execute the code", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return data;   
    }
}