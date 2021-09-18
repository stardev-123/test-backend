const util = require('../lib/util')
const config = require('./')

exports.codes = {
  'BAD_REQUEST': {
    code: 400,
    message: 'Bad request!'
  },
  'MISSING_PAYMENT_DATA': {
    code: 400,
    message: 'Missing payment data'
  },
  'INVALID_SSN': {
    code: 400,
    internalCode: 22,
    message: 'Invalid SSN, please check your SNN again.'
  },
  'COIN_NOT_SUPPORTED': (currency) => {
    return {
      code: 400,
      message: 'Coin not supported ' + currency,
      internalCode: 21
    }
  },
  'MUST_BE_OVER_EIGHTEEN': {
    code: 400,
    internalCode: 40001,
    message: 'Must be 18 years or older.'
  },
  'NOT_AUTHENTICATED': {
    code: 401,
    message: 'Not Authenticated'
  },
  'FORBIDDEN': {
    code: 405,
    message: 'You are not authorized to access this URI'
  },
  'EXPIRED': {
    code: 403,
    message: 'Your session has expired'
  },
  'EXPIRED_REFRESH_TOKEN': {
    code: 403,
    internalCode: 10,
    message: 'Your refresh token has expired, please re-login.'
  },
  'NOT_FOUND': {
    code: 404,
    message: 'Not found'
  },
  'NOT_ALLOWED': {
    code: 405,
    message: 'Not allowed'
  },
  'ALREADY_REGISTERED': {
    code: 406,
    message: 'Email already registered'
  },
  'PHONE_VERIFIED': {
    code: 406,
    message: 'Phone already verified'
  },
  'PHONE_VERIFICATION_ERROR': (phoneNumber) => {
    return {
      code: 400,
      message: 'Phone number ' + phoneNumber + ' is not valid'
    }
  },
  'LENGTH_REQUIRED': {
    code: 411,
    message: 'Request body is required'
  },
  'DUPLICATE': {
    code: 406,
    message: 'Duplicate, already exist'
  },
  'INVALID_USERNAME_PASSWORD': {
    code: 409,
    message: 'Invalid username/password'
  },
  'INVALID_PASSWORD': {
    code: 409,
    message: 'Invalid password'
  },
  'INTERNAL_ERROR': {
    code: 500,
    message: 'Internal server error'
  },
  'DATABASE_ERROR': {
    code: 500,
    message: 'Database error'
  },
  'INTERNAL_ERROR_SENDING_EMAIL': {
    code: 500,
    message: 'Internal server error occurred while sending email'
  },
  'BAD_ID_FORMAT': {
    code: 500,
    message: 'Bad Id Format'
  },
  'NEGATIVE_BALANCE_ERROR': currency => {
    return {
      code: 402,
      internalCode: 4021,
      message: `Your balance for ${currency} is updating to negative value`
    }
  },
  'CANT_DELETE_PRIMARY_BANK': {
    code: 500,
    message: "Can't delete primary bank"
  },
  'CANT_DELETE_BANK_RECURRING': {
    code: 404,
    message: "Can't delete bank you have recurring attached to it"
  },
  'CANT_DELETE_BANK_SPARECHANGE': {
    code: 404,
    message: "Can't delete bank you have sparechange attached to it"
  },
  'INVALID_PAYMENT_DATA': {
    code: 400,
    message: 'Invalid Payment Data'
  },
  'BAD_NUMBER_FORMAT': (value) => ({
    code: 400,
    internalCode: 40003,
    data: { value },
    message: 'Bad number format'
  }),
  'INVALID_PAYMENT_PACKAGE': {
    code: 404,
    message: 'Invalid payment package provided!'
  },
  'NOT_VERIFIED': {
    code: 412,
    internalCode: 15,
    message: 'Phone not verified'
  },
  'TOS_NOT_ACCEPTED': {
    code: 412,
    internalCode: 41201,
    message: 'Phone not verified'
  },
  'VERIFICATION_CODE_EXPIRED': {
    code: 413,
    message: 'Verification code expired'
  },
  'INVALID_VERIFICATION_CODE': {
    code: 414,
    message: 'Invalid verification code'
  },
  'CASH_BALANCE_IS_EMPTY': {
    code: 402,
    internalCode: 0,
    data: { available: '0.00' },
    message: 'Your cash balance is empty'
  },
  'NOT_ENOUGH_FUNDS': (available) => {
    available = util.format(available, 2)
    return {
      code: 402,
      internalCode: 8,
      data: { available },
      message: 'Please reduce your withdraw amount'
    }
  },
  'NOT_ENOUGH_SETTLED_FUNDS': ({ available, unsettled }) => {
    let message
    if (available > 0) {
      message = `You have ACH transactions of $${util.format(unsettled, 2)} in progress, you can only withdraw $${util.format(available, 2)} at this time`
    } else {
      message = `You have ACH transactions of $${util.format(unsettled, 2)} in progress. Please wait until it's settled before you can withdraw`
    }
    available = util.format(available, 2)
    unsettled = util.format(unsettled, 2)
    return {
      code: 402,
      internalCode: 9,
      data: { available, unsettled },
      message
    }
  },
  'MAX_VERIFIED_LIMIT_REACHED': (available) => {
    const limit = util.format(config.dwolla.MAX_VERIFIED_AMOUNT, 2)
    available = util.format(available, 2)
    return {
      code: 402,
      internalCode: 1,
      data: { available, limit },
      message: `You can only buy $${util.format(available, 2)} worth of Cryptocurrency because of the your daily limit. Click below to adjust your amount. `
    }
  },
  'MAX_VERIFIED_LIMIT_REACHED_ADD_FUNDS': (available) => {
    const limit = util.format(config.dwolla.MAX_VERIFIED_AMOUNT, 2)
    available = util.format(available, 2)
    return {
      code: 402,
      internalCode: 1,
      data: { available, limit },
      message: `You can only add $${available} because of your current limit of $${limit}. Click below to adjust your amount. `
    }
  },
  'MAX_VERIFIED_LIMIT_REACHED_UNSETTLED': (available) => {
    available = util.format(available, 2)
    return {
      code: 402,
      internalCode: 2,
      data: { available },
      message: `You can only buy $${available} worth of Cryptocurrency because of pending ACH transactions. Tap below to adjust your investment.`
    }
  },
  'MAX_VERIFIED_LIMIT_REACHED_UNSETTLED_ADD_FUNDS': (available) => {
    available = util.format(available, 2)
    return {
      code: 402,
      internalCode: 2,
      data: { available },
      message: `You can only add $${available} because of pending ACH transactions. Tap below to adjust your investment.`
    }
  },
  'ADDITIONAL_BANK_CHARGE_NEEDED': ({ have, needed }) => {
    const available = util.format(have, 2)
    needed = util.format(needed, 2)
    return {
      code: 402,
      internalCode: 3,
      message: `Onramp will invest all of your available cash balance of $${available} but will need additional funds from your primary account for this transaction.`,
      data: { needed, available }
    }
  },
  'MAX_UNVERIFIED_LIMIT_REACHED': () => {
    const available = util.format(0, 2)
    const limit = util.format(config.dwolla.MAX_UNVERIFIED_AMOUNT, 2)
    return {
      code: 402,
      internalCode: 4,
      data: { available, limit },
      title: `You've reached your transaction limit of $${limit} for this week`,
      message: `This transaction requires a ACH bank transfer that exceeds your current ACH limit of $${limit} per week. You can increase your limits by becoming an Onramp Verified investor.`
    }
  },
  'MAX_UNVERIFIED_WEEK_LIMIT_REACHED': (available) => {
    available = util.format(available, 2)
    const limit = util.format(config.dwolla.MAX_UNVERIFIED_AMOUNT, 2)
    return {
      code: 402,
      internalCode: 5,
      data: { available, limit },
      title: `You've reached your transaction limit of $${limit} for this week`,
      message: `You can only add $${limit} because of the weekly limit. Click below to adjust your amount. Afterward, you will have the opportunity to become a verified investor with higher transaction limits.`
    }
  },
  'CONFIRM_BANK_CHARGE': (needed) => {
    needed = util.format(needed, 2)
    return {
      code: 402,
      internalCode: 6,
      message: `Confirm deposit of`,
      data: { needed }
    }
  },
  'NOT_ENOUGH_MONEY': ({ name, mask }) => {
    // bank name is institution.name + ' - ' + bank.name
    const institution = name.substr(0, name.indexOf(' - '))
    return {
      code: 402,
      internalCode: 7,
      message: `Your available balance in your ${institution} account ******${mask} was insufficient to cover this transaction. Please contact your bank for more information`
    }
  },
  'STATE_NOT_SUPPORTED': {
    code: 412,
    internalCode: 11,
    message: 'Currently only California residents are eligible to invest with Onramp. This is only temporary restriction. We intend to launch into other states soon.'
  },
  'PHONE_VERIFICATION_NEEDED': (phoneNumber) => {
    return {
      code: 412,
      internalCode: 12,
      data: { phoneNumber: util.maskString(phoneNumber, 2) },
      message: 'Phone verification needed'
    }
  },
  'TRADING_NOT_ACTIVE': {
    code: 412,
    internalCode: 13,
    message: 'Sorry, Crypto trading has been disabled for the time being. Please check back later.'
  },
  'TRADING_FORBIDDEN': {
    code: 412,
    internalCode: 14,
    message: 'Sorry, Crypto trading has been disabled for your account for the time being. Please contact support.'
  },
  'PAYMENT_UPDATE_NEEDED': (publicToken) => ({
    code: 428,
    internalCode: 42801,
    data: { publicToken },
    message: 'User login data or MFA changes detected please reinitialize bank account'
  }),
  'CRYPTO_SERVICE_IS_DOWN': (data) => ({
    code: 500,
    internalCode: 16,
    data,
    message: 'Sorry, Crypto trading service is currently down. Please check back later.'
  }),
  'CRYPTO_PRICE_CHANGED': (differences) => {
    const maxDifference = util.format(config.checkPriceDifference, 2)
    return {
      code: 412,
      internalCode: 41202,
      data: { maxDifference, differences },
      message: `Price changed more then $${maxDifference}`
    }},
  'EMAIL_NOT_WHITELISTED': {
    code: 417,
    internalCode: 17,
    message: 'Looks like your email is not eligible for Onramp’s early access. Sorry about this inconvenient. We’ll email you when we launch the app'
  }
}
