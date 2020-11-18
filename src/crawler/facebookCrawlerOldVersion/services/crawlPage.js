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
const crawlPage = (url, isNew) => {
  return new Promise(async (resolve, reject) => {
    let browser;
    try {
      // Check whether or not this page was crawled
      const username = url.split('?')[0].split('/')[3];
      const page = await FacebookPageDao.getByUsername(username);
      if (page && page.length > 0 && isNew) {
        // await FacebookPageDao.deletePageUrl(url);
        // If isNew = true and page was found on db
        // return reject(`[CRAWL PAGE] This page ${url} was already crawled`);
      } else if ((!page || page.length === 0) && !isNew) {
        // If isNew = false and page was not found on db
        // return reject(`[CRAWL PAGE] This page ${url} was not been crawled before`);
        isNew = true;
      }

      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--single-process', 
          '--disable-web-security',
          '--disable-dev-profile',
          '--disable-notifications'
          // '--proxy-server=SOCKS4://185.214.187.38:4145'
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
      await sleep(1000);

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
      let nScrolls = 2;
      if (isNew) {
        nScrolls = 4;
      }
      for (let i = 0; i < nScrolls; i++) {
        logger.info(`[CRAWL PAGE] Scroll to bottom ${url}`);
        await sleep(3000 + 3000 * Math.random());
        await page0.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      }


      /* START GET PAGE INFORMATION */
      let facebookPage = await page0.evaluate((countriesJson) => {
        const el0 = document.querySelector('head > meta[property="al:ios:url"]');
        const el1 = document.querySelector('#entity_sidebar ._19sz a._64-f');
        const el2 = document.querySelector('#entity_sidebar a._2dgj img._6tb5');
        const el3 = document.querySelector('#pages_side_column ._7jo_ ._3qnf > span');
        // const el5 = document.querySelector('');
        // const el6 = document.querySelector('');

        const lstAboutEle = document.querySelectorAll('#pages_side_column ._4-u2._u9q._3xaf._4-u8 ._2pi9._2pi2');
        const lstCommunityEle = document.querySelectorAll('#pages_side_column ._4-u2._6590._3xaf._4-u8 ._2pi9._2pi2');
        let country = '';
        let category = '';
        let likes = 0;
        let follows = 0;

        lstAboutEle.forEach(ele => {
          const iconEle = ele.querySelector('div._4bl7 > img');
          
          // country
          if (iconEle && iconEle.getAttribute('src') === 'https://static.xx.fbcdn.net/rsrc.php/v3/y5/r/vfXKA62x4Da.png') {
            const address = ele.innerText;
            const foundCountry = countriesJson.countries.find(c => {
              return address 
                && (address.toLowerCase().indexOf(c.name.toLowerCase()) > -1)
                && (address.indexOf(c.code) > -1);
            });
            country = foundCountry ? foundCountry.name : '';
          }

          // category
          if (iconEle && iconEle.getAttribute('src') === 'https://static.xx.fbcdn.net/rsrc.php/v3/yl/r/LwDWwC1d0Rx.png') {
            const cats = ele.innerText;
            category = cats.replace(/ · /g, ',');
          }
        });

        lstCommunityEle.forEach(ele => {
          const iconEle = ele.querySelector('div._4bl7 > img');

          // likes
          if (iconEle && iconEle.getAttribute('src') === 'https://static.xx.fbcdn.net/rsrc.php/v3/yg/r/AT9YNs6Rbpt.png') {
            likes = parseInt(ele.innerText.split(' ')[0].replace( /\D+/g, ''));
          }

          // follows
          if (iconEle && iconEle.getAttribute('src') === 'https://static.xx.fbcdn.net/rsrc.php/v3/y7/r/PL1sMLehMAU.png') {
            follows = parseInt(ele.innerText.split(' ')[0].replace( /\D+/g, ''));
          }
        });

        let result = {
          sUsername: el1 ? el1.getAttribute('href').split('?')[0].split('/')[3] : '',
          sName: el1 ? el1.innerText : '',
          sThumbnail: el2 ? el2.getAttribute('src') : '',
          sCategory: category,
          sCountry: country,
          nHasAds: 0,
          nLikes: likes,
          nFollows: follows,
          dPublish: el3 ? (el3.innerText.match(/Page created – /g) ? el3.innerText.substr(15).trim() : '') : '',
          sStatus: 'ACTIVE',
          lstAds: [],
          lstSimilarPages: []
        }

        return result;
      }, countriesJson);
      facebookPage.dPublish = DateUtils.convertFBDateToYYYYMMDD(facebookPage.dPublish);
      /* END GET PAGE INFORMATION */


      /* START GET SIMILAR PAGE */
      facebookPage.lstSimilarPages = await page0.evaluate(() => {
        let result = [];
        let items = document.querySelectorAll('#pages_side_column ul.uiList > li._4-lt');
        items.forEach(item => {
          const el0 = item.querySelector('a._4-lu');
          result.push(el0 ? el0.getAttribute('href') : '');
        });

        return result;
      });
      /* END GET SIMILAR PAGE */


      /* START GET ADS POST */
      let lstAds = await page0.evaluate((facebookPage) => {
        let result = [];
        let lstPostEle = document.querySelectorAll('div._1xnd > div._4-u2._4-u8:not([id]):not([class*="_3xaf"])');

        lstPostEle.forEach(item => {
          // TYPE
          let type = '';

          // GET POST ID
          let ele0 = item.querySelector('._5pcp._5lel .fsm a');
          let postUrl = ele0 ? ele0.getAttribute('href').split('?')[0] : '';
          postUrl = postUrl.endsWith('/') ? postUrl.substr(0, postUrl.length -1) : postUrl;
          let postId = postUrl ? postUrl.split('/')[postUrl.split('/').length - 1] : '';
 
          // GET IMAGES
          let ele1 = item.querySelectorAll('.mtm a img');
          let images = [];
          if (ele1) ele1.forEach(i => {
            images.push(i.getAttribute('src'))
            type = 'IMAGE';
          });

          // GET VIDEOS
          let ele2 = item.querySelector('.mtm ._150c img._3chq'); // Video thumbnail
          let ele3 = item.querySelector('.mtm video');
          let videos = [];
          if (ele3 && ele3.length > 0 && ele2) {
            images = [];
            images.push(ele2.getAttribute('src')); // Get thumbnail for video
            videos.push(ele3.getAttribute('src'));
            type = 'VIDEO';
          }

          // GET CONTENT
          let ele4 = item.querySelector('div._5pbx');
          let ele4ChildIgnores = ele4 ? ele4.querySelectorAll('text_exposed_hide') : [];
          ele4ChildIgnores.forEach(child => {
            child.parentNode.removeChild(child);
          });
          let content = ele4 ? ele4.innerHTML : '';

          // GET LIKES
          let ele5 = item.querySelector('div._68wo div._66lg a._3dlf');
          let likeStr = ele5 ? ele5.innerText : '';
          let likes = likeStr ? parseInt(likeStr.replace( /\D+/g, '')) : 0;

          // GET COMMENTS
          let ele6 = item.querySelector('div._68wo div._4vn1 a._3hg-');
          let commentStr = ele6 ? ele6.innerText : '';
          let comments = commentStr ? parseInt(commentStr.replace( /\D+/g, '')) : 0;

          // GET SHARES
          let ele7 = item.querySelector('div._68wo div._4vn1 a._3rwx');
          let shareStr = ele7 ? ele7.innerText : '';
          let shares = shareStr ? parseInt(shareStr.replace( /\D+/g, '')) : 0;

          // GET VIEWS

          // GET LINKS
          let ele8 = ele4 ? ele4.querySelectorAll('a') : [];
          let links = [];
          ele8.forEach(a => {
            let href = a.getAttribute('href'); // Sample: https://l.facebook.com/l.php?u=https%3A%2F%2Faothun.vn%2F
            let params = new URLSearchParams(href.split('?')[1]);
            if (params.get('u') && !links.find(l => l === params.get('u'))) links.push(params.get('u'));
          });
          if (links.length !== 1) return; // Ignore post that don't have any links or have multiple links

          // GET PUBLISHED DATE
          const now = new Date();
          let ele9 = item.querySelector('._5pcp._5lel .fsm');
          let arrDateTime = ele9 ? ele9.innerText.split('at') : []
          let pubishDateStr = arrDateTime.length > 0 ? arrDateTime[0].trim() : '';
          let publishTimeStr = arrDateTime.length > 1 ? (arrDateTime[1].trim() + ':00') : '00:00:00';
          let publishDate = '0000-00-00';
          if (pubishDateStr.indexOf('second') > -1 || pubishDateStr.indexOf('min') > -1 || pubishDateStr.indexOf('hour') > -1 || pubishDateStr.indexOf('hr') > -1 || pubishDateStr.indexOf('today') > -1) {
            publishDate = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) + '-' + now.getUTCDate();

            if (rawDatetime.indexOf('second') > -1) {
              let ss = rawDatetime.split(' ')[0].replace( /\D+/g, '');
              if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0 && (now.getUTCSeconds() - ss) < 0) {
                now.setMinutes(now.getMinutes() - 1);
                publishDate = now.getUTCFullYear() + '-' + ('00' + (now.getUTCMonth() + 1)).substr(-2) + '-' + ('00' + now.getUTCDate()).substr(-2);
                publishDate = publishDate + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes + ':00';
              } else {
                publishDate = publishDate + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes + ':00';
              }
            } else if (rawDatetime.indexOf('min') > -1) {
              let mm = rawDatetime.split(' ')[0].replace( /\D+/g, '');
              if (now.getUTCHours() === 0 && (now.getUTCMinutes() - mm) < 0) {
                now.setMinutes(now.getMinutes() - mm);
                publishDate = now.getUTCFullYear() + '-' + ('00' + (now.getUTCMonth() + 1)).substr(-2) + '-' + ('00' + now.getUTCDate()).substr(-2);
                publishDate = publishDate + ' ' + now.getUTCHours() + ':00:00';
              } else {
                publishDate = publishDate + ' ' + now.getUTCHours() + ':00:00';
              }
            } else if (rawDatetime.indexOf('hour') > -1 || rawDatetime.indexOf('hr') > -1) {
              let hh = rawDatetime.split(' ')[0].replace( /\D+/g, '');
              if (now.getUTCHours() - hh < 0) {
                now.setHours(now.getHours() - hh);
                publishDate = publishDate + ' ' + now.getUTCHours() + ':00:00';
              } else {
                publishDate = publishDate + ' ' + now.getUTCHours() + ':00:00';
              }
            } else {
              publishDate = publishDate + ' ' + '00:00:00';
            }
          } else {
            let publishDateStrArr = pubishDateStr.split(' ');
            if (publishDateStrArr.length < 2) return;
            if (publishDateStrArr.length > 3) return;
            if (isNaN(publishDateStrArr[0])) return;
      
            let date = ('0' + publishDateStrArr[0]).substr(-2);
            let month;
            let year = publishDateStrArr.length === 3 ? publishDateStrArr[2] : now.getUTCFullYear();
      
            if (publishDateStrArr[1] === 'January' || publishDateStrArr[1] === 'Jan') {
              month = '01';
            } else if (publishDateStrArr[1] === 'February' || publishDateStrArr[1] === 'Feb') {
              month = '02';
            } else if (publishDateStrArr[1] === 'March' || publishDateStrArr[1] === 'Mar') {
              month = '03';
            } else if (publishDateStrArr[1] === 'April' || publishDateStrArr[1] === 'Apr') {
              month = '04';
            } else if (publishDateStrArr[1] === 'May' || publishDateStrArr[1] === 'May') {
              month = '05';
            } else if (publishDateStrArr[1] === 'June' || publishDateStrArr[1] === 'June') {
              month = '06';
            } else if (publishDateStrArr[1] === 'July' || publishDateStrArr[1] === 'July') {
              month = '07';
            } else if (publishDateStrArr[1] === 'August' || publishDateStrArr[1] === 'Aug') {
              month = '08';
            } else if (publishDateStrArr[1] === 'September' || publishDateStrArr[1] === 'Sep') {
              month = '09';
            } else if (publishDateStrArr[1] === 'October' || publishDateStrArr[1] === 'Oct') {
              month = '10';
            } else if (publishDateStrArr[1] === 'November' || publishDateStrArr[1] === 'Nov') {
              month = '11';
            } else if (publishDateStrArr[1] === 'December' || publishDateStrArr[1] === 'Dec') {
              month = '12';
            }
            publishDate = year + '-' + month + '-' + date;
          }
          
          let post = {
            sPostId: postId,
            sAdsId: null,
            sPixelId: '',
            sFacebookPageUsername: facebookPage.sUsername,
            sImages: images.join(),
            sVideos: videos.join(),
            sContent: content,
            sType: type,
            sCategory: facebookPage.sCategory,
            sCountry: facebookPage.sCountry,
            sLanguage: null,
            nLikes: likes,
            nComments: comments,
            nShares: shares,
            nViews: 0,
            sStatus: 'ACTIVE',
            sLinks: links.join(),
            sWebsite: '',
            sPlatform: '',
            dPublish: publishDate + ' ' + publishTimeStr,
            //dCreate: '',
            //dUpdate: ''
          };
          if (post.sPostId && post.sImages && post.sFacebookPageUsername && post.sImages && post.sLinks) {
            result.push(post);
          }
          
        });

        return result;
      }, facebookPage);
      /* END GET ADS POST */


      // SET HASADS
      if (lstAds.length > 0) {

        // For each ads post, go to link in ads content to get platform, pixel id, website domain
        for (const post of lstAds) {

          /* START GO TO WEBSITE */
          const url1 = post.sLinks.split(',')[0];
          
          const page1 = await browser.newPage();
          await page1.setDefaultNavigationTimeout(60000);
          await page1.setViewport({ width: 1920, height: 1080 });

          try {
            await page1.goto(url1);
            await page1.waitForSelector('body');
            await sleep(5000);

            // GET WEBSITE
            let websiteUrl = page1.url();
            post.sWebsite = websiteUrl.split('/')[0] + '//' + websiteUrl.split('/')[2];
            post.sWebsite = post.sWebsite.toLowerCase();

            let newPost = await page1.evaluate((post) => {
              // GET PIXEL ID
              let scriptTag = document.querySelector('head script[src^="https://connect.facebook.net/signals/config"]');

              if (scriptTag) {
                let scriptLink = scriptTag.getAttribute('src').split('?')[0];
                post.sPixelId = scriptLink.split('/')[scriptLink.split('/').length - 1]
              } else {
                // No pixel id found => should not crawl this page
                return post;
              }

              // GET PLATFORM
              if (post.sWebsite.indexOf('amazon.com') > -1) {
                post.sPlatform = 'amazon';
              } else if (post.sWebsite.indexOf('ebay.com') > -1) {
                post.sPlatform = 'ebay';
              } else if (post.sWebsite.indexOf('teechip.com') > -1) {
                post.sPlatform = 'teechip';
              } else if (post.sWebsite.indexOf('teemill.com') > -1) {
                post.sPlatform = 'teemill';
              } else if (post.sWebsite.indexOf('sunfrog.com') > -1) {
                post.sPlatform = 'sunfrog';
              } else if (post.sWebsite.indexOf('teespring.com') > -1) {
                post.sPlatform = 'teespring';
              } else if (post.sWebsite.indexOf('etsy.com') > -1) {
                post.sPlatform = 'etsy';
              } else if (post.sWebsite.indexOf('printshop.com') > -1) {
                post.sPlatform = 'printshop';
              } else if (post.sWebsite.indexOf('teepublic.com') > -1) {
                post.sPlatform = 'teepublic';
              } else if (post.sWebsite.indexOf('redbubble.com') > -1) {
                post.sPlatform = 'redbubble';
              } else if (post.sWebsite.indexOf('spreadshirt.com') > -1) {
                post.sPlatform = 'spreadshirt';
              } else if (post.sWebsite.indexOf('teespy.com') > -1) {
                post.sPlatform = 'teespy';
              } else if (post.sWebsite.indexOf('bonfire.com') > -1) {
                post.sPlatform = 'bonfire';
              } else {
                if (document.querySelector('script[src*="shopify"]')) {
                  post.sPlatform = 'shopify';
                } else if (document.querySelector('div[class*="woocommerce"]')) {
                  post.sPlatform = 'woocommerce';
                } else if (document.querySelector('a[src*="bigcommerce"]')) {
                  post.sPlatform = 'bigcommerce';
                } else if (document.querySelector('script[data-requiremodule*="Magento_PageBuilder"]')) {
                  post.sPlatform = 'magento';
                }
              }

              return post;
            }, post);
            /* END GO TO WEBSITE */

            if (newPost.sPixelId) {
              facebookPage.lstAds.push(newPost);
            }
          } catch (e) {
            logger.error(`[CRAWL ADS] Can not get response ${url1} ${e}`);
          }

          await page1.close();

        }
        
      }

      // SET HASADS
      if (facebookPage.lstAds.length > 0) {
        facebookPage.nHasAds = 1;
      } else {
        facebookPage.nHasAds = 0;
      }

      // Close browser
      browser.close();
      return resolve(facebookPage);
    } catch (e) {
      logger.error(e);
      if (browser) browser.close();
      return reject(e);
    }
  });
}

module.exports = crawlPage;
