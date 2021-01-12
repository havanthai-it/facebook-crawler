const Queue = require('bull');
const logger = require('../../../utils/logger');
const config = require('../../../config');
const FacebookPageDao = require('../../../dao/FacebookPageDao');
const FacebookAdsDao = require('../../../dao/FacebookAdsDao');
const crawlPage = require('../services/crawlPage');

const pageQueue = new Queue('pageQueue', 'redis://127.0.0.1:6379');
pageQueue.process(config.queue.randomPageQueue.concurrency, async (job) => {
  try {
    logger.info(`[PAGE QUEUE] ${job.data.url}`);

    const lstSimilarPages = await crawlPage(job.data.url);
    logger.info(`[PAGE QUEUE] crawled page info: ${JSON.stringify({ lstSimilarPages: lstSimilarPages })}`);

    // Add similar pages to queue
    lstSimilarPages.forEach(async (url) => {
      const username = url.split('?')[0].split('/')[3];
      const page = await FacebookPageDao.getByUsername(username);

      // Add page url to queue if page is not crawled yet
      if (!page || page.length === 0) {
        url = url.split('?')[0];
        logger.info(`[PAGE QUEUE] ADDED ${url}`);
        pageQueue.add({ url: url });
        await FacebookPageDao.insertPageUrl(url);
      }
    });

    return Promise.resolve(job.data);
  } catch (e) {
    logger.error(`[PAGE QUEUE] ${e}`);
    return Promise.reject(e);
  }
});

module.exports = pageQueue;
