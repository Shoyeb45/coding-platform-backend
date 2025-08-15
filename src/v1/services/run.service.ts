import { codeExecutionQueue } from "../../queues/codeExecution.queue";
import { TCustomRun } from "../types/run.type";

export class RunService {
    static run = async (data: TCustomRun) => {
        codeExecutionQueue.add("execute-run-only", data);

        return {
            "msg": "added"
        }
    };
}