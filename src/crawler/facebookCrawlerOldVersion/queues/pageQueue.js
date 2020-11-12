const Queue = require('bull');
const logger = require('../../../utils/logger');
const config = require('../../../config');
const FacebookPageDao = require('../../../dao/FacebookPageDao');
const FacebookAdsDao = require('../../../dao/FacebookAdsDao');
const crawlPage = require('../services/crawlPage');

const pageQueue = new Queue('pageQueue', 'redis://127.0.0.1:6379');
pageQueue.process(config.queue.pageQueue.concurrency, async (job) => {
  try {
    const p = job.data;
    logger.info(`[PAGE QUEUE] ${p.url}`);

    const facebookPage = await crawlPage(p.url, true);
    logger.info(`[PAGE QUEUE] crawled page info: ${JSON.stringify(facebookPage)}`);


    // Save page info
    const page = await FacebookPageDao.getByUsername(facebookPage.sUsername);
    if (!page || page.length === 0) {
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


    // Add similar pages to queue
    facebookPage.lstSimilarPages.forEach(async (url) => {
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

    await FacebookPageDao.deletePageUrl(p.url);

    return Promise.resolve(job.data);
  } catch (e) {
    logger.error(`[PAGE QUEUE] ${e}`);
    return Promise.reject(e);
  }
});

module.exports = pageQueue;
