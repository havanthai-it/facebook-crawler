const moment = require('moment');
const { v4: uuidv4, parse } = require('uuid');
const logger = require('../utils/logger');
const DateUtils = require('../utils/DateUtils');
const poolConnection = require('./PoolConnection.js');
const FacebookPage = require('../models/FacebookPage.js');

class FacebookPageDao {

  constructor() {}

  /**
   * @param {string} id 
   * @returns {FacebookPage}
   */
  static async get(id) {
    const query = "SELECT * FROM tb_facebook_page WHERE s_id = ?";
    const result = await poolConnection.query(query, [id]);
    return result;
  }

  /**
   * @param {string} username 
   * @returns {FacebookPage}
   */
  static async getByUsername(username) {
    const query = "SELECT * FROM tb_facebook_page WHERE s_username = ?";
    const result = await poolConnection.query(query, [username]);
    return result;
  }

  /**
   * 
   * @param {number} hasAds 
   * @param {number} days 
   * @param {number} fetchSize 
   */
  static async list(hasAds, days, fetchSize) {
    const query = "SELECT * FROM tb_facebook_page " 
      + " WHERE n_has_ads = ? AND d_last_crawl < DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL ? DAY) " 
      + " ORDER BY d_last_crawl ASC LIMIT ?";
    const result = await poolConnection.query(query, [hasAds, days, fetchSize]);
    return result;
  }

  /**
   * @param {FacebookPage} facebookPage
   * @returns {boolean}
   */
  static async insert(facebookPage) {
    const query = "INSERT INTO "
      + " tb_facebook_page ( "
      + " s_id, "
      + " s_username, "
      + " s_name, "
      + " s_thumbnail, "
      + " s_category, "
      + " s_country, "
      + " n_has_ads, "
      + " n_likes, "
      + " n_follows, "
      + " d_publish "
      + " ) "
      + " VALUES (?,?,?,?,?,?,?,?,?,?)";
    const params = [
      facebookPage.sId ? facebookPage.sId : uuidv4().replace(/-/g, ''),
      facebookPage.sUsername,
      facebookPage.sName,
      facebookPage.sThumbnail,
      facebookPage.sCategory,
      facebookPage.sCountry,
      facebookPage.nHasAds,
      facebookPage.nLikes ? parseInt(facebookPage.nLikes + '') : 0,
      facebookPage.nFollows ? parseInt(facebookPage.nFollows + '') : 0,
      DateUtils.convertYYYYMMDDToDate(facebookPage.dPublish)
    ];
    logger.info("[FACEBOOK PAGE DAO] Insert params=" + params.toString());
    const result = await poolConnection.query(query, params);
    return result;
  }

  /**
   * @param {FacebookPage} facebookPage 
   * @returns {boolean}
   */
  static async update(facebookPage) {
    const query = "UPDATE tb_facebook_page SET "
      // + " s_username = ?, "
      + " s_name = ?, "
      + " s_thumbnail = ?, "
      + " s_category = ?, "
      + " s_country = ?, "
      + " n_has_ads = ?, "
      + " n_likes = ?, "
      + " n_follows = ?, "
      + " d_update = ?, "
      + " d_last_crawl = ? "
      + " WHERE s_username = ? ";
    const params = [
      // facebookPage.sUsername,
      facebookPage.sName,
      facebookPage.sThumbnail,
      facebookPage.sCategory,
      facebookPage.sCountry,
      facebookPage.nHasAds,
      facebookPage.nLikes ? parseInt(facebookPage.nLikes + '') : 0,
      facebookPage.nFollows ? parseInt(facebookPage.nFollows + '') : 0,
      moment(Date.now()).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss'),
      moment(Date.now()).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss'),
      facebookPage.sUsername,
    ];
    logger.info("[FACEBOOK PAGE DAO] Update params=" + params.toString());
    const result = await poolConnection.query(query, params);
    return result;
  }

  /**
   * @param {string} id 
   * @param {string} status 
   */
  static async updateStatus(id, status) {
    const query = "UPDATE tb_facebook_page SET "
      + " s_status = ?, "
      + " d_update = ? "
      + " WHERE s_id = ? ";
    const params = [status, moment(Date.now()).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss'), id];
    const result = await poolConnection.query(query, params); 
    return result;
  }

  /**
   * 
   * @param {number} fetchSize 
   */
  static async listPageUrl(fetchSize) {
    const query = "SELECT * FROM tb_url LIMIT ?";
    const result = await poolConnection.query(query, [fetchSize]);
    return result;
  }

   /**
   * 
   * @param {string} url 
   */
  static async getPageUrl(url) {
    const query = "SELECT * FROM tb_url WHERE s_url = ?";
    const result = await poolConnection.query(query, [url]);
    return result;
  }

  /**
   * @param {string} url 
   */
  static async insertPageUrl(url) {
    const query = "INSERT tb_url(s_url) VALUES(?) ";
    const params = [url];
    const result = await poolConnection.query(query, params); 
    return result;
  }

  /**
   * @param {string} url 
   */
  static async deletePageUrl(url) {
    const query = "DELETE FROM tb_url WHERE s_url = ? ";
    const params = [url];
    const result = await poolConnection.query(query, params); 
    return result;
  }

  /**
   * 
   * @param {number} fetchSize 
   */
  static async listSeedingKeyword(fetchSize) {
    const query = "SELECT * FROM tb_seeding_keyword LIMIT ?";
    const result = await poolConnection.query(query, [fetchSize]);
    return result;
  }

  /**
   * 
   * @param {string} keyword 
   */
  static async getSeedingKeyword(keyword) {
    const query = "SELECT * FROM tb_seeding_keyword WHERE s_keyword = ?";
    const result = await poolConnection.query(query, [keyword]);
    return result;
  }

  /**
   * @param {string} keyword 
   */
  static async deleteSeedingKeyword(keyword) {
    const query = "DELETE FROM tb_seeding_keyword WHERE s_keyword = ? ";
    const params = [keyword];
    const result = await poolConnection.query(query, params); 
    return result;
  }


}

module.exports = FacebookPageDao;
