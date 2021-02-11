const Queue = require('bull');
const logger = require('../../../utils/logger');
const Browser = require('../../../utils/Browser');
const sleep = require('../../../utils/funcs/sleep');
const config = require('../../../config');
const FacebookAdsDao = require('../../../dao/FacebookAdsDao');
const crawlPost = require('../services/crawlPost');

const postQueue = new Queue('postQueue', 'redis://127.0.0.1:6379');
postQueue.process(config.queue.postQueue.concurrency, async (job) => {
  try {
    if (!Browser.instance) {
      await sleep(60000);
    }

    logger.info(`[POST QUEUE] Start crawl ${job.data.url}`);

    // Check whether or not this page was crawled
    const facebookPost = await crawlPost(job.data.url);
    logger.info(`[POST QUEUE] crawled post info: ${JSON.stringify(facebookPost)}`);

    // Save post info
    const foundPost = await FacebookAdsDao.getByPostId(facebookPost.sPostId);
    if (!foundPost || foundPost.length === 0) {
      await FacebookAdsDao.insert(facebookPost);
    } else {
      await FacebookAdsDao.update(facebookPost);
    }
    await FacebookAdsDao.insertStatistic(facebookPost);

    return Promise.resolve(job.data);
  } catch (e) {
    logger.error(`[POST QUEUE] ${e}`);
    return Promise.resolve(e);
  }
});

module.exports = urlPageQueue;
