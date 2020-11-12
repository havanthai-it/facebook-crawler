const moment = require('moment');
const logger = require('./logger');

class DateUtils {

  constructor() { }

  static convertYYYYMMDDToDate(dateStr) {
    if (!dateStr) return null;
    return moment(dateStr).format('YYYY-MM-DD HH:mm:ss');
  }

  static convertFBDateToYYYYMMDD(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    let result = dateStr;
    if (result.indexOf('second') > -1 || result.indexOf('min') > -1 || result.indexOf('hour') > -1 || result.indexOf('today') > -1) {
      result = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    } else {
      let dateStrArr = dateStr.split(' ');
      if (dateStrArr.length < 2) return;
      if (dateStrArr.length > 3) return;
      if (isNaN(dateStrArr[0])) return;

      let date = ('0' + dateStrArr[0]).substr(-2);
      let month;
      let year = dateStrArr.length === 3 ? dateStrArr[2] : now.getFullYear();

      if (dateStrArr[1] === 'January' || dateStrArr[1] === 'Jan') {
        month = '01';
      } else if (dateStrArr[1] === 'February' || dateStrArr[1] === 'Feb') {
        month = '02';
      } else if (dateStrArr[1] === 'March' || dateStrArr[1] === 'Mar') {
        month = '03';
      } else if (dateStrArr[1] === 'April' || dateStrArr[1] === 'Apr') {
        month = '04';
      } else if (dateStrArr[1] === 'May' || dateStrArr[1] === 'May') {
        month = '05';
      } else if (dateStrArr[1] === 'June' || dateStrArr[1] === 'June') {
        month = '06';
      } else if (dateStrArr[1] === 'July' || dateStrArr[1] === 'July') {
        month = '07';
      } else if (dateStrArr[1] === 'August' || dateStrArr[1] === 'Aug') {
        month = '08';
      } else if (dateStrArr[1] === 'September' || dateStrArr[1] === 'Sep') {
        month = '09';
      } else if (dateStrArr[1] === 'October' || dateStrArr[1] === 'Oct') {
        month = '10';
      } else if (dateStrArr[1] === 'November' || dateStrArr[1] === 'Nov') {
        month = '11';
      } else if (dateStrArr[1] === 'December' || dateStrArr[1] === 'Dec') {
        month = '12';
      }
      result = year + '-' + month + '-' + date;
    }

    return result;
  }

}

module.exports = DateUtils;
