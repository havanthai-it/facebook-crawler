const mysql = require('mysql');
const util = require('util');
const config = require('./../config');

const poolConnection = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  charset: config.database.charset,
  connectionLimit: config.database.connectionLimit,
  connectTimeout: config.database.connectTimeout,
  acquireTimeout: config.database.acquireTimeout,
  waitForConnections: config.database.waitForConnections,
  queueLimit: config.database.queueLimit
});

// Ping database to check for common exception errors.
poolConnection.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
  }

  if (connection) connection.release();

  return;
})

poolConnection.query = util.promisify(poolConnection.query);

module.exports = poolConnection;
