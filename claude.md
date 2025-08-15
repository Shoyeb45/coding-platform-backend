
// queues/codeExecution.queue.ts
import { Queue, Worker, Job } from 'bullmq';
import { redisConfig, queueConfig } from '../config/queue.config';
import { executeCodeWithJudge0 } from '../services/judge0.service';
import { logger } from '../utils/logger';

export interface CodeExecutionJobData {
  submissionId: string;
  userId: string;
  problemId: string;
  contestId?: string;
  code: string;
  language: string;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }>;
  sessionId: string;
}

export interface ExecutionResult {
  submissionId: string;
  totalTestCases: number;
  passedTestCases: number;
  results: Array<{
    testCaseId: string;
    status: string;
    output: string;
    error?: string;
    executionTime?: number;
    memory?: number;
    passed: boolean;
  }>;
  overallStatus: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
  score: number;
}

// Create the queue
export const codeExecutionQueue = new Queue<CodeExecutionJobData>('code-execution', {
  connection: redisConfig,
  ...queueConfig,
});

// Worker to process jobs
export const codeExecutionWorker = new Worker<CodeExecutionJobData, ExecutionResult>(
  'code-execution',
  async (job: Job<CodeExecutionJobData>) => {
    const { submissionId, code, language, testCases, userId, problemId } = job.data;
    
    logger.info(`Processing submission: ${submissionId} for user: ${userId}`);
    
    const results: ExecutionResult['results'] = [];
    let passedCount = 0;
    
    // Update progress
    await job.updateProgress(0);
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      try {
        const result = await executeCodeWithJudge0({
          code,
          language,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
        });
        
        const passed = result.status === 'Accepted' && result.output.trim() === testCase.expectedOutput.trim();
        
        if (passed) passedCount++;
        
        results.push({
          testCaseId: testCase.id,
          status: result.status,
          output: result.output,
          error: result.error,
          executionTime: result.time,
          memory: result.memory,
          passed,
        });
        
        // Update progress
        const progress = Math.round(((i + 1) / testCases.length) * 100);
        await job.updateProgress(progress);
        
      } catch (error: any) {
        logger.error(`Error executing test case ${testCase.id}:`, error);
        
        results.push({
          testCaseId: testCase.id,
          status: 'Runtime Error',
          output: '',
          error: error.message,
          passed: false,
        });
      }
    }
    
    // Determine overall status
    let overallStatus: ExecutionResult['overallStatus'] = 'WA';
    if (passedCount === testCases.length) {
      overallStatus = 'AC';
    } else if (results.some(r => r.status.includes('Time Limit'))) {
      overallStatus = 'TLE';
    } else if (results.some(r => r.status.includes('Memory Limit'))) {
      overallStatus = 'MLE';
    } else if (results.some(r => r.status.includes('Runtime Error'))) {
      overallStatus = 'RE';
    } else if (results.some(r => r.status.includes('Compilation Error'))) {
      overallStatus = 'CE';
    }
    
    const finalResult: ExecutionResult = {
      submissionId,
      totalTestCases: testCases.length,
      passedTestCases: passedCount,
      results,
      overallStatus,
      score: Math.round((passedCount / testCases.length) * 100),
    };
    
    logger.info(`Submission ${submissionId} completed: ${passedCount}/${testCases.length} passed`);
    
    return finalResult;
  },
  {
    connection: redisConfig,
    concurrency: 5,
  }
);

// Worker event listeners
codeExecutionWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

codeExecutionWorker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed:`, err);
});

// services/judge0.service.ts
import axios from 'axios';
import { logger } from '../utils/logger';

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language mapping
const LANGUAGE_MAP: Record<string, number> = {
  'javascript': 63,
  'python': 71,
  'java': 62,
  'cpp': 54,
  'c': 50,
};

export interface Judge0ExecutionRequest {
  code: string;
  language: string;
  input: string;
  expectedOutput: string;
}

export interface Judge0ExecutionResult {
  status: string;
  output: string;
  error?: string;
  time?: number;
  memory?: number;
}

export async function executeCodeWithJudge0(request: Judge0ExecutionRequest): Promise<Judge0ExecutionResult> {
  try {
    const submissionData = {
      source_code: Buffer.from(request.code).toString('base64'),
      language_id: LANGUAGE_MAP[request.language],
      stdin: Buffer.from(request.input || '').toString('base64'),
    };
    
    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`,
      submissionData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        timeout: 30000, // 30 second timeout
      }
    );
    
    const submission = response.data;
    
    return {
      status: submission.status.description,
      output: submission.stdout ? Buffer.from(submission.stdout, 'base64').toString() : '',
      error: submission.stderr ? Buffer.from(submission.stderr, 'base64').toString() : undefined,
      time: submission.time,
      memory: submission.memory,
    };
    
  } catch (error: any) {
    logger.error('Judge0 API error:', error);
    throw new Error(`Execution failed: ${error.message}`);
  }
}

