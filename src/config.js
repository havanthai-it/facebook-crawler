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
    randomPageQueue: {
      concurrency: 1
    },
    adsPageQueue: {
      concurrency: 2
    },
    urlPageQueue: {
      concurrency: 2
    },
    seedingKeywordQueue: {
      concurrency: 1
    }
  },
  space: {
    endpoint: 'sfo2.digitaloceanspaces.com',
    accessKeyId: 'HYPAVLNO5FHC4525HWSK',
    secretAccessKey: 'qXg8YhKU5C+/7MOLCGHqYOpW010hcymEXKsEJqH7JSk'
  }
}

module.exports = config;
