import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiError } from "../../utils/ApiError";
import { RedisClient } from "../../utils/redisClient";
import { S3Service } from "../../utils/s3client";
import { ContestRepository } from "../repositories/contest.repository";
import { ProblemRepository } from "../repositories/problem.repository";
import { StudentRepository } from "../repositories/student.repository";
import { TestcaseRepository } from "../repositories/testcase.repository";
import { TestcaseData, TSubmission } from "../types/submission.type";



export class SubmissionService {

    static isParticipant = async (studentId: string, contestId: string): Promise<boolean> => {
        // Fetch both data concurrently
        const [batches, studentData] = await Promise.all([
            ContestRepository.getBatches(contestId),
            StudentRepository.getBatchId(studentId)
        ]);

        if (!batches) {
            throw new ApiError("Failed to fetch batches data.");
        }
        
        if (!studentData) {
            throw new ApiError("Failed to fetch student data");
        }

        // Use Set for O(1) lookup instead of O(n) loop
        const batchIds = new Set(batches.map(batch => batch.batch.id));
        return batchIds.has(studentData.batch.id);
    }

    static isLiveContest = async (contestId: string, currentTime: string): Promise<boolean> => {
        const contestData = await ContestRepository.getTimings(contestId);
        if (!contestData) {
            throw new ApiError("No contest found with given id");
        }
        
        const now = new Date(currentTime);
        return now >= contestData.startTime && now <= contestData.endTime;
    }

    static createSubmission = async (user: Express.Request["user"], submissionData: TSubmission) => {
        // Early validation
        if (!user?.sub) {
            throw new ApiError("No id associated with user found", HTTP_STATUS.UNAUTHORIZED);
        }

        if (!submissionData.contestId) {
            // When submission is non-contest
            return;
        }

        // Validate user role early
        if (user?.role !== "STUDENT") {
            throw new ApiError("Only students are allowed to submit during contest.", HTTP_STATUS.UNAUTHORIZED);
        }

        // Run validations concurrently where possible
        const [isLive, isParticipant] = await Promise.all([
            this.isLiveContest(submissionData.contestId, submissionData.submissionTime),
            this.isParticipant(user.sub, submissionData.contestId)
        ]);

        if (!isLive) {
            throw new ApiError("Not allowed, submission time is not within the contest time frame.", HTTP_STATUS.UNAUTHORIZED);
        }

        if (!isParticipant) {
            throw new ApiError("Unauthorized access, you are not allowed to submit the problem in this contest.", HTTP_STATUS.UNAUTHORIZED);
        }

        // Handle testcases and driver codes concurrently
        const [testcases, driverCodes] = await Promise.all([
            this.getOrFetchTestcases(submissionData.problemId),
            ProblemRepository.getDriverCodes(submissionData.problemId, submissionData.languageId)
        ]);

        if (!driverCodes?.prelude || !driverCodes?.driverCode) {
            throw new ApiError("No driver code found for given problem");
        }

        // Concatenate code
        submissionData.code = `${driverCodes.prelude}\n\n${submissionData.code}\n\n${driverCodes.driverCode}`;

        // Return or continue with submission processing
        return { testcases, submissionData };
    }

    private static getOrFetchTestcases = async (problemId: string): Promise<string> => {
        // Try to get from Redis first
        let testcases = await RedisClient.getInstance().getResult(problemId);
        
        if (testcases) {
            return testcases;
        }

        // If not in Redis, fetch from S3 and cache
        const data = await this.fetchTestcases(problemId);
        if (!data) {
            throw new ApiError("Failed to fetch testcases data.");
        }

        testcases = JSON.stringify(data);
        
        // Set in Redis with error handling (don't fail if Redis is down)
        try {
            await RedisClient.getInstance().setTestcase(problemId, testcases);
        } catch (error) {
            console.warn(`Failed to cache testcases in Redis for problem ${problemId}:`, error);
            // Continue execution even if Redis fails
        }

        return testcases;
    }

    private static fetchTestcases = async (problemId: string): Promise<TestcaseData[]> => {
        const testcases = await TestcaseRepository.getTestcasesOfProblem(problemId);

        if (!testcases || testcases.length === 0) {
            throw new ApiError("No testcases found for the given problem");
        }

        // Process all testcases concurrently for better performance
        const data = await Promise.all(
            testcases.map(async (testcase): Promise<TestcaseData> => {
                // Process file paths and S3 calls concurrently
                const [input, output] = await Promise.all([
                    S3Service.getInstance().getFileContent(testcase.input),
                    S3Service.getInstance().getFileContent(testcase.output)
                ]);

                // Extract filenames efficiently
                const inputName = testcase.input.split("/").pop() || "";
                const outputName = testcase.output.split("/").pop() || "";

                return {
                    id: testcase.id,
                    weight: testcase.weight,
                    input,
                    output,
                    inputName,
                    outputName,
                };
            })
        );

        return data;
    }


}