// v1/controllers/submission.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { submissionService } from '../services/submission.service';
import { HTTP_STATUS_CODES } from '../../config/httpCodes';

class SubmissionController {
  // Submit code for execution
  submitCode = asyncHandler(async (req: Request, res: Response) => {
    const { problemId, code, language } = req.body;
    const userId = req.user?.id; // Assuming you have auth middleware
    const contestId = req.query.contestId as string;
    
    if (!problemId || !code || !language || !userId) {
      throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST, 'Missing required fields');
    }
    
    const result = await submissionService.submitCode({
      userId,
      problemId,
      contestId,
      code,
      language,
      sessionId: req.sessionID || `session_${Date.now()}`,
    });
    
    res.status(HTTP_STATUS_CODES.CREATED).json(
      new ApiResponse(HTTP_STATUS_CODES.CREATED, result, 'Code submitted successfully')
    );
  });
  
  // Run code with custom test cases (without submission)
  runCode = asyncHandler(async (req: Request, res: Response) => {
    const { code, language, testCases } = req.body;
    const userId = req.user?.id;
    
    if (!code || !language || !testCases || !Array.isArray(testCases)) {
      throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST, 'Invalid request data');
    }
    
    const result = await submissionService.runCode({
      userId,
      code,
      language,
      testCases,
      sessionId: req.sessionID || `session_${Date.now()}`,
    });
    
    res.status(HTTP_STATUS_CODES.OK).json(
      new ApiResponse(HTTP_STATUS_CODES.OK, result, 'Code execution initiated')
    );
  });
  
  // Get submission status
  getSubmissionStatus = asyncHandler(async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    
    const status = await submissionService.getSubmissionStatus(submissionId);
    
    res.status(HTTP_STATUS_CODES.OK).json(
      new ApiResponse(HTTP_STATUS_CODES.OK, status, 'Status retrieved successfully')
    );
  });
  
  // Get user submissions
  getUserSubmissions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { problemId, contestId, page = 1, limit = 20 } = req.query;
    
    const submissions = await submissionService.getUserSubmissions({
      userId,
      problemId: problemId as string,
      contestId: contestId as string,
      page: Number(page),
      limit: Number(limit),
    });
    
    res.status(HTTP_STATUS_CODES.OK).json(
      new ApiResponse(HTTP_STATUS_CODES.OK, submissions, 'Submissions retrieved successfully')
    );
  });
}

export const submissionController = new SubmissionController();

// v1/services/submission.service.ts
import { codeExecutionQueue, CodeExecutionJobData, ExecutionResult } from '../../queues/codeExecution.queue';
import { prisma } from '../../utils/prisma';
import { testcaseService } from './testcase.service';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS_CODES } from '../../config/httpCodes';
import { logger } from '../../utils/logger';

export interface SubmitCodeRequest {
  userId: string;
  problemId: string;
  contestId?: string;
  code: string;
  language: string;
  sessionId: string;
}

export interface RunCodeRequest {
  userId?: string;
  code: string;
  language: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
  sessionId: string;
}

