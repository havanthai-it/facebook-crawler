const Queue = require('bull');
const logger = require('../../../utils/logger');
const Browser = require('../../../utils/Browser');
const sleep = require('../../../utils/funcs/sleep');
const config = require('../../../config');
const FacebookPageDao = require('../../../dao/FacebookPageDao');
const FacebookAdsDao = require('../../../dao/FacebookAdsDao');
const crawlPage = require('../services/crawlPage');

const adsPageQueue = new Queue('adsPageQueue', 'redis://127.0.0.1:6379');
adsPageQueue.process(config.queue.adsPageQueue.concurrency, async (job) => {
  let username = null;
  let foundPage = null;
  let facebookPage = null;
  try {
    if (!Browser.instance) {
      await sleep(60000);
    }

    logger.info(`[ADS PAGE QUEUE] Start crawl ${job.data.url}`);

    username = job.data.url.split('?')[0].split('/')[3];
    foundPage = await FacebookPageDao.getByUsername(username);

    facebookPage = await crawlPage(job.data.url);
    logger.info(`[ADS PAGE QUEUE] crawled page info: ${JSON.stringify(facebookPage)}`);

    // Save page info
    if (!foundPage || foundPage.length === 0) {
      await FacebookPageDao.insert(facebookPage);
    } else {
      facebookPage.nHasAds = 1;
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
    
    return Promise.resolve(job.data);
  } catch (e) {
    logger.error(`[ADS PAGE QUEUE] ${e}`);
    if (username && facebookPage && foundPage && foundPage.length > 0) {
      facebookPage.nHasAds = 98;
    }
    return Promise.reject(e);
  }
});

module.exports = adsPageQueue;
