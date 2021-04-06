const puppeteer = require('puppeteer');
const logger = require('../../utils/logger');
const Browser = require('../../utils/Browser');
const urlPageQueue = require('./queues/urlPageQueue');
const FacebookPageDao = require('../../dao/FacebookPageDao');
const sleep = require('../../utils/funcs/sleep');

const crawlUrlPage = async () => {

  try {
    
    await Browser.init(async () => {
      // Sign in to Facebook
      const page = await Browser.instance.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('https://www.facebook.com/login/');
      try {
        // await login form
        await page.waitForSelector('#login_form');
        logger.info(`[CRAWL URL PAGE] Loaded login page successfully`);

        await sleep(5000);

        await page.$eval('input[name="email"]', el => el.value = '0562038008');
        await page.$eval('input[name="pass"]', el => el.value = 'Dreadsteed@000');
        await page.click('button[name="login"]');
        await sleep(5000);
        await page.waitForSelector('img.s45kfl79.emlxlaya.bkmhp75w.spb7xbtv');
        logger.info(`[CRAWL URL PAGE] Login successfully`);

        await addToQueue(urlPageQueue);
        setInterval(async () => {
          urlPageQueue.count().then(async (n) => {
            logger.info(`[CRAWL URL PAGE] urlPageQueue.count() = ${n}`);
            if (n === 0) await addToQueue(urlPageQueue);
          });
        }, 1000 * 60 * 30);
      } catch (e) {
        logger.error(`[CRAWL URL PAGE] Already login or there are some errors occured: ${e}`);
      }
    });

  } catch (e) {
    logger.error(`[CRAWL URL PAGE] ${e}`);
    return;
  }
  
}

const addToQueue = async (queue) => {
  await queue.empty();
  await queue.clean(0, 'active');
  await queue.clean(0, 'completed');
  await queue.clean(0, 'delayed');
  await queue.clean(0, 'failed');

  let listPageUrl = await FacebookPageDao.listPageUrl(2000, 4000);
  if (listPageUrl && Array.isArray(listPageUrl)) {
    listPageUrl.forEach(url => {
      queue.add({
        url: url.s_url
      });
    });
  }
}

crawlUrlPage();
