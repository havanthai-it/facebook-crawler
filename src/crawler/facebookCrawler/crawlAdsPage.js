const puppeteer = require('puppeteer');
const logger = require('../../utils/logger');
const Browser = require('../../utils/Browser');
const adsPageQueue = require('./queues/adsPageQueue');
const FacebookPageDao = require('../../dao/FacebookPageDao');
const sleep = require('../../utils/funcs/sleep');

const crawlAdsPage = async () => {

  try {
    
    await Browser.init(async () => {
      // Sign in to Facebook
      const page = await Browser.instance.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('https://www.facebook.com/login/');
      try {
        // await login form
        await page.waitForSelector('#login_form');
        logger.info(`[CRAWL ADS PAGE] Loaded login page successfully`);

        await sleep(5000);

        await page.$eval('input[name="email"]', el => el.value = 'havanthaicvp@gmail.com');
        await page.$eval('input[name="pass"]', el => el.value = 'Dreadsteed@000');
        await page.click('button[name="login"]');
        await sleep(5000);
        await page.waitForSelector('div[role="main"]');
        logger.info(`[CRAWL ADS PAGE] Login successfully`);

        let listPage = await FacebookPageDao.list(1, 1000);
        if (listPage && Array.isArray(listPage)) {
          listPage.forEach(page => {
            adsPageQueue.add({
              url: `https://www.facebook.com/${page.s_username}/`
            });
          });
        }
      } catch (e) {
        logger.info(`[CRAWL ADS PAGE] Already login or there are some errors occured: ${e}`);
      }
    });

  } catch (e) {
    logger.error(`[CRAWL ADS PAGE] ${e}`);
    return;
  }
  
}

crawlAdsPage();
