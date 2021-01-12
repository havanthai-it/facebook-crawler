const fs = require('fs');
const request = require('request');
const logger = require('./logger');

class FileUtils {

  constructor() {}

  /**
   * 
   * @param {string} uri 
   * @param {string} filename 
   * @param {any} callback 
   */
  static download(uri, filename, callback) {
    request.head(uri, function(err, res, body){
      // console.log('content-type:', res.headers['content-type']);
      // console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
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

}

// Example
// FileUtils.download('https://static.toiimg.com/photo/72975551.cms', 'D:/workspace/WEB/PROJECTS/crawler/temp/google.cms', function(){
//   console.log('done');
// });
module.exports = FileUtils;
