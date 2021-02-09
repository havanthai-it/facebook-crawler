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
    port: 6606,
    user: 'adscrawlr',
    password: 'adscrawlr',
    database: 'adscrawlr',
    charset: 'utf8mb4_general_ci',
    connectionLimit: 100,
    connectTimeout: 15000,
    acquireTimeout: 15000,
    waitForConnections: true,
    queueLimit: 0
  },
  queue: {
    randomPageQueue: {
      concurrency: 2
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
  },
  file: {
    downloadPath: 'D:/workspace/WEB/PROJECTS/crawler/temp/'
  },
  account: {
    facebook: {
      email: 'havanthaicvp@gmail.com',
      password: 'Dreadsteed@001'
    }
  }
}

module.exports = config;
