const puppeteer = require('puppeteer');
const moment = require('moment');
const logger = require('../../../utils/logger');
const Browser = require('../../../utils/Browser');
const sleep = require('../../../utils/funcs/sleep');

/**
 * @param {string} url 
 * @returns {Promise<Array<string>>}
 */
const crawlKeyword = (keyword) => {
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

      let url = 'https://www.facebook.com/search/pages/?q=' + encodeURI(keyword);
      await page0.goto(url);

      try {
        // await list page result
        await page0.waitForSelector('.d2edcug0.glvd648r.o7dlgrpb');
        logger.info(`[CRAWL KEYWORD] Load successfully ${url}`);
      } catch (e) {
        logger.error(`[CRAWL KEYWORD] Can not get response ${url}`);
        if (page0) await page0.close();
        return reject(e);
      }

      // scroll
      let nScrolls = 10;
      for (let i = 0; i < nScrolls; i++) {
        logger.info(`[CRAWL KEYWORD] Scroll to bottom ${url}`);
        await sleep(5000 + 5000 * Math.random());
        await page0.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      }

      /* START GET PAGE INFORMATION */
      let listPageUrl = await page0.evaluate(() => {
        const elContainer = document.querySelector('.d2edcug0.glvd648r.o7dlgrpb');
        const elA = document.querySelectorAll('.sjgh65i0 h2.gmql0nx0.l94mrbxd.p1ri9a11.lzcic4wl.d2edcug0.hpfvmrgz a');

        let listPageUrl = [];
        elA.forEach(el => {
          listPageUrl.push(el.getAttribute('href'));
        });

        return listPageUrl;
      });

      // Close page
      if (page0) await page0.close();
      return resolve(listPageUrl);
    } catch (e) {
      logger.error(e);
      return reject(e);
    }
  });
}

module.exports = crawlKeyword;