class SubmissionService {
  async submitCode(request: SubmitCodeRequest) {
    const { userId, problemId, contestId, code, language, sessionId } = request;
    
    // Get test cases for the problem
    const testCases = await testcaseService.getTestCasesByProblemId(problemId);
    
    if (!testCases || testCases.length === 0) {
      throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND, 'No test cases found for this problem');
    }
    
    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId,
        contestId,
        code,
        language,
        status: 'PENDING',
      },
    });
    
    // Prepare job data
    const jobData: CodeExecutionJobData = {
      submissionId: submission.id,
      userId,
      problemId,
      contestId,
      code,
      language,
      testCases: testCases.map(tc => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      })),
      sessionId,
    };
    
    // Add to queue
    const job = await codeExecutionQueue.add('execute-submission', jobData, {
      priority: contestId ? 1 : 5, // Higher priority for contest submissions
    });
    
    logger.info(`Submission ${submission.id} queued with job ${job.id}`);
    
    return {
      submissionId: submission.id,
      jobId: job.id,
      status: 'QUEUED',
      message: 'Code submitted and queued for execution',
    };
  }
  
  async runCode(request: RunCodeRequest) {
    const { userId, code, language, testCases, sessionId } = request;
    
    // Generate temporary submission ID for run-only requests
    const tempSubmissionId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const jobData: CodeExecutionJobData = {
      submissionId: tempSubmissionId,
      userId: userId || 'anonymous',
      problemId: 'run-only',
      code,
      language,
      testCases: testCases.map((tc, index) => ({
        id: `test_${index + 1}`,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
      sessionId,
    };
    
    const job = await codeExecutionQueue.add('execute-run-only', jobData, {
      priority: 10, // Lower priority for run-only
    });
    
    return {
      jobId: job.id,
      status: 'QUEUED',
      message: 'Code queued for execution',
    };
  }
  
  async getSubmissionStatus(submissionId: string) {
    // First check database
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        problem: {
          select: { title: true },
        },
      },
    });
    
    if (!submission) {
      throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND, 'Submission not found');
    }
    
    return {
      submissionId: submission.id,
      status: submission.status,
      score: submission.score,
      executionTime: submission.executionTime,
      memory: submission.memory,
      problem: submission.problem,
      createdAt: submission.createdAt,
    };
  }
  
  async getUserSubmissions({ userId, problemId, contestId, page, limit }: any) {
    const where: any = { userId };
    if (problemId) where.problemId = problemId;
    if (contestId) where.contestId = contestId;
    
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          problem: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.submission.count({ where }),
    ]);
    
    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export const submissionService = new SubmissionService();

// v1/routes/submission.route.ts
import { Router } from 'express';
import { submissionController } from '../controllers/submission.controller';
import { authMiddleware } from '../../middlewares/auth.middleware'; // Assuming you have this

const router = Router();

// Submit code (requires auth)
router.post('/submit', authMiddleware, submissionController.submitCode);

// Run code with custom test cases (can be public for practice)
router.post('/run', submissionController.runCode);

// Get submission status
router.get('/:submissionId/status', submissionController.getSubmissionStatus);

// Get user submissions (requires auth)
router.get('/user', authMiddleware, submissionController.getUserSubmissions);

export default router;

// Add to v1/routes/index.ts
import submissionRoutes from './submission.route';

// Add this line with your other routes
router.use('/submissions', submissionRoutes);

// workers/index.ts
import { codeExecutionWorker } from '../queues/codeExecution.queue';
import { logger } from '../utils/logger';

// Worker event handlers
codeExecutionWorker.on('completed', async (job, result) => {
  logger.info(`Job ${job.id} completed for submission ${result.submissionId}`);
  
  // Update submission in database if it's not a run-only request
  if (!result.submissionId.startsWith('run_')) {
    await updateSubmissionResult(result);
  }
  
  // Emit real-time update via WebSocket (implement this)
  // await notifyClient(job.data.sessionId, result);
});

codeExecutionWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
  
  // Update submission status to failed
  if (job?.data.submissionId && !job.data.submissionId.startsWith('run_')) {
    updateSubmissionStatus(job.data.submissionId, 'FAILED');
  }
});

async function updateSubmissionResult(result: any) {
  const { prisma } = await import('../utils/prisma');
  
  await prisma.submission.update({
    where: { id: result.submissionId },
    data: {
      status: result.overallStatus,
      score: result.score,
      passedTestCases: result.passedTestCases,
      totalTestCases: result.totalTestCases,
      // Store detailed results as JSON
      results: JSON.stringify(result.results),
    },
  });
}

async function updateSubmissionStatus(submissionId: string, status: string) {
  const { prisma } = await import('../utils/prisma');
  
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status },
  });
}

// Start worker
logger.info('🔄 Code execution worker started');

// package.json additions
{
  "dependencies": {
    "bullmq": "^4.0.0",
    "ioredis": "^5.3.0"
  },
  "scripts": {
    "worker": "ts-node src/workers/index.ts",
    "dev:worker": "nodemon src/workers/index.ts"
  }
}