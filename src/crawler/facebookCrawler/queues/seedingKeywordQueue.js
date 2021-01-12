const Queue = require('bull');
const logger = require('../../../utils/logger');
const Browser = require('../../../utils/Browser');
const sleep = require('../../../utils/funcs/sleep');
const config = require('../../../config');
const FacebookPageDao = require('../../../dao/FacebookPageDao');
const crawlKeyword = require('../services/crawlKeyword');

const seedingKeywordQueue = new Queue('seedingKeywordQueue', 'redis://127.0.0.1:6379');
seedingKeywordQueue.process(config.queue.seedingKeywordQueue.concurrency, async (job) => {
  try {
    if (!Browser.instance) {
      await sleep(60000);
    }

    logger.info(`[SEEDING KEYWORD QUEUE] Start crawl ${job.data.keyword}`);

    const listPageUrls = await crawlKeyword(job.data.keyword);
    logger.info(`[SEEDING KEYWORD QUEUE] crawled keyword info: ${JSON.stringify({ listPageUrls: listPageUrls })}`);

    listPageUrls.forEach(async (url) => {
      const pageUrl = await FacebookPageDao.getPageUrl(url);

      // Add page url to queue if page is not saved yet
      if (!pageUrl || pageUrl.length === 0) {
        logger.info(`[PAGE QUEUE] ADDED ${url}`);
        await FacebookPageDao.insertPageUrl(url);
      }
    });

    await FacebookPageDao.deleteSeedingKeyword(job.data.keyword);

    return Promise.resolve(job.data);
  } catch (e) {
    logger.error(`[SEEDING KEYWORD QUEUE] ${e}`);
    return Promise.reject(e);
  }
});

module.exports = seedingKeywordQueue;
