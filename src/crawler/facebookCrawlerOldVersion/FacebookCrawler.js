const logger = require('../../utils/logger');
const pageQueue = require('./queues/pageQueue');

class FacebookCrawler {

  constructor() {
  }

  static async start() {
    const url = 'https://www.facebook.com/urbanoutfitters/';
    pageQueue.add({ url: url });
  }

}

module.exports = FacebookCrawler;
