const config = {
  env: 'PROD',
  serverUrl: 'https://api.onrampinvest.com/',
  website: {
    page: 'https://onrampinvest.com/',
    forgothPassword: 'forgoth-password.html'
  },
  token: {
    secret: '123&$&*!01rw#@$@$mxannn',
    secretRefresh: 'sfDS4fsdsdf$45SDfd$5DFSDF4f$FS2J7gd55fUT2124gDFsASDFSFdsgs',
    userData: 'rasdSAFDSArt5h6S', // length 16
    forgothPassword: 'sdfW#fdfgqw324FWr4raf'
  },
  admin: {
    username: 'ilabs@realityshares.com',
    password: '$7^P8tTYlj^0!Tiw'
  },
  client: {
    username: 'onrampLanding1920',
    password: '3sdf$!S2J7gd'
  },
  mysql: {
    dialect: 'mysql',
    host: 'localhost',
    hostType: 'localhost',
    database: 'onramp_prod',
    dialectOptions: { decimalNumbers: true, ssl: 'Amazon RDS' },
    username: 'root',
    password: 'root',
    pool: { max: 100, min: 2 }
  },
  logger: {
    path: './log/server.log'
  },
  log: {
    level: 'debug',
    json: false,
    logsToFile: true,
    external: false,
    fileLogParams: {
      folder: 'log',
      prefix: 'ONRAMP_',
      datePattern: 'YYYY_MM_DD',
      extension: 'log',
      keepLogsDays: 14,
      maxFiles: '14d',
      backupToS3: true
    },
    logsToDatabase: false
  },
  rollbar: {
    accessToken: '8e7ae79ee3404614a74483a8396d96fa'
  },
  twilio: {
    accountSid: 'AC3c252f510ecb4ecf2a17a8685d71e7a6',
    authToken: 'a378a9526efe0574f0acb5131dfa16d5',
    from: '+18509098165',
    serviceSid: 'MGc4cb21a7194c00391d1527200a71f262',
    fromSid: 'PN8d484a4e24823963e1236cadd6904b7c',
    expiration: 300000
  },
  payment: 'dwolla',
  dwolla: {
    KEY: 'FmIMnwLgmFYWzVFeeIGnJagG7J25tvBfeg3ctZUKh7DQr2OUUq',
    SECRET: 'GDvE8o7PgfnHyR1krvPqyuRHO8TwKdIXPAz721PqGNCTHWMRrE',
    ENV: 'sandbox',
    API: 'https://api-sandbox.dwolla.com',
    MASTER_ACCOUNT_ID: '2dccf2e5-7e7d-47fc-a73b-ccb4167a80ac',
    MASTER_ACCOUNT_FUNDING_SOURCE: '99c00536-3c67-43a5-83d5-fe77454ed77d',
    webhook_secret: 'change secret',
    webhook_url: 'https://api-staging.onrampinvest.com/webhook',
    MAX_VERIFIED_AMOUNT: 10000,
    MAX_UNVERIFIED_AMOUNT: 5000
  },
  plaid: {
    CLIENT_ID: '5b6a0fe182440e00123aa7c0',
    SECRET: 'b9d4f814ae4cf6f479f400dc2a32a9',
    PUBLIC_KEY: 'c9e9d582c314ce40b427bbc1f3a57e',
    ENV: 'sandbox',
    PRODUCT: ['auth']
  },
  tradeblock: {
    API_KEY: '0ZHedesDA8LBGYlJTM5Y5bmQfo0BREvyho5jtA',
    API_SECRET: 'VUj0Q2Uukf8HzhzX1HhefcTsVtcQjV7ETXyQYA',
    demo: true
  },
  analytics: 'mixpanel',
  mixpanel: {
    token: '7a8c77ba04e09305e59adc56f39e3f4f'
  },
  push: {
    common: {
      serverKey: 'AAAA-GQMJf4:APA91bGgvn46nT_l2xMBNNf0QLdsUry27kXxJJkLfYWJpU_5Hq93ysP5ekPXtgFzcFV7E0WpfGjypnZOQUfA7y1YNb_0j7XI1r-BoAx0ZwC06wXnaXoC38AJ1m5XT5KCnmzIA7WvigsA',
      timeToLive: 7200 // in seconds
    }
  },
  email: {
    settings: {
      service: 'Gmail',
      auth: {
        user: 'info@onrampinvest.com',
        pass: 'Q4RbjRpei4bj]6ZfQk2MchwMRPxaWFUpvFN{t',
        clientId: '41341791976-3t8edfhgb0e9tdnm3v032nquijmbtnm3.apps.googleusercontent.com',
        clientSecret: 'lqfhtQkG1_I_0Pzf1KQrVBEJ'
      }
    }
  },
  cron: {
    active: false
  },
  S3: {
    accessKey: 'AKIAIFQZOSG64L5C7KAA',
    secretKey: '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',
    region: 'us-west-2',
    bucket: 'onramp-logs'
  },
  redis: {
    host: '172.31.41.18',
    port: 6379,
    sessionStorage: 1
  },
  precision: {
    AMOUNT_PRECISION: 2,
    PERCENT_PRECISION: 2,
    COIN_PRICE_PRECISION: 2,
    COIN_AMOUNT_PRECISION: 8
  },
  cryptoProvider: 'tradeblock',
  cryptoPricesProvider: 'coincap',
  checkPriceDifference: 5,
  allowNotVerified: false,
  allowedStates: ['NY'],
  disablePhoneUniqueness: true,
  enable2FA: true,
  postponedWaitTime: 5000,
  emailWhitelisting: true,
  firstInvestmentLimit: 2500,
  encryptSensitiveData: true
}

module.exports = config
