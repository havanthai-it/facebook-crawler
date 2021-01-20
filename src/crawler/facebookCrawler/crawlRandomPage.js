const puppeteer = require('puppeteer');
const logger = require('../../utils/logger');
const Browser = require('../../utils/Browser');
const randomPageQueue = require('./queues/randomPageQueue');
const FacebookPageDao = require('../../dao/FacebookPageDao');
const sleep = require('../../utils/funcs/sleep');

const crawlRandomPage = async () => {
  const url = 'https://www.facebook.com/saitamaonepunchmantshirt/';

  try {
    // Check whether or not this page was crawled
    const username = url.split('?')[0].split('/')[3];
    const foundPage = await FacebookPageDao.getByUsername(username);
    if (foundPage && foundPage.length) {
      logger.info(`[CRAWL RANDOM PAGE] This page ${url} was already crawled`);
      // return;
    }

    await Browser.init(async () => {
      // Sign in to Facebook
      const page = await Browser.instance.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('https://www.facebook.com/login/');
      try {
        // await login form
        await page.waitForSelector('#login_form');
        logger.info(`[CRAWL RANDOM PAGE] Loaded login page successfully`);

        await sleep(5000);

        await page.$eval('input[name="email"]', el => el.value = 'havanthaicvp@gmail.com');
        await page.$eval('input[name="pass"]', el => el.value = 'Dreadsteed@001');
        await page.click('button[name="login"]');
        await sleep(5000);
        await page.waitForSelector('div[role="main"]');
        logger.info(`[CRAWL RANDOM PAGE] Login successfully`);

        randomPageQueue.add({
          url: url
        });
      } catch (e) {
        logger.info(`[CRAWL RANDOM PAGE] Already login or there are some errors occured: ${e}`);
      }
    });

  } catch (e) {
    logger.error(`[CRAWL RANDOM PAGE] ${e}`);
    return;
  }
  
}



crawlRandomPage();
