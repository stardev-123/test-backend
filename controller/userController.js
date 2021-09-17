const moment = require('moment')
const { PASSWORD_FORMATS, VERIFICATION, USER } = require('../lib/constants')
const accountManager = require('../managers/accountManager')
const assetManager = require('../managers/assetManager')
const paymentManager = require('../managers/payment')
const cryptoManager = require('../managers/crypto')
const deviceManager = require('../managers/deviceManager')
const notificationManager = require('../managers/notificationManager')
const util = require('../lib/util')
const models = require('../database/models')
const error = require('../lib/error')
const logger = require('../lib/logger')
const config = require('../config')

exports.logout = async (req, res, next) => {
  const token = req.headers['x-access-token']
  await accountManager.logout(token)
  res.json({ success: true })
}

exports.register = async (req, res, next) => {
  // password validation
  const password = req.body.password

  if (password.length < 8) {
    logger.warn(req, 'ERROR Register - Password must contain minimum 8 characters')
    return next(error('BAD_REQUEST'))
  }

  if (!(PASSWORD_FORMATS.DIGIT.test(password) || PASSWORD_FORMATS.UPPER_CASE.test(password) || PASSWORD_FORMATS.SPECIAL_CHARACTERS.test(password))) {
    logger.warn(req, 'ERROR Register - Password must contain a digit or upper case letter or a special character')
    return next(error('BAD_REQUEST'))
  }

  try {
    const data = await accountManager.register(req.body, req)
    logger.info(req, 'Successfully created user', data)
    return res.json(data)
  } catch (err) {
    logger.error(req, err, 'Failed to create user with email ' + req.body.email)
    next(err)
  }
}

exports.tos = async (req, res, next) => {
  const { accepted } = req.body

  const tosStatus = accepted ? USER.TOS.ACCEPTED : USER.TOS.DECLINED
  req.user.tosStatus = tosStatus
  try {
    await models.user.updateById(req.user.id, { tosStatus })
    res.send({
      user: accountManager.returnBasicUserData(req.user, false)
    })
  } catch (err) {
    logger.error(req, err, 'Error updating user ToS status', req.user.id)
    next(error('INTERNAL_ERROR_SENDING_EMAIL'))
  }
}

exports.login = async (req, res, next) => {
  const { email, password, code, deviceId } = req.body
  try {
    const data = await accountManager.login(req, email, password, code, deviceId)
    logger.info(req, 'Successfully logged in user with id ' + data.user.id)
    deviceManager.updateDevice(deviceId, req.user.id)
    if (data.verifyNumber) res.statusCode = 202
    return res.json(data)
  } catch (err) {
    logger.error(req, err, 'Failed to log in user with email ' + email)
    next(err)
  }
}

exports.basicInfo = async (req, res, next) => {
  logger.info(req, 'Successfully returned basic info for user with id ' + req.user.id)
  const accounts = await accountManager.getAccountForUser(req.user.id, req)
  const balance = await assetManager.getBalance(req.user.id)
  const portfolio = await assetManager.getPortfolioForUser(req.user.id)
  res.send({
    user: accountManager.returnBasicUserData(req.user, false),
    accounts,
    balance,
    portfolio
  })
}

exports.updateBasicInfo = async (req, res, next) => {
  try {
    await accountManager.updateUser(req)
    const user = await models.user.findById(req.user.id)
    logger.debug(req, 'SUCCESSFULLY updated basic info for userId', req.user.id)

    res.json({ user: accountManager.returnBasicUserData(user, true) })
  } catch (err) {
    next(err)
  }
}

exports.verifyUser = async (req, res, next) => {
  try {
    const dbUser = req.user

    if (dbUser.verifiedAtProvider) return next(error('BAD_REQUEST', 'Already verified'))
    if (dbUser.providerVerificationDate) return next(error('BAD_REQUEST', 'Already in verification process'))
    if (!dbUser.ssn) return next(error('BAD_REQUEST', 'Missing SSN'))
    if (!dbUser.birthdate) return next(error('BAD_REQUEST', 'Missing birthday'))
    if (!dbUser.firstName) return next(error('BAD_REQUEST', 'Missing first name'))
    if (!dbUser.lastName) return next(error('BAD_REQUEST', 'Missing last name'))
    if (!dbUser.email) return next(error('BAD_REQUEST', 'Missing email'))
    if (!dbUser.address1) return next(error('BAD_REQUEST', 'Missing address1'))
    if (!dbUser.city) return next(error('BAD_REQUEST', 'Missing city'))
    if (!dbUser.state) return next(error('BAD_REQUEST', 'Missing state'))
    if (!dbUser.zipcode) return next(error('BAD_REQUEST', 'Missing zipcode'))

    await paymentManager.updateCustomer(dbUser.customerId, {
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      address1: dbUser.address1,
      address2: dbUser.address2,
      city: dbUser.city,
      state: dbUser.state,
      postalCode: dbUser.zipcode,
      dateOfBirth: dbUser.birthdate,
      ssn: dbUser.ssn,
      type: 'personal'
    })

    await models.user.updateById(req.user.id, { providerVerificationDate: new Date() })

    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR verifying user ', req.user, req.body)
    throw err
  }
}

