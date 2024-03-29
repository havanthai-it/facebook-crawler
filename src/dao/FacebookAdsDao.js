const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const poolConnection = require('./PoolConnection');
const FacebookPost = require('../models/FacebookPost');

class FacebookAdsDao {

  constructor() {}

  /**
   * @param {string} id 
   * @returns {FacebookPost}
   */
  static async get(id) {
    const query = "SELECT * FROM tb_facebook_post WHERE s_id = ?";
    const result = await poolConnection.query(query, [id]);
    return result;
  }

  /**
   * @param {string} postId 
   * @returns {FacebookPost}
   */
  static async getByPostId(postId) {
    const query = "SELECT * FROM tb_facebook_post WHERE s_post_id = ?";
    const result = await poolConnection.query(query, [postId]);
    return result;
  }

  /**
   * @param {FacebookPost} facebookAds
   * @returns {boolean}
   */
  static async insert(facebookAds) {
    const query = "INSERT INTO "
      + " tb_facebook_post ( "
      + " s_id, "
      + " s_ads_id, "
      + " s_post_id, "
      + " s_pixel_id, "
      + " s_facebook_page_username, "
      + " s_images, "
      + " s_videos, "
      + " s_content, "
      + " s_type, "
      + " s_category, "
      + " s_country, "
      + " s_language, "
      + " n_likes, "
      + " n_comments, "
      + " n_shares, "
      + " n_views, "
      + " s_status, "
      + " s_links, "
      + " s_website, "
      + " s_platform, "
      + " d_publish "
      + " ) "
      + " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const params = [
      facebookAds.sId ? facebookAds.sId : uuidv4().replace(/-/g, ''),
      facebookAds.sAdsId,
      facebookAds.sPostId,
      facebookAds.sPixelId,
      facebookAds.sFacebookPageUsername,
      facebookAds.sImages,
      facebookAds.sVideos,
      facebookAds.sContent,
      facebookAds.sType,
      facebookAds.sCategory,
      facebookAds.sCountry,
      facebookAds.sLanguage,
      facebookAds.nLikes ? parseInt(facebookAds.nLikes + '') : 0,
      facebookAds.nComments ? parseInt(facebookAds.nComments + '') : 0,
      facebookAds.nShares ? parseInt(facebookAds.nShares + '') : 0,
      facebookAds.nViews ? parseInt(facebookAds.nViews + '') : 0,
      facebookAds.sStatus,
      facebookAds.sLinks,
      facebookAds.sWebsite,
      facebookAds.sPlatform,
      moment(facebookAds.dPublish).utc().format('YYYY-MM-DD HH:mm:ss')
    ];
    const result = await poolConnection.query(query, params);
    return result;
  }

  /**
   * @param {FacebookPost} facebookAds
   * @returns {boolean}
   */
  static async update(facebookAds) {
    const query = "UPDATE tb_facebook_post SET "
      + " s_images = ?, "
      + " s_videos = ?, "
      + " s_content = ?, "
      + " s_type = ?, "
      + " s_category = ?, "
      + " s_country = ?, "
      + " s_language = ?, "
      + " n_likes = ?, "
      + " n_comments = ?, "
      + " n_shares = ?, "
      + " n_views = ?, "
      + " s_status = ?, "
      + " s_links = ?, "
      + " s_website = ?, "
      + " s_platform = ?, "
      + " d_update = ? "
      + " WHERE s_id = ? ";
    const params = [
      facebookAds.sImages,
      facebookAds.sVideos,
      facebookAds.sContent,
      facebookAds.sType,
      facebookAds.sCategory,
      facebookAds.sCountry,
      facebookAds.sLanguage,
      facebookAds.nLikes ? parseInt(facebookAds.nLikes + '') : 0,
      facebookAds.nComments ? parseInt(facebookAds.nComments + '') : 0,
      facebookAds.nShares ? parseInt(facebookAds.nShares + '') : 0,
      facebookAds.nViews ? parseInt(facebookAds.nViews + '') : 0,
      facebookAds.sStatus,
      facebookAds.sLinks,
      facebookAds.sWebsite,
      facebookAds.sPlatform,
      moment(Date.now()).utc().format('YYYY-MM-DD HH:mm:ss'),
      facebookAds.sId,
    ];
    const result = await poolConnection.query(query, params);
    return result;
  }

  /**
   * @param {FacebookPost} facebookAds
   * @returns {boolean}
   */
  static async updatePostStatistic(facebookAds) {
    const query = "UPDATE tb_facebook_post SET "
      + " n_likes = ?, "
      + " n_comments = ?, "
      + " n_shares = ?, "
      + " n_views = ?, "
      + " d_update = ? "
      + " WHERE s_post_id = ? AND s_facebook_page_username = ? ";
    const params = [
      facebookAds.nLikes ? parseInt(facebookAds.nLikes + '') : 0,
      facebookAds.nComments ? parseInt(facebookAds.nComments + '') : 0,
      facebookAds.nShares ? parseInt(facebookAds.nShares + '') : 0,
      facebookAds.nViews ? parseInt(facebookAds.nViews + '') : 0,
      moment(Date.now()).utc().format('YYYY-MM-DD HH:mm:ss'),
      facebookAds.sPostId,
      facebookAds.sFacebookPageUsername
    ];
    const result = await poolConnection.query(query, params);
    return result;
  }

  /**
   * @param {string} id 
   * @param {string} status 
   */
  static async updateStatus(id, status) {
    const query = "UPDATE tb_facebook_post SET "
      + " s_status = ?, "
      + " d_update = ? "
      + " WHERE s_id = ? ";
    const params = [status, moment(Date.now()).utc().format('YYYY-MM-DD HH:mm:ss'), id];
    const result = await poolConnection.query(query, params); 
    return result;
  }

  /**
   * @param {FacebookPost} facebookAds
   * @returns {boolean}
   */
  static async insertStatistic(facebookAds) {
    const query = "INSERT INTO "
      + " tb_facebook_post_statistic ( "
      + " s_facebook_post_id, "
      + " n_likes, "
      + " n_comments, "
      + " n_shares, "
      + " n_views "
      + " ) "
      + " VALUES (?,?,?,?,?)";
    const params = [
      facebookAds.sPostId,
      facebookAds.nLikes ? parseInt(facebookAds.nLikes + '') : 0,
      facebookAds.nComments ? parseInt(facebookAds.nComments + '') : 0,
      facebookAds.nShares ? parseInt(facebookAds.nShares + '') : 0,
      facebookAds.nViews ? parseInt(facebookAds.nViews + '') : 0
    ];
    const result = await poolConnection.query(query, params);
    return result;
  }

  /**
   * @param {number} fetchSize
   */
  static async listTrackedPost(fetchSize) {
    const query = "SELECT " 
      + "   tfp.s_post_id, " 
      + "   tfp.s_facebook_page_username, " 
      + "   tfp.n_likes, " 
      + "   tfp.n_comments, " 
      + "   tfp.n_shares, " 
      + "   tfp.n_views " 
      + " FROM tb_user_post tup  " 
      + " INNER JOIN tb_facebook_post tfp ON tup.s_facebook_post_id = tfp.s_post_id  " 
      + " WHERE tup.s_type = 'tracked' " 
      + "   AND tup.n_should_crawl = 1 " 
      + "   AND tfp.d_update < CURDATE() " 
      + " GROUP BY " 
      + "   tfp.s_post_id, " 
      + "   tfp.s_facebook_page_username, " 
      + "   tfp.n_likes, " 
      + "   tfp.n_comments, " 
      + "   tfp.n_shares, " 
      + "   tfp.n_views " 
      + " LIMIT ? "
    ;
    const result = await poolConnection.query(query, [fetchSize]);
    return result;
  }

  /**
   * @param {string} postId 
   * @param {number} shouldCrawl 
   */
  static async updateUserPost(postId, shouldCrawl) {
    const query = "UPDATE tb_user_post SET "
      + " n_should_crawl = ? "
      + " WHERE s_facebook_post_id = ? ";
    const params = [postId, shouldCrawl];
    const result = await poolConnection.query(query, params); 
    return result;
  }

}

module.exports = FacebookAdsDao;
