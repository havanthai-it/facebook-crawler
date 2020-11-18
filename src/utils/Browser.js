const puppeteer = require('puppeteer');

class Browser {
  constructor() {}

  static instance;

  static async init(callback) {
    Browser.instance = await puppeteer.launch({ 
      headless: true,
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--single-process', 
        '--disable-web-security',
        '--disable-dev-profile',
        '--disable-notifications'
      ]
    });

    callback.bind(this)();
  }
}

module.exports = Browser;