exports.verifyPhone = async (req, res, next) => {
  const { code } = req.body
  try {
    await accountManager.verifyCode(req, code, VERIFICATION.EVENTS.PHONE)
    logger.info(req, 'Successfully verified auth code for user with id ' + req.user.id)
    res.send({ success: true })
  } catch (err) {
    logger.error(req, err, 'Failed to verify auth code for user with id ' + req.user.id)
    next(err)
  }
}

exports.addPhone = async (req, res, next) => {
  try {
    let phoneNumber = req.body.phone
    if (phoneNumber.indexOf('+') !== 0) phoneNumber = '+1' + phoneNumber

    if (!config.disablePhoneUniqueness) {
      const found = await models.user.findByPhoneNotUser(req.user.id, phoneNumber)
      if (found) return next(error('PHONE_VERIFIED'))
    }

    await accountManager.sendVerificationCode(req, phoneNumber, VERIFICATION.EVENTS.PHONE)
    logger.info(req, 'Successfully sent verification code for user with id ' + req.user.id)

    res.send({ success: true })
  } catch (err) {
    logger.error(req, err, 'Failed to send verification code for user with id ' + req.user.id)
    next(err)
  }
}

exports.resendVerificationCode = async (req, res, next) => {
  const { phoneNumber } = req.user
  const { event } = req.body
  if (VERIFICATION.EVENTS.LOGIN !== event && VERIFICATION.EVENTS.PASSWORD !== event) return next(error('BAD_REQUEST', 'Event missing or not supported'))
  try {
    await accountManager.sendVerificationCode(req, phoneNumber, event)
    res.send({ success: true })
  } catch (err) {
    logger.error(req, err, 'Failed to send verification code for event ' + event + ' and user with id ' + req.user.id)
    next(err)
  }
}

exports.changeUserPassword = async (req, res, next) => {
  const { old, confirm, password, code } = req.body
  const { id, phoneNumber } = req.user
  try {
    await accountManager.changePassword(req, id, phoneNumber, old, confirm, password, code)
    logger.info(req, 'Successfully changed user password' + id)
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'Failed to change user password ' + id, req.body)
    next(err)
  }
}

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body
  try {
    const found = await models.user.findByEmail(email, { raw: true })
    if (!found) return next(error('NOT_FOUND'))

    await accountManager.forgotPassword(req, found)
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'Error sending forgot password link')
    next(err)
  }
}

exports.generatePassword = async (req, res, next) => {
  try {
    const newPassword = await accountManager.generateAndUpdateNewPassword(req, req.user.id)
    res.redirect(config.website.page + config.website.forgothPassword)
    notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.GENERATED_NEW_PASSWORD, newPassword)
  } catch (err) {
    logger.error(req, err, 'Error generating password')
    next(err)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { old, confirm, password } = req.body
    await accountManager.changePassword(req.user.id, old, confirm, password)
    logger.info(req, 'Successfully changed user password' + req.user.id)
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'Failed to change user password ' + req.user.id, req.body)
    next(err)
  }
}

exports.getPortfolio = async (req, res, next) => {
  try {
    // const data = await assetManager.getPortfolioForUser(req.user.id, req)
    const data = await assetManager.getPortfolioForUser('1060', req)
    // logger.debug(req, 'Successfully returned portfolio investments for user with id ' + req.user.id)
    logger.debug(req, 'Successfully returned portfolio investments for user with id ' + '1060')
    res.send(data)
  } catch (err) {
    logger.error(req, err, 'Failed to return portfolio investments for user with id ' + req.user.id)
    return next(err)
  }
}

