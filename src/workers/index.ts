import { dbQueue } from '../queues/codeExecution.queue';
import { logger } from '../utils/logger';
import { RedisClient } from '../utils/redisClient';
import { codeRunnerWorker } from './codeRunnerWorker';
import { submissionRunnerWorker } from './submissionRunnerWorker';


// custom run worker event handlers
codeRunnerWorker.on('completed', async (job, result) => {
  logger.info(`Custom run with runId: ${result.runId}, processed successfully`);

  await RedisClient.getInstance().setForRun(result.runId, JSON.stringify({ status: "Done", result }))
  logger.info(`Redis client updated successfully for runId: ${result.runId}`)
});

codeRunnerWorker.on('failed', async (job, err) => {
  if (!job) {
    logger.error("Failed to execute the code");
    return;
  }

  logger.error(`Job ${job?.id} failed: ${err.message}`);
  await RedisClient.getInstance().setForRun(job.data.runId, JSON.stringify({ status: "Failed" }));
});



// submission worker event handlers
submissionRunnerWorker.on('completed', async (job, result) => {
  // update the redis with status completed
  logger.info(`Submission with id: ${job.data.submissionId} successfully executed and evaluted.`);

  logger.info(`Adding the result to the database queue, for processing in database`);

  await dbQueue.add("save-submission-result", {
    type: "save-submission-result", data: result
  }, {
    attempts: 5, backoff: {
      type: "exponential",
      delay: 2000
    },
    removeOnComplete: 10,
    removeOnFail: 50
  });

  // update in redis
  await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
    status: "Done",
    result: result.runnerResult
  }));
  logger.info(`Redis client updated successfully for submission id : ${job.data.submissionId}`)
});

submissionRunnerWorker.on('failed', async (job, err) => {
  logger.error(`Submission execution failed for ${job?.data?.submissionId}: ${err}`);
  if (job?.data?.submissionId) {
    try {
      await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
        status: "Failed",
        error: err.message,
        failedAt: new Date()
      }));
    } catch (redisError) {
      logger.error(`Failed to update Redis with failure status: ${redisError}`);
    }
  }
});


logger.info('Code execution workers started');
