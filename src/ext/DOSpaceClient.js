const AWS = require('aws-sdk')
const fs = require('fs');
const moment = require('moment');
const config = require('../config');
const logger = require('../utils/logger');
const randomString = require('../utils/funcs/randomString');

class DOSpaceClient {

  constructor() {}

  /**
   * 
   * @param {string} fileName 
   * @return {string} url
   */
  static uploadImage(fileName) {
    return new Promise(async (resolve, reject) => {
      try {
        const arr = fileName.split('/');
        const fileNewName = moment(new Date()).format('YYYYMMDDHHmmss') + '_' + arr[arr.length - 1];
        // Configure client for use with Spaces
        const s3 = new AWS.S3({
          endpoint: new AWS.Endpoint(config.space.endpoint),
          accessKeyId: config.space.accessKeyId,
          secretAccessKey: config.space.secretAccessKey
        });

        fs.readFile(fileName, function(err, fileData) {
          const params = {
            Bucket: "hvtspace", 
            Key: 'fbspy/images/' + fileNewName, 
            Body: fileData,
            ContentType: DOSpaceClient.getImageContentType(fileNewName),
            ACL: 'public-read'
          };
          s3.putObject(params, function(err, data) {
            logger.info('[DIGITAL OCEAN SPACE CLIENT] Uploaded file: ' + fileName);
            if (err) {
              return reject(err);
            }

            return resolve('https://hvtspace.sfo2.digitaloceanspaces.com/fbspy/images/' + fileNewName);
          });
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  static getImageContentType(fileName) {
    let contentType = '';
    if (fileName.endsWith('.bmp')) {
      contentType = 'image/bmp';
    } else if (fileName.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (fileName.endsWith('.jpe') || fileName.endsWith('.jpeg') || fileName.endsWith('.jpg')) {
      contentType = 'image/jpeg';
    } else if (fileName.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (fileName.endsWith('.tif') || fileName.endsWith('.tiff')) {
      contentType = 'image/tiff';
    } else if (fileName.endsWith('.ico')) {
      contentType = 'image/x-icon';
    } else if (fileName.endsWith('.webp')) {
      contentType = 'image/webp';
    } else if (fileName.endsWith('.png')) {
      contentType = 'image/png';
    }
    return contentType;
  }

  static async test() {
    let url = await DOSpaceClient.uploadImage('D:/workspace/WEB/PROJECTS/crawler/temp/abc.jpg');
    console.log('url=' + url);
  }
}

// DOSpaceClient.test();

module.exports = DOSpaceClient;
