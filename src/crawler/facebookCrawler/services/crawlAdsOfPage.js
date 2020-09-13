const puppeteer = require('puppeteer');
const logger = require('./../../../utils/logger');

/**
 * @param {string} facebookPageId 
 * @return {Promise<Array>}
 */
const crawlstAdsOfPage = (facebookPageId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `https://www.facebook.com/ads/library/?view_all_page_id=${facebookPageId}&active_status=all&ad_type=all&country=ALL&impression_search_field=has_impressions_lifetime`;

      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url);

      try {
        await page.waitForSelector('div._99s8 > div._99sa', { timeout: 10000 });
      } catch (e) {
        logger.error(`[CRAWL ADS] Can not get response ${url}`);
        return;
      }

      let ads = await page.evaluate((facebookPageId) => {
        let result = [];
        let items = document.querySelectorAll('div._99s8 > div._99sa > div._99s5');
        items.forEach(item => {
          const el0 = item.querySelector('._8jox > ._4rhp');
          const el1 = item.querySelector('._7jwu > span');
          const el2 = item.querySelector('._7jv- > ._7jw1');
          const el3 = item.querySelector('._7jyr ._4ik4._4ik5');

          let adsType = '';
          let thumbnail = '';
          if (item.querySelector('._231w._231z._4yee > img')) {
            adsType = 'IMAGE';
            thumbnail = item.querySelector('._231w._231z._4yee > img').getAttribute('src');
          } else if (item.querySelector('._8o0a._8o0b > video')) {
            adsType = 'VIDEO';
            thumbnail = item.querySelector('._8o0a._8o0b > video').getAttribute('poster');
          }
          const idText = el0 ? el0.innerText : '';
          
          result.push({
            sFacebookPageId: facebookPageId,
            sFacebookId: idText.match(/ID: \d*/g) ? idText.substr(3).trim() : '',
            sThumbnail: thumbnail,
            sContent: el3 ? el3.innerHTML : '',
            sType: adsType,
            sCategory: '',
            nLikes: '',
            nComments: '',
            nShares: '',
            dPublish: el1 ? el1.innerText : '',
            sStatus: el2 ? el2.innerText : ''
          });
        });

        return result;
      }, facebookPageId);

      return resolve(ads);
    } catch (e) {
      logger.error(e);
      return reject(e);
    }
  });
}

module.exports = crawlstAdsOfPage;
