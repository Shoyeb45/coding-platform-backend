import { codeExecutionWorker } from '../queues/codeExecution.queue';
import { logger } from '../utils/logger';


// Worker event handlers
codeExecutionWorker.on('completed', async (job, result) => {
  logger.info(`Job ${job.id} completed.`);
  console.log(job);
  console.log(result);
  
  
  // Update submission in database if it's not a run-only request
  // if (!result.submissionId.startsWith('run_')) {
  //   // await updateSubmissionResult(result);
  // }
  
  // Emit real-time update via WebSocket (implement this)
  // await notifyClient(job.data.sessionId, result);
});

codeExecutionWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`);
  
  // Update submission status to failed
  // if (job?.data.submissionId && !job.data.submissionId.startsWith('run_')) {
  //   // updateSubmissionStatus(job.data.submissionId, 'FAILED');
  // }
});

// async function updateSubmissionResult(result: any) {
//   const { prisma } = await import('../utils/prisma');
  
//   await prisma.submission.update({
//     where: { id: result.submissionId },
//     data: {
//       status: result.overallStatus,
//       score: result.score,
//       passedTestCases: result.passedTestCases,
//       totalTestCases: result.totalTestCases,
//       // Store detailed results as JSON
//       results: JSON.stringify(result.results),
//     },
//   });
// }

// async function updateSubmissionStatus(submissionId: string, status: string) {
//   const { prisma } = await import('../utils/prisma');
  
//   await prisma.submission.update({
//     where: { id: submissionId },
//     data: { status },
//   });
// }

// Start worker
logger.info('🔄 Code execution worker started');
