// Database Operation Worker with optimizations and better error handling
import { Job, Worker } from "bullmq";
import { CodeRunnerResult, SubmissionRunnerResult } from "../v1/types/worker.type";
import { ProblemRepository } from "../v1/repositories/problem.repository";
import { SubmissionRepository } from "../v1/repositories/submission.repository";
import { logger } from "../utils/logger";
import { redisConfig } from "../config/queue.config";

// Types for better error handling
interface DatabaseError extends Error {
    code?: string;
    constraint?: string;
    table?: string;
}



interface SubmissionResultData {
    submissionId: string;
    testCaseId: string;
    status: string;
    executionTime: number;
    memoryUsed: number;
}

/**
 * Function to normalise testcase marks
 * `sum(weight_i * k_i) / sum(weight_i)`
 * Where weight_i is individual weight of the testcase, and
 * k_i = 1 => if passed else 0
 */
function calculateWeightedScore(testcases: CodeRunnerResult["results"]): number {
    let totalWeight = 0;
    let weightedScore = 0;

    for (const testcase of testcases) {
        const weight = testcase.weight ?? 1;
        const score = testcase.passed ? 1 : 0;
        
        weightedScore += score * weight;
        totalWeight += weight;
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
}

function roundToTwoDecimals(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateAverageResources(results: CodeRunnerResult["results"]): {
    maxExecutionTime: number;
    maxMemoryUsed: number;
} {
    if (results.length === 0) {
        return { maxExecutionTime: 0, maxMemoryUsed: 0 };
    }

    let maxExecutionTime = Number.MIN_SAFE_INTEGER;
    let maxMemoryUsed = Number.MIN_SAFE_INTEGER;


    for (const result of results) {
        if (result.executionTime) {
            maxExecutionTime = Math.max(maxExecutionTime, Number(result.executionTime));
        }
        if (result.memory != null && !isNaN(result.memory)) {
            maxMemoryUsed = Math.max(maxMemoryUsed, Number(result.memory));
        }
    }

   

    return { maxExecutionTime, maxMemoryUsed };
}

function determineSubmissionStatus(results: CodeRunnerResult["results"]): string {

    for (let i = 0; i < results.length; i++) {
        if (!results[i].passed) {
            return results[i].status;
        }
    }
    return "Accepted";
}


const dbWorker = new Worker<SubmissionRunnerResult>(
    "database-operations", 
    async (job: Job<SubmissionRunnerResult>) => {
        const { problemPoint, runnerResult, metadata } = job.data;
        const runId = runnerResult.runId;

        try {

            // Validate input data
            if (!runnerResult || !metadata) {
                throw new Error("Invalid job data: missing runnerResult or metadata");
            }

            if (!runnerResult.results || runnerResult.results.length === 0) {
                throw new Error("Invalid job data: no test case results found");
            }

            logger.info(`Processing database operations for submission ${runId}`);

            // Calculate average resources
            logger.info("Calculating average resources used...");
            const { maxExecutionTime, maxMemoryUsed } = calculateAverageResources(runnerResult.results);

            // Get problem scores with retry logic
            logger.info(`Fetching problem scores for problemId: ${metadata.problemId}`);
            const scores = await retryOperation(
                () => ProblemRepository.getScoreById(metadata.problemId),
                3,
                1000,
                `fetch scores for problem ${metadata.problemId}`
            );

            if (!scores) {
                logger.warn(`No scores found for problemId: ${metadata.problemId}, using defaults`);
            }

            // Calculate total score
            logger.info("Calculating total score...");
            const status = determineSubmissionStatus(runnerResult.results);
            const maxProblemdifficulty = scores?.problemWeight ?? 30;
            const maxTestcase = scores?.testcaseWeight ?? 70;
            
            const completionFactor = runnerResult.passedTestCases / runnerResult.totalTestCases;
            const baseScore =  completionFactor * maxProblemdifficulty;
            const weightedTestCaseScore = calculateWeightedScore(runnerResult.results) * maxTestcase;
            const totalScore = roundToTwoDecimals(problemPoint * (baseScore + weightedTestCaseScore));

            // Prepare submission data
            const submissionData = {
                ...metadata,
                code: Buffer.from(metadata.code).toString("base64"),
                score: totalScore,
                status,
                memoryUsed: maxMemoryUsed,
                executionTime: maxExecutionTime
            };

            // Create submission with retry logic
            logger.info("Creating submission in database...");
            const submission = await retryOperation(
                () => SubmissionRepository.createSubimssion(submissionData),
                3,
                1000,
                "create submission"
            );

            if (!submission || !submission.id) {
                throw new Error("Failed to create submission: invalid submission object returned");
            }

            logger.info(`Submission created successfully with ID: ${submission.id}`);

            // Prepare submission results data with validation
            const submissionResultsData: SubmissionResultData[] = runnerResult.results
                .filter(result => result != null) // Filter out null/undefined results
                .map((result, index) => ({
                    submissionId: submission.id,
                    testCaseId: result?.id ?? `testcase_${index}`, // Fallback ID if missing
                    status: result.status || "Unknown",
                    executionTime: Number(result?.executionTime) ?? 0,
                    memoryUsed: result?.memory ?? 0
                }));

            if (submissionResultsData.length === 0) {
                throw new Error("No valid submission results to create");
            }

            // Create submission results with retry logic
            logger.info(`Creating ${submissionResultsData.length} submission results...`);
            const submissionResults = await retryOperation(
                () => SubmissionRepository.createSubmissionResults(submissionResultsData),
                3,
                1000,
                "create submission results"
            );

            if (!submissionResults) {
                throw new Error("Failed to create submission results");
            }


            logger.info(`Database operations completed successfully for submission ${runId}`);

            return {
                success: true,
                submissionId: submission.id,
                totalScore,
                status,
                resultsCount: runnerResult.passedTestCases || submissionResultsData.length
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Database operation failed for submission ${runId}: ${error}`);

            // Update Redis with error status

            // Enhanced error handling based on error type
            if (isDatabaseConstraintError(error)) {
                logger.error(`Database constraint violation for submission ${runId}: ${errorMessage}`);
            } else if (isNetworkError(error)) {
                logger.error(`Network error during database operation for submission ${runId}: ${errorMessage}`);
            } else if (isValidationError(error)) {
                logger.error(`Validation error for submission ${runId}: ${errorMessage}`);
            }

            throw error; // Re-throw to trigger retry mechanism
        }
    },
    {
        connection: redisConfig,
        concurrency: 3
    }
);

// Utility function for retry logic with exponential backoff
async function retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000,
    operationName: string = "operation"
): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await operation();
            if (attempt > 1) {
                logger.info(`${operationName} succeeded on attempt ${attempt}`);
            }
            return result;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            if (attempt === maxAttempts) {
                logger.error(`${operationName} failed after ${maxAttempts} attempts: ${lastError}`);
                break;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
            logger.warn(`${operationName} failed on attempt ${attempt}, retrying in ${delay}ms: ${lastError.message}`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

// Error type checking functions
function isDatabaseConstraintError(error: any): error is DatabaseError {
    return error && (
        error.code === '23505' || // Unique violation (PostgreSQL)
        error.code === '23503' || // Foreign key violation (PostgreSQL)
        error.code === 'ER_DUP_ENTRY' || // Duplicate entry (MySQL)
        error.constraint || 
        (typeof error.message === 'string' && error.message.includes('constraint'))
    );
}

function isNetworkError(error: any): boolean {
    return error && (
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        (typeof error.message === 'string' && (
            error.message.includes('network') ||
            error.message.includes('connection') ||
            error.message.includes('timeout')
        ))
    );
}

function isValidationError(error: any): boolean {
    return error && (
        error.name === 'ValidationError' ||
        (typeof error.message === 'string' && (
            error.message.includes('validation') ||
            error.message.includes('required') ||
            error.message.includes('invalid')
        ))
    );
}

// Event handlers
dbWorker.on('completed', (job) => {
    logger.info(`Database operation completed successfully for job ${job.id}:`);
});

dbWorker.on('failed', (job, err) => {
    const errorInfo = {
        jobId: job?.id,
        submissionId: job?.data?.runnerResult?.runId,
        attemptsMade: job?.attemptsMade,
        maxAttempts: job?.opts?.attempts || 1,
        error: err.message
    };

    console.error(err)
    logger.error(`Database operation failed for job ${job?.id}: ${errorInfo.error}`);
    
    // If this is the final attempt, send detailed alert
    if (job && job.attemptsMade >= (job.opts?.attempts || 1)) {
        logger.error(`Database operation permanently failed after ${job.attemptsMade} attempts for job ${job.id}. Manual intervention required.`);
        
        // You could send an alert here (email, Slack, etc.)
        // await sendCriticalAlert({
        //     type: 'DATABASE_OPERATION_FAILED',
        //     submissionId: job.data?.runnerResult?.runId,
        //     jobId: job.id,
        //     error: err.message,
        //     attempts: job.attemptsMade,
        //     timestamp: new Date().toISOString()
        // });
    }
});

dbWorker.on('stalled', (job) => {
    logger.warn(`Database operation stalled for job ${job}, may be retried`);
});

dbWorker.on('progress', (job, progress) => {
    logger.debug(`Database operation progress for job ${job.id}: ${progress}%`);
});

export { dbWorker };