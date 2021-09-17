module.exports = {
  PASSWORD_FORMATS: {
    DIGIT: /[0-9]/,
    UPPER_CASE: /[A-Z]/,
    SPECIAL_CHARACTERS: /[ !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
  },
  VERIFICATION_TYPES: {
    REGISTER: 1
  },
  TRANSACTIONS: {
    TYPE: {
      ADD_FUNDS: 0,
      INVESTMENT: 1,
      BUY_CRYPTO: 2,
      SELL_CRYPTO: 3,
      PAY_OUT: 4,
      SELL_INCOME: 5
    },
    STATUS: {
      INITIALIZED: 1,
      PENDING: 2,
      PROCESSED: 3,
      FAILED: 4
    },
    ACH_TYPES: [0, 1]
  },
  CRYPTOCURRENCIES: [
    { currency: 'BTC', name: 'Bitcoin', percent: 69.18 },
    { currency: 'ETH', name: 'Ethereum', percent: 17.05 },
    { currency: 'LTC', name: 'Litecoin', percent: 8.16 },
    { currency: 'BCH', name: 'Bitcoin Cash', percent: 5.61 }
  ],
  WEBHOOK: {
    DEFAULT_STATUS: 0,
    STATUSES: {
      PROCESSING: 0,
      PROCESSED: 1,
      FAILED: 2
    }
  },
  NOTIFICATIONS: {
    INVESTMENT_DONE: 0,
    INVESTMENT_SETTLED: 1,
    SPARECHANGE_FAILED: 2,
    RECURRING_FAILED: 3,
    USER_VERIFIED: 4,
    FORGOT_PASSWORD: 5
  },
  INVESTMENTS: {
    STATUS: {
      INITIALIZED: 1,
      PENDING: 2,
      PROCESSED: 3,
      FAILED: 4,
      CANCELED: 5
    },
    TYPE: {
      BUY: 0,
      POSTPONED: 1,
      SELL: 2
    }
  },
  INVESTMENTS_TRANSACTIONS: {
    STATUS: {
      PENDING: 0,
      PROGRESS: 1,
      DONE: 2,
      CANCELED: 3
    },
    TYPE: {
      BUY: 0,
      SELL: 1
    }
  },
  VERIFICATION: {
    EVENTS: {
      PHONE: 'phone',
      PASSWORD: 'password',
      LOGIN: 'login'
    }
  },
  USER: {
    EMAIL_STATUSES: {
      PENDING: 0,
      VALID: 1,
      FORBIDDEN: 2
    },
    TOS: {
      NONE: 0,
      ACCEPTED: 1,
      DECLINED: 2
    }
  },
  DATE_FORMAT: 'MM/DD/YYYY',
  CRITICAL_EVENTS: {
    TRANSFER_FAILED: 'transfer_failed',
    TRANSFER_CANCELLED: 'transfer_cancelled',
    TRANSFER_WEBHOOK_FAILED: 'transfer_webhook_failed'
  }
}
