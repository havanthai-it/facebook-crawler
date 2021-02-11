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
 * @returns {Promise<FacebookPost>}
 */
const crawlPost = (url) => {
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
        // await post
        await page0.waitForSelector('.d2edcug0.oh7imozk.tr9rh885.abvwweq7.ejjq64ki');

        logger.info(`[CRAWL POST] Load successfully ${url}`);
      } catch (e) {
        logger.error(`[CRAWL POST] Can not get response ${url}`);
        if (page0) await page0.close();
        return reject(e);
      }

      /* START GET ADS POST */
      let facebookPost = await page0.evaluate(() => {
        let postEle = document.querySelector('.d2edcug0.oh7imozk.tr9rh885.abvwweq7.ejjq64ki');

        // GET BOTTOM ROW (LIKE, SHARE, COMMENT)
        let eleBottomRow = postEle.querySelector('.bp9cbjyn.m9osqain.j83agx80.jq4qci2q.bkfpd7mw.a3bd9o3v.kvgmc6g5.wkznzc2l.oygrvhab.dhix69tm.jktsbyx5.rz4wbd8a.osnr6wyh.a8nywdso.s1tcr66n');

        let likes = 0;
        let comments = 0;
        let shares = 0;
        if (eleBottomRow) {
          // GET LIKES
          let ele5 = eleBottomRow.querySelector('.bp9cbjyn.j83agx80.buofh1pr.ni8dbmo4.stjgntxs .bzsjyuwj.ni8dbmo4.stjgntxs.ltmttdrg.gjzvkazv');
          let likeStr = ele5 ? ele5.innerText : '';
          likes = likeStr ? parseInt(likeStr.replace( /\D+/g, '')) : 0;

          // GET COMMENTS, SHARES
          let ele6 = eleBottomRow.querySelectorAll('.bp9cbjyn.j83agx80.pfnyh3mw.p1ueia1e span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.rrkovp55.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d3f4x2em.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.gfeo3gy3.a3bd9o3v.knj5qynh.m9osqain');
          if (ele6) ele6.forEach (i => {
            if (i.innerText.toLowerCase().indexOf('comment') > -1) {
              comments = i.innerText.replace( /\D+/g, '');
            } else if (i.innerText.toLowerCase().indexOf('share') > -1) {
              shares = i.innerText.replace( /\D+/g, '');
            }
          });
        }
        
        return {
          sPostId: '',
          sFacebookPageUsername: '',
          nLikes: likes,
          nComments: comments,
          nShares: shares,
          nViews: 0
        };

      });
      /* END GET ADS POST */

      // Close page
      if (page0) await page0.close();
      return resolve(facebookPost);
    } catch (e) {
      logger.error(e);
      return reject(e);
    }
  });
}

module.exports = crawlPost;
