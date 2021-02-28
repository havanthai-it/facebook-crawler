const Queue = require('bull');
const logger = require('../../../utils/logger');
const Browser = require('../../../utils/Browser');
const sleep = require('../../../utils/funcs/sleep');
const config = require('../../../config');
const FacebookPageDao = require('../../../dao/FacebookPageDao');
const FacebookAdsDao = require('../../../dao/FacebookAdsDao');
const crawlSimilarPage = require('../services/crawlSimilarPage');

const similarPageQueue = new Queue('similarPageQueue', 'redis://127.0.0.1:6379');
similarPageQueue.process(config.queue.similarPageQueue.concurrency, async (job) => {
  try {
    if (!Browser.instance) {
      await sleep(60000);
    }

    logger.info(`[SIMILAR PAGE QUEUE] Start crawl ${job.data.url}`);

    const facebookPage = await crawlSimilarPage(job.data.url);
    logger.info(`[SIMILAR PAGE QUEUE] crawled page info: ${JSON.stringify(facebookPage)}`);

    // Save similar pages
    facebookPage.lstSimilarPages.forEach(async (url) => {
      const username = url.split('?')[0].split('/')[3];
      const page = await FacebookPageDao.getByUsername(username);

      // Add page url to queue if page is not crawled yet
      if (!page || page.length === 0) {
        url = url.split('?')[0];
        logger.info(`[SIMILAR PAGE QUEUE] SAVED ${url}`);
        await FacebookPageDao.insertPageUrl(url);
      }
    });

    await FacebookPageDao.deletePageUrl(job.data.url);
    
    return Promise.resolve(job.data);
  } catch (e) {
    logger.error(`[SIMILAR PAGE QUEUE] ${e}`);
    await FacebookPageDao.deletePageUrl(job.data.url);
    return Promise.resolve(e);
  }
});

module.exports = similarPageQueue;
