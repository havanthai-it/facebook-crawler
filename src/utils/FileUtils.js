const fs = require('fs');
const request = require('request');
const logger = require('./logger');

class FileUtils {

  constructor() {}

  /**
   * 
   * @param {string} uri 
   * @param {string} filename 
   */
  static async download(uri, filename) {
    return new Promise((resolve, reject) => {
      try {
        request.head(uri, function(err, res, body){
          // console.log('content-type:', res.headers['content-type']);
          // console.log('content-length:', res.headers['content-length']);
      
          request(uri)
            .pipe(fs.createWriteStream(filename))
            .on('close', () => resolve(filename));
        });
      } catch(e) {
        return reject(e);
      }
    });
  }

  /**
   * 
   * @param {string} path 
   */
  static delete(path) {
    try {
      fs.unlinkSync(path);
    } catch(err) {
      logger.info(`[FILE UTILS] Error while delete file: ` + err);
    }
  }

  static getImageExtension(imageUrl) {
    let ext = '';
    if (imageUrl.indexOf('.gif') > -1) {
      ext = '.gif';
    } else if (imageUrl.indexOf('.jpe') > -1 || imageUrl.indexOf('.jpeg') > -1 || imageUrl.indexOf('.jpg') > -1) {
      ext = '.jpg';
    } else if (imageUrl.indexOf('.png') > -1) {
      ext = '.png';
    } else if (imageUrl.indexOf('.svg') > -1) {
      ext = '.svg';
    } else if (imageUrl.indexOf('.bmp') > -1) {
      ext = '.bmp';
    } else if (imageUrl.indexOf('.tif') > -1 || imageUrl.indexOf('.tiff') > -1) {
      ext = '.tiff';
    } else if (imageUrl.indexOf('.ico') > -1) {
      ext = '.ico';
    } else if (imageUrl.indexOf('.webp') > -1) {
      ext = '.webp';
    }
    return ext;
  }

  static async test() {
    let fileName = await FileUtils.download('https://static.toiimg.com/photo/72975551.cms', 'D:/workspace/WEB/PROJECTS/crawler/temp/google.cms');
    console.log('fileName=' + fileName);
  }

}

// Example
// FileUtils.test();

module.exports = FileUtils;
