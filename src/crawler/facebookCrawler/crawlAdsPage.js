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

        await page.$eval('input[name="email"]', el => el.value = 'havanthai.it@gmail.com');
        await page.$eval('input[name="pass"]', el => el.value = 'Dreadsteed@000');
        await page.click('button[name="login"]');
        await sleep(5000);
        await page.waitForSelector('img.s45kfl79.emlxlaya.bkmhp75w.spb7xbtv');
        logger.info(`[CRAWL ADS PAGE] Login successfully`);

        await addToQueue(adsPageQueue);
        setInterval(async () => {
          adsPageQueue.count().then(async (n) => {
            logger.info(`[CRAWL ADS PAGE] adsPageQueue.count() = ${n}`);
            if (n === 0) await addToQueue(adsPageQueue);
          });
        }, 1000 * 60 * 30);
      } catch (e) {
        logger.info(`[CRAWL ADS PAGE] Already login or there are some errors occured: ${e}`);
      }
    });

  } catch (e) {
    logger.error(`[CRAWL ADS PAGE] ${e}`);
    return;
  }
  
}

const addToQueue = async (queue) => {
  await queue.empty();
  await queue.clean(0, 'active');
  await queue.clean(0, 'completed');
  await queue.clean(0, 'delayed');
  await queue.clean(0, 'failed');
  await queue.clean(0, 'wait');

  let listPage = await FacebookPageDao.list(1, 2, 500);
  if (listPage && Array.isArray(listPage)) {
    listPage.forEach(page => {
      queue.add({
        url: `https://www.facebook.com/${page.s_username}/`
      });
    });
  }
}

crawlAdsPage();
