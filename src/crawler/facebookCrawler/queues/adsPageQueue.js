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
  try {
    if (!Browser.instance) {
      await sleep(60000);
    }

    logger.info(`[ADS PAGE QUEUE] Start crawl ${job.data.url}`);

    const username = job.data.url.split('?')[0].split('/')[3];
    const foundPage = await FacebookPageDao.getByUsername(username);

    const facebookPage = await crawlPage(job.data.url, false);
    logger.info(`[ADS PAGE QUEUE] crawled page info: ${JSON.stringify(facebookPage)}`);

    // Save page info
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
    
    return Promise.resolve(job.data);
  } catch (e) {
    logger.error(`[ADS PAGE QUEUE] ${e}`);
    return Promise.reject(e);
  }
});

module.exports = adsPageQueue;
