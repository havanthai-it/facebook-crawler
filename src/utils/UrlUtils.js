const logger = require('./logger');

class UrlUtils {

  constructor() {}

  /**
   * @param {string} url 
   * @returns {string}
   */
  static removeParams(url) {
    return url ? url.split('?')[0] : '';
  }

  /**
   * @param {string} url 
   * @param {string} param 
   * @returns {string}
   */
  static getParam(url, param) {
    if (!url || !param ) {
      logger.error(`[GET URL PARAM] url=${url}, param=${param}`);
      return '';
    }

    return new URL(url).searchParams.get(param);
  }

}

module.exports = UrlUtils;
