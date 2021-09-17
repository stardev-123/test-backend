const config = {
  env: 'DEV',
  serverUrl: 'http://localhost:3000/',
  website: {
    page: 'https://onrampinvest.com/',
    forgothPassword: 'forgoth-password.html'
  },
  token: {
    secret: '123&$&*!01rw#@$@$mxannn',
    secretRefresh: 'sfDS4fsdsdf$45SDfd$5DFSDF4f$FS2J7gd55fUT2124gDFsASDFSFdsgs',
    userData: 'rasdSAFDSA@#$dfSDFSDSf',
    forgothPassword: 'sdfW#fdfgqw324FWr4raf'
  },
  admin: {
    username: 'ilabs@realityshares.com',
    password: '$7^P8tTYlj^0!Tiw'
  },
  mysql: {
    dialect: 'mysql',
    host: 'localhost',
    hostType: 'localhost',
    database: 'onramp_test',
    username: 'root',
    password: 'anita08'
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
      keepLogsDays: 2,
      maxFiles: '5d',
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
    KEY: 'qFdkmcIz6EpfVpsFpXcJLLrYj6LnbZVA83wFvy39VKdMVeqmxA',
    SECRET: 'tsNtu26TPrAXGse5ztnmNr1R6qBbIlcr5QhhGaxxs0QYAOnoD3',
    ENV: 'sandbox',
    API: 'https://api-sandbox.dwolla.com',
    MASTER_ACCOUNT_ID: 'e84bf11a-240a-44e6-86c0-96e9cf16c9d9',
    MASTER_ACCOUNT_FUNDING_SOURCE: '35c80e39-55a3-499e-83a8-9bfe56c2af92',
    webhook_secret: 'change secret',
    webhook_url: 'http://89.216.107.79:3000/webhook',
    MAX_VERIFIED_AMOUNT: 100,
    MAX_UNVERIFIED_AMOUNT: 50
  },
  plaid: {
    CLIENT_ID: '5b7bd678cb33d90012e9f37b',
    SECRET: 'e08015307373b0431f57d3d78280e2',
    PUBLIC_KEY: 'e151ed82913d987cdb76780b2a96e0',
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
    token: '543526e0a3047624619330af2467556e'
  },
  push: {
    common: {
      serverKey: 'AAAAN07NRfA:APA91bG2msL0CSZI3uss5vQv7PyGlwvud0_7a7gBPSzjMdvcufSackKodC1FDnN5GR_ysZ_zRs0RCQC7xqXeexpaTtAD8l3yuj6MNWHwBQOw8QXdk461005fkKYyteGYIsxG-o6ocL8v',
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
    active: true,
    testInterval: false
  },
  S3: {
    accessKey: 'AKIAIFQZOSG64L5C7KAA',
    secretKey: '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',
    region: 'us-west-2',
    bucket: 'onramp-logs'
  },
  redis: {
    host: '34.222.99.250',
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
  postponedWaitTime: 6000,
  emailWhitelisting: false,
  firstInvestmentLimit: 2500,
  encryptSensitiveData: false,
  disableAllNotifications: true
}

module.exports = config
