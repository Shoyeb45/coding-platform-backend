import { Judge0ExecutionResult } from "./judge0.type";
import { TCustomRun } from "./run.type";

export interface QueueDataType extends TCustomRun  {
    runId: string,
}

export type RedisSubmission = {
    status: "Failed" | "Queued" | "Running" | "Done",
    results?: Judge0ExecutionResult[]
}