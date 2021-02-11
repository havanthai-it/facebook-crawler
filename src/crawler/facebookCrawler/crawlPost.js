const puppeteer = require('puppeteer');
const logger = require('../../utils/logger');
const Browser = require('../../utils/Browser');
const postQueue = require('./queues/postQueue');
const FacebookAdsDao = require('../../dao/FacebookAdsDao');
const sleep = require('../../utils/funcs/sleep');

const crawlPost = async () => {

  try {
    
    await Browser.init(async () => {
      // Sign in to Facebook
      const page = await Browser.instance.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('https://www.facebook.com/login/');
      try {
        // await login form
        await page.waitForSelector('#login_form');
        logger.info(`[CRAWL POST] Loaded login page successfully`);

        await sleep(5000);

        await page.$eval('input[name="email"]', el => el.value = 'havanthaicvp@gmail.com');
        await page.$eval('input[name="pass"]', el => el.value = 'Dreadsteed@001');
        await page.click('button[name="login"]');
        await sleep(5000);
        await page.waitForSelector('div[role="main"]');
        logger.info(`[CRAWL POST] Login successfully`);

        postQueue.empty().then(async () => {
          let listPost = await FacebookAdsDao.listTrackedPost(1000);
          if (listPost && Array.isArray(listPost)) {
            listPost.forEach(p => {
              postQueue.add({
                postId: p.s_post_id,
                facebookPageUsername: p.s_facebook_page_username,
                url:`https://facebook.com/${p.s_facebook_page_username}/posts/${p.s_post_id}`
              });
            });
          }
        }).catch(e => {
          logger.error(`[CRAWL POST] Error while add page url to postQueue: ${e}`);
        });
      } catch (e) {
        logger.error(`[CRAWL POST] Already login or there are some errors occured: ${e}`);
      }
    });

  } catch (e) {
    logger.error(`[CRAWL POST] ${e}`);
    return;
  }
  
}

crawlPost();
