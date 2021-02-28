const puppeteer = require('puppeteer');
const logger = require('../../utils/logger');
const Browser = require('../../utils/Browser');
const similarPageQueue = require('./queues/similarPageQueue');
const FacebookPageDao = require('../../dao/FacebookPageDao');
const sleep = require('../../utils/funcs/sleep');

const crawlSimilarPage = async () => {

  try {
    
    await Browser.init(async () => {
      // Sign in to Facebook
      const page = await Browser.instance.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('https://www.facebook.com/login/');
      try {
        // await login form
        await page.waitForSelector('#login_form');
        logger.info(`[CRAWL SIMILAR PAGE] Loaded login page successfully`);

        await sleep(5000);

        await page.$eval('input[name="email"]', el => el.value = 'havanthaicvp@gmail.com');
        await page.$eval('input[name="pass"]', el => el.value = 'Dreadsteed@001');
        await page.click('button[name="login"]');
        await sleep(5000);
        await page.waitForSelector('div[role="main"]');
        logger.info(`[CRAWL SIMILAR PAGE] Login successfully`);

        similarPageQueue.empty().then(async () => {
          let listPageUrl = await FacebookPageDao.listPageUrl(1000, 0);
          if (listPageUrl && Array.isArray(listPageUrl)) {
            listPageUrl.forEach(url => {
              similarPageQueue.add({
                url: url.s_url
              });
            });
          }
        }).catch(e => {
          logger.error(`[CRAWL SIMILAR PAGE] Error while add page url to similarPageQueue: ${e}`);
        });
      } catch (e) {
        logger.error(`[CRAWL SIMILAR PAGE] Already login or there are some errors occured: ${e}`);
      }
    });

  } catch (e) {
    logger.error(`[CRAWL SIMILAR PAGE] ${e}`);
    return;
  }
  
}

crawlSimilarPage();
