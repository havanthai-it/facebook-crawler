const puppeteer = require('puppeteer');
const moment = require('moment');
const logger = require('../../../utils/logger');
const Browser = require('../../../utils/Browser');
const sleep = require('../../../utils/funcs/sleep');
const FacebookPage = require('../../../models/FacebookPage');
const FacebookPageDao = require('../../../dao/FacebookPageDao');
const DateUtils = require('../../../utils/DateUtils');

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

        logger.info(`[CRAWL PAGE] Load successfully ${url}`);
      } catch (e) {
        logger.error(`[CRAWL PAGE] Can not get response ${url}`);
        if (page0) await page0.close();
        return reject(e);
      }


      // scroll
      let nScrolls = 5;
      for (let i = 0; i < nScrolls; i++) {
        logger.info(`[CRAWL PAGE] Scroll to bottom ${url}`);
        await sleep(5000 + 5000 * Math.random());
        await page0.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      }


      /* START GET PAGE INFORMATION */
      let facebookPage = await page0.evaluate(() => {
        // const el0 = document.querySelector('.bi6gxh9e.aov4n071 .tojvnm2t.a6sixzi8.abs2jz4q.a8s20v7p.t1p8iaqh.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.iyyx5f41');
        const el1 = document.querySelector('.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.rrkovp55.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.embtmqzv.fe6kdd0r.mau55g9w.c8b282yb.hrzyx87i.m6dqt4wy.h7mekvxk.hnhda86s.oo9gr5id.hzawbc8m');
        const el2 = document.querySelector('.b3onmgus.e5nlhep0.ph5uu5jm.ecm0bbzt.spb7xbtv.bkmhp75w.emlxlaya.s45kfl79.cwj9ozl2 image');
        const el3 = document.querySelector('.s9t1a10h > span');
        // const el5 = document.querySelector('');
        // const el6 = document.querySelector('');

        const lstAboutEle = document.querySelectorAll('.cbu4d94t.j83agx80.cwj9ozl2  .dwo3fsh8.g5ia77u1.rt8b4zig.n8ej3o3l.agehan2d.sk4xxmp2.rq0escxv.q9uorilb.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.l9j0dhe7.i1ao9s8h.k4urcfbm');
        let category = '';
        let likes = 0;
        let follows = 0;
        let publishDateStr = el3 ? (el3.innerText.match(/Page created - /g) ? el3.innerText.substr(15).trim() : '') : '';
        let publishDate = publishDateStr ? new Date(publishDateStr) : null;

        lstAboutEle.forEach(ele => {

          // category
          if (ele.querySelector('i.hu5pjgll.cwsop09l.sp_LM6_uToPDSq.sx_61eff3')) {
            category = ele.innerText.replace(/ · /g, ',');
          }

          // likes
          if (ele.innerText.indexOf('people like this') > -1) {
            likes = parseInt(ele.innerText.trim().split(' ')[0].replace( /\D+/g, ''));
          }

          // follows
          if (ele.innerText.indexOf('people follow this') > -1) {
            follows = parseInt(ele.innerText.trim().split(' ')[0].replace( /\D+/g, ''));
          }

        });

        let result = {
          sUsername: document.URL.split('?')[0].split('/')[3],
          sName: el1 ? el1.innerText : '',
          sThumbnail: el2 ? el2.getAttribute('xlink:href') : '',
          sCategory: category,
          sCountry: '',
          nHasAds: 0,
          nLikes: likes,
          nFollows: follows,
          dPublish: publishDate ? publishDate.getFullYear() + '-' + ('0' + (publishDate.getMonth() + 1)).substr(-2) + '-' + ('0' + publishDate.getDate()).substr(-2) : '',
          sStatus: 'ACTIVE',
          lstAds: [],
          lstSimilarPages: []
        };

        return result;
      });
      /* END GET PAGE INFORMATION */


      /* START GET SIMILAR PAGE */
      // facebookPage.lstSimilarPages = await page0.evaluate(() => {
      //   let result = [];
      //   let items = document.querySelectorAll('#pages_side_column ul.uiList > li._4-lt');
      //   items.forEach(item => {
      //     const el0 = item.querySelector('a._4-lu');
      //     result.push(el0 ? el0.getAttribute('href') : '');
      //   });

      //   return result;
      // });
      /* END GET SIMILAR PAGE */


      /* START GET ADS POST */
      let lstAds = await page0.evaluate((facebookPage) => {
        let result = [];
        let lstPostEle = document.querySelectorAll('.k4urcfbm .du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0');

        lstPostEle.forEach(item => {
          // TYPE
          let type = '';

          // GET POST ID
          let postId = '';
 
          // GET IMAGES
          let ele0 = item.querySelector('a.oajrlxb2.gs1a9yip.g5ia77u1.mtkw9kbi.tlpljxtp.qensuy8j.ppp5ayq2.goun2846.ccm00jje.s44p3ltw.mk2mc5f4.rt8b4zig.n8ej3o3l.agehan2d.sk4xxmp2.rq0escxv.nhd2j8a9.a8c37x1j.mg4g778l.btwxx1t3.pfnyh3mw.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.tgvbjcpo.hpfvmrgz.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.l9j0dhe7.i1ao9s8h.esuyzwwr.f1sip0of.du4w35lb.lzcic4wl.abiwlrkh.p8dawk7l.tm8avpzi');
          let ele1 = item.querySelectorAll('img.i09qtzwb.n7fi1qx3.datstx6m.pmk7jnqg.j9ispegn.kr520xx4.k4urcfbm');
          let images = [];
          if (ele0 && ele1) ele1.forEach(i => {
            images.push(i.getAttribute('src'))
            const url = ele0.getAttribute('href').split('?')[0];
            postId = url.split('/')[url.split('/').length - 1];
            if (!postId) postId = url.split('/')[url.split('/').length - 2];
            type = 'IMAGE';
          });

          // GET VIDEOS
          let ele2a = item.querySelector('img.datstx6m.dbpd2lw6'); // Video thumbnail
          let ele2 = item.querySelector('video.k4urcfbm.datstx6m.a8c37x1j');
          let ele3 = item.querySelector('a[aria-label="Enlarge"]');
          let videos = [];
          if (ele2 && ele2a && ele3) {
            images.push(ele2a.getAttribute('src'))
            videos.push(ele2.getAttribute('src'));
            const url = ele3.getAttribute('href').split('?')[0];
            postId = url.split('/')[url.split('/').length - 1]
            if (!postId) postId = url.split('/')[url.split('/').length - 2];
            type = 'VIDEO';
          }

          // CLICK SEE MORE BUTTON
          let eleSeeMore = item.querySelector('div.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.oo9gr5id.gpro0wi8.lrazzd5p');
          if (eleSeeMore) eleSeeMore.click();

          // GET CONTENT
          let ele4 = item.querySelector('span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.rrkovp55.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d3f4x2em.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.gfeo3gy3.a3bd9o3v.knj5qynh.oo9gr5id.hzawbc8m');
          let content = ele4 ? ele4.innerHTML : '';

          // GET BOTTOM ROW (LIKE, SHARE, COMMENT)
          let eleBottomRow = item.querySelector('.bp9cbjyn.m9osqain.j83agx80.jq4qci2q.bkfpd7mw.a3bd9o3v.kvgmc6g5.wkznzc2l.oygrvhab.dhix69tm.jktsbyx5.rz4wbd8a.osnr6wyh.a8nywdso.s1tcr66n');

          let likes = 0;
          let comments = 0;
          let shares = 0;
          if (eleBottomRow) {
            // GET LIKES
            let ele5 = eleBottomRow.querySelector('.bp9cbjyn.j83agx80.buofh1pr.ni8dbmo4.stjgntxs .bzsjyuwj.ni8dbmo4.stjgntxs.ltmttdrg.gjzvkazv');
            let likeStr = ele5 ? ele5.innerText : '';
            likes = likeStr ? parseInt(likeStr.replace( /\D+/g, '')) : 0;

            // GET COMMENTS
            let ele6 = eleBottomRow.querySelectorAll('.bp9cbjyn.j83agx80.pfnyh3mw.p1ueia1e span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.rrkovp55.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d3f4x2em.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.gfeo3gy3.a3bd9o3v.knj5qynh.m9osqain');
            if (ele6) ele6.forEach (i => {
              if (i.innerText.toLowerCase().indexOf('comment') > -1) {
                comments = i.innerText.replace( /\D+/g, '');
              } else if (i.innerText.toLowerCase().indexOf('share') > -1) {
                shares = i.innerText.replace( /\D+/g, '');
              }
            });
          }
          // GET VIEWS

          // GET LINKS
          let ele8 = ele4 ? ele4.querySelectorAll('a.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.py34i1dx.gpro0wi8') : [];
          let links = [];
          ele8.forEach(a => {
            let href = a.getAttribute('href'); // Sample: https://l.facebook.com/l.php?u=http%3A%2F%2Faothunjapan.com%2F%3Ffbclid%3DIwAR05Yh4k2-ZQh4xJoHBJCUarT-wvBILkEWmlX_LTorIJMgPF8y1obeMum24&h=AT1IfT4SMOt914SMODAQ1cuOetgvN2-xcnfy2OIbRnuT0BydfKXK7_liJacWx3B7O1BOWDi1ekBi0tNt9BYxGDv0KkhWgkATc1tyri_oP4QBJoIv-fwTR9d7649gc_8m58ek&__tn__=-UK-R&c[0]=AT1SP6jU-MwhOg6oScYISIkgd9cLxrRc07P7EJ6Ijbu3L8-caTCMhB_K3N-AHSVa4ahEvf1XpFCEDunGiVUzJm4Ph8DsynhxZfMrHHQckkbgJ983sfPFS6l4BtIVjQskVJEBP8ZGs_vXIF6xrW3scu8jJat_L_6skoWIbe2JY0aTcA
            let params = new URLSearchParams(href.split('?')[1]);
            let link = params.get('u') ? params.get('u').split('?')[0] : '';
            if (link && links.indexOf(link) === -1) links.push(link);
          });
          if (links.length !== 1) return; // Ignore post that don't have any links or have multiple links

          // GET PUBLISHED DATE
          const now = new Date();
          let ele9 = item.querySelector('.j1lvzwm4.stjgntxs.ni8dbmo4.q9uorilb.gpro0wi8');
          if (!ele9) return;
          let eleJunk = ele9.querySelectorAll('span.b6zbclly.myohyog2.l9j0dhe7.aenfhxwr.l94mrbxd.ihxqhq3m.nc684nl6.t5a262vz.sdhka5h4');
          if (eleJunk) eleJunk.forEach(i => {
            if (i.getAttribute('style') === 'position: absolute; top: 3em;') {
              i.parentNode.removeChild(i);
            }
          });

          let rawDatetime = ele9.innerText.trim();
          let datetime = '';
          let tempDatetime = '';
          if (rawDatetime.indexOf('second') > -1 || rawDatetime.indexOf('min') > -1 || rawDatetime.indexOf('hour') > -1 || rawDatetime.indexOf('hr') > -1) {
            datetime = now.getUTCFullYear() + '-' + ('00' + (now.getUTCMonth() + 1)).substr(-2) + '-' + ('00' + now.getUTCDate()).substr(-2);

            if (rawDatetime.indexOf('second') > -1) {
              let ss = rawDatetime.split(' ')[0].replace( /\D+/g, '');
              if (now.getHours() === 0 && now.getMinutes() === 0 && (now.getSeconds() - ss) < 0) {
                now.setMinutes(now.getMinutes() - 1);
                datetime = now.getUTCFullYear() + '-' + ('00' + (now.getUTCMonth() + 1)).substr(-2) + '-' + ('00' + now.getUTCDate()).substr(-2);
                datetime = datetime + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes + ':00';
              } else {
                datetime = datetime + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes + ':00';
              }
            } else if (rawDatetime.indexOf('min') > -1) {
              let mm = rawDatetime.split(' ')[0].replace( /\D+/g, '');
              if (now.getHours() === 0 && (now.getMinutes() - mm) < 0) {
                now.setMinutes(now.getMinutes() - mm);
                datetime = now.getUTCFullYear() + '-' + ('00' + (now.getUTCMonth() + 1)).substr(-2) + '-' + ('00' + now.getUTCDate()).substr(-2);
                datetime = datetime + ' ' + now.getUTCHours() + ':00:00';
              } else {
                datetime = datetime + ' ' + now.getUTCHours() + ':00:00';
              }
            } else if (rawDatetime.indexOf('hour') > -1 || rawDatetime.indexOf('hr') > -1) {
              let hh = rawDatetime.split(' ')[0].replace( /\D+/g, '');
              if (now.getHours() - hh < 0) {
                now.setHours(now.getHours() - hh);
                datetime = datetime + ' ' + now.getUTCHours() + ':00:00';
              } else {
                datetime = datetime + ' ' + now.getUTCHours() + ':00:00';
              }
            } else {
              datetime = datetime + ' ' + '00:00:00';
            }
          } else {
            let hasTime = true;
            if (rawDatetime.indexOf('at') > -1 && rawDatetime.indexOf(',') > -1) {
              tempDatetime = rawDatetime.replace('at', '').replace(',', '').replace(/\s\s+/g, ' ').replace(/\s/g, ' ');
            } else if (rawDatetime.indexOf('at') > -1 && rawDatetime.indexOf(',') === -1) {
              tempDatetime = rawDatetime.replace('at', now.getUTCFullYear()).replace(/\s/g, ' ');
            } else if (rawDatetime.indexOf('at') === -1 && rawDatetime.indexOf(',') > -1) {
              tempDatetime = rawDatetime.replace(',', '').replace(/\s/g, ' ');
              hasTime = false;
            } else if (rawDatetime.indexOf('at') === -1 && rawDatetime.indexOf(',') === -1) {
              tempDatetime = (rawDatetime + ' ' + now.getUTCFullYear()).replace(/\s/g, ' ');
              hasTime = false;
            }
            let datetimeObj = new Date(tempDatetime);
            datetime = datetimeObj.getUTCFullYear() + '-' + ('00' + (datetimeObj.getUTCMonth() + 1)).substr(-2) + '-' + ('00' + datetimeObj.getUTCDate()).substr(-2);
            if (hasTime) {
              datetime = datetime + ' ' + ('00' + datetimeObj.getUTCHours()).substr(-2) + ':' + ('00' + datetimeObj.getUTCMinutes()).substr(-2) + ':00';
            } else {
              datetime = datetime + ' ' + '00:00:00';
            }
          }
          
          if (postId && links.length > 0 && images.length > 0 && facebookPage.sUsername && links.length > 0) {
            result.push({
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
              dPublish: datetime,
              //dCreate: '',
              //dUpdate: ''
            });
          }
        });

        return result;
      }, facebookPage);
      /* END GET ADS POST */


      if (lstAds.length > 0) {

        // For each ads post, go to link in ads content to get platform, pixel id, website domain
        for (const post of lstAds) {

          /* START GO TO WEBSITE */
          const url1 = post.sLinks.split(',')[0];
          
          const page1 = await Browser.instance.newPage();
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
              } else if (post.sWebsite.indexOf('etsy.com') > -1) {
                post.sPlatform = 'etsy';
              } else if (post.sWebsite.indexOf('gearbubble.com') > -1) {
                post.sPlatform = 'gearbubble';
              } else if (post.sWebsite.indexOf('redbubble.com') > -1) {
                post.sPlatform = 'redbubble';
              } else if (post.sWebsite.indexOf('spreadshirt.com') > -1) {
                post.sPlatform = 'spreadshirt';
              } else if (post.sWebsite.indexOf('sunfrog.com') > -1) {
                post.sPlatform = 'sunfrog';
              } else if (post.sWebsite.indexOf('teehag.com') > -1) {
                post.sPlatform = 'teehag';
              } else if (post.sWebsite.indexOf('teespring.com') > -1) {
                post.sPlatform = 'teespring';
              } else if (post.sWebsite.indexOf('teepublic.com') > -1) {
                post.sPlatform = 'teepublic';
              } else if (post.sWebsite.indexOf('teechip.com') > -1 || document.getElementsByTagName('html')[0].innerHTML.search(/teechip/i) > -1) {
                post.sPlatform = 'teechip';
              } else if (post.sWebsite.indexOf('teezily.com') > -1 || document.getElementsByTagName('html')[0].innerHTML.search(/teezily/i) > -1) {
                post.sPlatform = 'teezily';
              } else {
                if (document.querySelector('script[src*="shopify"]')) {
                  post.sPlatform = 'shopify';
                } else if (document.querySelector('div[class*="woocommerce"]')) {
                  post.sPlatform = 'woocommerce';
                } else if (document.querySelector('a[src*="bigcommerce"]')) {
                  post.sPlatform = 'bigcommerce';
                } else if (document.querySelector('script[data-requiremodule*="Magento_PageBuilder"]')) {
                  post.sPlatform = 'magento';
                } else if (document.querySelector('link[href*="https://cdn.btdmp.com/"]')) {
                  post.sPlatform = 'shopbase';
                } else if (document.getElementsByTagName('html')[0].innerHTML.search(/teemill/i) > -1) {
                  post.sPlatform = 'teemill';
                } else if (document.getElementsByTagName('html')[0].innerHTML.search(/gearlaunch/i) > -1) {
                  post.sPlatform = 'gearlaunch';
                } else if (document.getElementsByTagName('html')[0].innerHTML.search(/merchize/i) > -1) {
                  post.sPlatform = 'merchize';
                } else if (document.getElementsByTagName('html')[0].innerHTML.search(/hostingrocket/i) > -1) {
                  post.sPlatform = 'hostingrocket';
                } else if (document.querySelector('link[href*="proui/"]') && document.querySelector('script[src*="proui/"]')) {
                  post.sPlatform = 'merchking';
                }
              }

              return post;
            }, post);
            /* END GO TO WEBSITE */

            if (newPost.sPixelId && newPost.sPlatform) {
              facebookPage.lstAds.push(newPost);
            }
          } catch (e) {
            logger.error(`[CRAWL ADS] Can not get response ${url1} ${e}`);
          }

          if (page1) await page1.close();
        }
        
      }

      // SET HASADS
      if (facebookPage.lstAds.length > 0) {
        facebookPage.nHasAds = 1;
      } else {
        facebookPage.nHasAds = 0;
      }

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
