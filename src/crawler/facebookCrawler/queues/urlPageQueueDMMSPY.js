const Queue = require('bull');
const logger = require('../../../utils/logger');
const Browser = require('../../../utils/Browser');
const sleep = require('../../../utils/funcs/sleep');
const config = require('../../../config');
const FacebookPageDao = require('../../../dao/FacebookPageDao');
const FacebookAdsDao = require('../../../dao/FacebookAdsDao');
const crawlPage = require('../services/crawlPage');

const urlPageQueue = new Queue('urlPageQueue', 'redis://127.0.0.1:6379');
urlPageQueue.process(config.queue.urlPageQueue.concurrency, async (job) => {
  try {
    if (!Browser.instance) {
      await sleep(60000);
    }

    logger.info(`[URL PAGE QUEUE] Start crawl ${job.data.url}`);

    const facebookPage = await crawlPage(job.data.url);
    logger.info(`[URL PAGE QUEUE] crawled page info: ${JSON.stringify(facebookPage)}`);

    // Save page info
    const foundPage = await FacebookPageDao.getByUsername(facebookPage.sUsername);
    if (!foundPage || foundPage.length === 0) {
      await FacebookPageDao.insert(facebookPage);
    } else {
      await FacebookPageDao.update(facebookPage);
    }

    // Save post info
    facebookPage.lstAds.forEach(async (post) => {
      const foundPost = await FacebookAdsDao.getByPostId(post.sPostId);
      if (!foundPost || foundPost.length === 0) {
        await FacebookAdsDao.insert(post);
      } else {
        await FacebookAdsDao.update(post);
      }
      await FacebookAdsDao.insertStatistic(post);
    });

    // Save similar pages
    facebookPage.lstSimilarPages.forEach(async (url) => {
      const username = url.split('?')[0].split('/')[3];
      const page = await FacebookPageDao.getByUsername(username);

      // Add page url to queue if page is not crawled yet
      if (!page || page.length === 0) {
        url = url.split('?')[0];
        logger.info(`[URL PAGE QUEUE] SAVED ${url}`);
        await FacebookPageDao.insertPageUrl(url);
      }
    });

    // await FacebookPageDao.deletePageUrl(job.data.url);
    
    return Promise.resolve(job.data);
  } catch (e) {
    logger.error(`[URL PAGE QUEUE] ${e}`);
    // await FacebookPageDao.deletePageUrl(job.data.url);
    return Promise.resolve(e);
  }
});

module.exports = urlPageQueue;
