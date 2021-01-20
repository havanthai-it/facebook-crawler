const logger = require('../../utils/logger');
const pageQueue = require('./queues/pageQueue');

class FacebookCrawler {

  constructor() {
  }

  static async start() {
    const url = 'https://www.facebook.com/I-Love-My-Dutch-Heritage-1609602922608502';
    pageQueue.add({ url: url });
  }

}

module.exports = FacebookCrawler;
