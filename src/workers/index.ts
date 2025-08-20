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
  // update in redis
  await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
    status: "Done",
    result: result.runnerResult
  }));
  logger.info(`Redis client updated successfully for submission id : ${job.data.submissionId}`)
});

submissionRunnerWorker.on('failed', async (job, err) => {
  if (!job) {
    logger.error(`Failed to process the submission`);
    return;
  }

  logger.error(`Job ${job?.id} failed: ${err.message}`);
  await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({ status: "Failed" }));
});


logger.info('Code execution workers started');
