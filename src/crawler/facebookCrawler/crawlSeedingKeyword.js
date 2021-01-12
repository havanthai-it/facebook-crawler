const puppeteer = require('puppeteer');
const logger = require('../../utils/logger');
const Browser = require('../../utils/Browser');
const seedingKeywordQueue = require('./queues/seedingKeywordQueue');
const FacebookPageDao = require('../../dao/FacebookPageDao');
const sleep = require('../../utils/funcs/sleep');

const crawlSeedingKeyword = async () => {

  try {
    
    await Browser.init(async () => {
      // Sign in to Facebook
      const page = await Browser.instance.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('https://www.facebook.com/login/');
      try {
        // await login form
        await page.waitForSelector('#login_form');
        logger.info(`[CRAWL SEEDING KEYWORD] Loaded login page successfully`);

        await sleep(5000);

        await page.$eval('input[name="email"]', el => el.value = 'havanthaicvp@gmail.com');
        await page.$eval('input[name="pass"]', el => el.value = 'Dreadsteed@001');
        await page.click('button[name="login"]');
        await sleep(5000);
        await page.waitForSelector('div[role="main"]');
        logger.info(`[CRAWL SEEDING KEYWORD] Login successfully`);

        let listSeedingKeyword = await FacebookPageDao.listSeedingKeyword(1000);
        if (listSeedingKeyword && Array.isArray(listSeedingKeyword)) {
          listSeedingKeyword.forEach(keyword => {
            seedingKeywordQueue.add({
              keyword: keyword.s_keyword
            });
          });
        }
      } catch (e) {
        logger.info(`[CRAWL SEEDING KEYWORD] Already login or there are some errors occured: ${e}`);
      }
    });

  } catch (e) {
    logger.error(`[CRAWL SEEDING KEYWORD] ${e}`);
    return;
  }
  
}

crawlSeedingKeyword();