exports.updatePortfolio = async (req, res, next) => {
  const userId = req.user.id
  const portfolio = req.body.portfolio
  const setting = await models.settings.findOne()
  const supportedCoins = setting.coins.map(coinData => coinData.currency)
  let percentSum = 0
  try {
    if (portfolio.length !== setting.coins.length) {
      throw error('BAD_REQUEST', 'Portfolio investments needs to contains all supported crypto currency values')
    }
    const existing = []
    portfolio.forEach(investment => {
      if (supportedCoins.indexOf(investment.currency) === -1) {
        throw error('BAD_REQUEST', "Portfolio investments can't have unsupported coin")
      }
      if (existing.indexOf(investment.currency) > -1) {
        throw error('BAD_REQUEST', "Portfolio investments can't have duplicate values")
      }
      investment.percent = util.round(investment.percent, 2)
      existing.push(investment.currency)
      percentSum += util.round(investment.percent, 2)
      investment.userId = userId
    })

    percentSum = util.round(percentSum, 2)

    if (percentSum !== 100) {
      logger.warn(req, 'ERROR Update Portfolio - Portfolio investments percent sum must be 100 but it is ' + percentSum)
      throw error('BAD_REQUEST', 'Portfolio investments percent sum must be 100')
    }

    const data = await accountManager.updatePortfolio(req.user.id, portfolio)
    logger.info(req, 'Successfully updated portfolio investments for user with id ' + req.user.id)
    res.send(data)
  } catch (err) {
    logger.error(req, err, 'Failed to make an portfolio investment for user with id ' + req.user.id)
    next(err)
  }
}

const _getBalance = async (req, res, next) => {
  try {
    // const holdings = await assetManager.getBalance(req.user.id)
    const holdings = await assetManager.getBalance()
    res.json(holdings)
  } catch (err) {
    logger.error(req, err, 'Error retrieving user balance')
    next(error('INTERNAL_ERROR'))
  }
}

exports.getBalance = _getBalance

exports.getBalanceHistory = async (req, res, next) => {
  const { id, firstInvestmentDate, createdAt } = req.user
  let userStartDate = firstInvestmentDate || createdAt
  userStartDate = moment(userStartDate).startOf('day')
  let { days, hours } = req.query
  let periodStart

  try {
    userStartDate = moment(userStartDate).startOf('day').toDate()
    const currentValue = await assetManager.getBalanceValue(id)
    let startValue, periodValue, history
    if (hours) {
      hours = Number(hours)
      periodStart = moment().subtract(hours, 'hours').startOf('hour').unix()
      startValue = await assetManager.getBalanceValueOnDate(id, userStartDate)
      history = await assetManager.getBalanceHoursHistory(id, hours)
      periodValue = history && history[0] ? history[0].value : 0
    } else if (days) {
      days = Number(days)
      periodStart = moment().subtract(days, 'days').startOf('day').toDate()
      startValue = await assetManager.getBalanceValueOnDate(id, userStartDate)
      history = await assetManager.getBalanceHistory(id, days)
      periodValue = history && history[0] ? history[0].value : 0
    } else {
      periodStart = userStartDate
      const period = moment().diff(moment(userStartDate), 'days')
      startValue = await assetManager.getBalanceValueOnDate(id, userStartDate)
      history = await assetManager.getBalanceHistory(id, period)
      periodValue = history && history[0] ? history[0].value : 0
    }

    const periodChangeUSD = currentValue - periodValue
    const periodChange = util.round((currentValue !== 0 ? (1 - periodValue / currentValue) : 0), 4) * 100
    const totalChangeUSD = currentValue - startValue
    const totalChange = util.round((currentValue !== 0 ? (1 - startValue / currentValue) : 0), 4) * 100
    logger.debug(req, 'Finished histroy balance pulling for ', { id, periodStart, userStartDate, query: { days, hours } })
    res.json({ history, periodChangeUSD, periodChange, totalChangeUSD, totalChange, startValue, periodValue, currentValue, periodStart, userStartDate })
  } catch (err) {
    logger.error(req, err, 'Error retrieving user balance history for ' + days + ' days')
    next(error('INTERNAL_ERROR'))
  }
}

exports.test = async (req, res, next) => {
  try {
    const result = await assetManager.getBalanceHoursHistory(1, 24)
    res.json(result)
  } catch (err) {
    console.log(err)
  }
}

exports.getSupportedCoins = async (req, res, next) => {
  const result = await cryptoManager.getSupportedCoins()
  res.json(result)
}

exports.refreshAccessTokens = async (req, res, next) => {
  const { token, refreshToken } = accountManager.generateTokens(req, req.user, req.params)
  res.json({ token, refreshToken })
}

exports.skippedFirstInvestment = async (req, res, next) => {
  try {
    await models.user.updateById(req.user.id, { firstInvestment: false })
    req.user.firstInvestment = false
    res.json({ user: accountManager.returnBasicUserData(req.user, false) })
  } catch (err) {
    logger.error(req, err, 'ERROR updating firstInvestment flag')
    next(error('INTERNAL_ERROR'))
  }
}

exports.confirmedResidence = async (req, res, next) => {
  try {
    await models.user.updateById(req.user.id, { confirmedResidence: true })
    req.user.confirmedResidence = true
    res.json({ user: accountManager.returnBasicUserData(req.user, false) })
  } catch (err) {
    logger.error(req, err, 'ERROR updating confirmedResidence flag')
    next(error('INTERNAL_ERROR'))
  }
}
