const puppeteer = require('puppeteer');
const moment = require('moment');
const logger = require('../../../utils/logger');
const sleep = require('../../../utils/funcs/sleep');
const FacebookPage = require('../../../models/FacebookPage');
const FacebookPageDao = require('../../../dao/FacebookPageDao');
const countriesJson = require('../../../assets/data/countries.json');
const DateUtils = require('../../../utils/DateUtils');

/**
 * @param {string} url 
 * @returns {Promise<FacebookPage>}
 */
const crawlPage = (url) => {
  return new Promise(async (resolve, reject) => {
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: false,
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--single-process', 
          '--disable-web-security',
          '--disable-dev-profile',
          '--disable-notifications'
          //'--proxy-server=HTTP://208.138.24.254:80'
        ]
      });
      const page0 = await browser.newPage();
      await page0.setDefaultNavigationTimeout(60000);
      await page0.setViewport({ width: 1920, height: 1080 });

      const cookies = [
        {
          'name': 'locale',
          'value': 'en_US',
          'domain': '.facebook.com'
        }
      ];
      await page0.setCookie(...cookies);
      await page0.goto(url);

      // Slow down the process
      await sleep(10000);

      try {
        // await new feed
        await page0.waitForSelector('#pagelet_timeline_main_column');
        // await similar page
        await page0.waitForSelector('#pages_side_column ul.uiList');

        logger.info(`[CRAWL PAGE] Load successfully ${url}`);
      } catch (e) {
        logger.error(`[CRAWL PAGE] Can not get response ${url}`);
        browser.close();
        return reject(e);
      }


      // if this page has never been crawled before, scroll to bottom 3 times
      // else scroll to bottom 1 times
      let nScrolls = 1;
      for (let i = 0; i < nScrolls; i++) {
        logger.info(`[CRAWL PAGE] Scroll to bottom ${url}`);
        await sleep(10000);
        await page0.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      }

      /* START GET SIMILAR PAGE */
      let lstSimilarPages = await page0.evaluate(() => {
        let result = [];
        let items = document.querySelectorAll('#pages_side_column ul.uiList > li._4-lt');
        items.forEach(item => {
          const el0 = item.querySelector('a._4-lu');
          result.push(el0 ? el0.getAttribute('href') : '');
        });

        return result;
      });
      /* END GET SIMILAR PAGE */

      // Close browser
      browser.close();
      return resolve(lstSimilarPages);
    } catch (e) {
      logger.error(e);
      if (browser) browser.close();
      return reject(e);
    }
  });
}

module.exports = crawlPage;
