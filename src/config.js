const config = {
  log: {
    filename: './logs/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '365d'
  },
  database: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'ultimatespy',
    charset: 'utf8mb4_general_ci',
    connectionLimit: 100,
    connectTimeout: 15000,
    acquireTimeout: 15000,
    waitForConnections: true,
    queueLimit: 0
  },
  queue: {
    pageQueue: {
      concurrency: 1
    }
  }
}

module.exports = config;
