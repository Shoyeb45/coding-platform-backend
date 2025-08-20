// flow
// Create db entry of submission in the db
// add updation of the testcase

import { Job, Worker } from "bullmq";
import { CodeRunnerResult, SubmissionRunnerResult } from "../v1/types/worker.type";
import { ProblemRepository } from "../v1/repositories/problem.repository";


/**
 * Function to normalise testcase marks
 * `sum(weight_i * k_i) / sum(weight_i)`
 * Wher weight_i is individual weight of the testcase, and
 * k_i = 1 => if passed else 0
 * @param testcases 
 * @returns 
 */
function findFraction(testcases: CodeRunnerResult["results"]) {
    let sum = 0;
    let numerator = 0;
    testcases.forEach((testcase) => {
        numerator += (testcase.passed ? 1: 0) * (testcase.weight ?? 1);
        sum += testcase.weight ?? 1;
    });

    return numerator / sum;
}

const dbWorker = new Worker<SubmissionRunnerResult>("db-operations", async (job: Job<SubmissionRunnerResult>) => {
    
    const { runnerResult, metadata } = job.data;

    let avgExecutionTime = 0, avgMemoryUsed = 0;
    runnerResult.results.forEach((result) => {
        avgExecutionTime += result.executionTime ?? 0;
        avgMemoryUsed += result.memory ?? 0;
    });

    let status = runnerResult.passedTestCases === runnerResult.totalTestCases ? "Accepted": "Not Accepted";
    const scores = await ProblemRepository.getScoreById(metadata.problemId);
    const totalScore = (status === "Accepted" ? 1: 0) * (scores?.problemWeight ?? 30) + findFraction(runnerResult.results) * (scores?.testcaseWeight ?? 70);
});