const puppeteer = require('puppeteer');
const moment = require('moment');
const logger = require('../../../utils/logger');
const Browser = require('../../../utils/Browser');
const sleep = require('../../../utils/funcs/sleep');
const randomString = require('../../../utils/funcs/randomString');
const FacebookPage = require('../../../models/FacebookPage');
const FacebookPageDao = require('../../../dao/FacebookPageDao');
const DateUtils = require('../../../utils/DateUtils');
const FileUtils = require('../../../utils/FileUtils');
const DOSpaceClient = require('../../../ext/DOSpaceClient');
const config = require('../../../config');

/**
 * @param {string} url 
 * @returns {Promise<FacebookPage>}
 */
const crawlPage = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page0 = await Browser.instance.newPage();
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

      try {
        // await new feed
        await page0.waitForSelector('.k4urcfbm.dp1hu0rb.d2edcug0.cbu4d94t.j83agx80.bp9cbjyn');
        // await related page
        await page0.waitForSelector('.sjgh65i0');

        logger.info(`[CRAWL SIMILAR PAGE] Load successfully ${url}`);
      } catch (e) {
        logger.error(`[CRAWL SIMILAR PAGE] Can not get response ${url}`);
        if (page0) await page0.close();
        return reject(e);
      }

      await sleep(3000 + 3000 * Math.random());

      let facebookPage = {};

      /* START GET SIMILAR PAGE */
      facebookPage.lstSimilarPages = await page0.evaluate(() => {
        let result = [];
        let items = document.querySelectorAll('div.b20td4e0.muag1w35 div.ue3kfks5.pw54ja7n.uo3d90p7.l82x9zwi.a8c37x1j');
        items.forEach(item => {
          const el0 = item.querySelector('a');
          result.push(el0 ? el0.getAttribute('href') : '');
        });

        return result;
      });
      /* END GET SIMILAR PAGE */

      // Close page
      if (page0) await page0.close();
      return resolve(facebookPage);
    } catch (e) {
      logger.error(e);
      return reject(e);
    }
  });
}

module.exports = crawlPage;
