const appRoot = require('app-root-path');
const winston = require('winston');
const moment = require('moment');
const config = require(appRoot + '/src/config.js');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  format: winston.format.printf(info => `[${moment().format('YYYY-MM-DD HH:mm:ss')}] [${info.level.toUpperCase()}] ${info.message}`),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: config.log.filename,
      datePattern: config.log.datePattern,
      zippedArchive: config.log.zippedArchive,
      maxSize: config.log.maxSize,
      maxFiles: config.log.maxFiles
    })
  ]
});

module.exports = logger;
