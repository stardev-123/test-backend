// const DB = require('../setup/databaseConnection')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const moment = require('moment')
const encrypt = require('../lib/encrypt')
const bcrypt = require('bcryptjs')
// const models = require('../database/models')
const assetManager = require('./assetManager')
const Twilio = require('twilio')
const paymentManager = require('./payment')
const analyticsManager = require('./analytics')
const notificationManager = require('./notificationManager')
const { VERIFICATION } = require('../lib/constants')
const scripts = require('../scripts')
const sessionManager = require('./sessionManager')
const util = require('../lib/util')
const error = require('../lib/error')
const logger = require('../lib/logger')
const config = require('../config')

const twilioClient = new Twilio(config.twilio.accountSid, config.twilio.authToken)

const development = config.env === 'DEV'

const _cryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

const _validatePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash)
}

const _createJWTToken = (payload, secret, expiration) => {
  return jwt.sign(payload, secret, { expiresIn: expiration })
}

const _decodeJWTToken = (token, secret, expErrCode, errCode) => {
  return new Promise((resolve) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.message === 'jwt expired') {
          throw (error(expErrCode || 'EXPIRED'))
        } else {
          throw (error(errCode || 'FORBIDDEN'))
        }
      }

      resolve(decoded)
    })
  })
}

const _generateEmailConfirmationLink = (user) => {
  const token = jwt.sign({
    email: user.email,
    userId: user.id,
    emailConfirmation: true
  }, config.token.secret, {
    expiresIn: 172800 // expires in 2 days/
  })

  return config.serverUrl + 'confirm?token=' + token
}

const _saveTokens = async (req, token, refreshToken, id) => {
  try {
    await sessionManager.setKey(token, { id, refreshToken }, 'EX', 86400)
    await sessionManager.setKey(refreshToken, id, 'EX', 2592000)
  } catch (err) {
    logger.error(req, err, 'ERROR saving token in redis err')
  }
}

const _generateTokens = (req, { id, email, firstName, lastName }, data) => {
  console.log(email + " " + id)
  const token = jwt.sign({
    email: email,
    userId: id
  }, config.token.secret, {
    expiresIn: 86400 // expires in 24 hours/
  })
  const refreshToken = jwt.sign({
    user: { email, firstName, lastName, id }
  }, config.token.secretRefresh, {
    expiresIn: 2592000 // expires in 30 days
  })

  _saveTokens(req, token, refreshToken, id)

  return { token, refreshToken }
}

const _returnBasicUserData = (user, decrypt) => {
  return {
    // id: user.id,
    // firstName: user.firstName,
    // lastName: user.lastName,
    // email: user.email,
    // phoneNumber: user.phoneNumber,
    // address1: decrypt ? encrypt.decrypt(user.address1) : user.address1,
    // address2: decrypt ? encrypt.decrypt(user.address2) : user.address2,
    // aptSuite: decrypt ? encrypt.decrypt(user.aptSuite) : user.aptSuite,
    // city: decrypt ? encrypt.decrypt(user.city) : user.city,
    // state: user.state,
    // country: user.country,
    // zipcode: decrypt ? encrypt.decrypt(user.zipcode) : user.zipcode,
    // birthdate: user.birthdate,
    // ssn: user.ssn,
    // verifiedAtProvider: !!user.verifiedAtProvider,
    // investmentsCount: user.investmentsCount,
    // firstInvestment: !!user.firstInvestment,
    // confirmedResidence: !!user.confirmedResidence,
    // tosStatus: user.tosStatus
    "id": 1060,
    "firstName": "Cullen",
    "lastName": "Sun",
    "email": "seniordev105@gmail.com",
    "phoneNumber": "+1(774)482-2369",
    "address1": "1110 Concord Avenue",
    "address2": null,
    "aptSuite": "",
    "city": "Concord",
    "state": "CA",
    "country": "uni",
    "zipcode": "94518",
    "birthdate": "1990-12-31",
    "ssn": "5555",
    "verifiedAtProvider": false,
    "investmentsCount": 1,
    "firstInvestment": false,
    "confirmedResidence": false,
    "tosStatus": 1
  }
}

const _createUpdateCustomerAtProvider = async (user, data, req) => {
  const customerData = {}

  // if (data.firstName) customerData.firstName = data.firstName;
  // if (data.lastName) customerData.lastName = data.lastName;
  if (data.email) customerData.email = data.email
  if (data.address1) customerData.address1 = encrypt.decrypt(data.address1)
  if (data.address2) customerData.address2 = encrypt.decrypt(data.address2)
  if (data.city) customerData.city = encrypt.decrypt(data.city)
  if (data.state) customerData.state = data.state
  if (data.country) customerData.country = data.country
  if (data.zipcode) customerData.postalCode = encrypt.decrypt(data.zipcode)

  if (user && user.customerId) {
    if (Object.keys(customerData).length > 0) {
      logger.debug(req, 'Updating Dwolla customer for user ' + user.id + ' with data', { customerId: user.customerId, customerData })
      await paymentManager.updateCustomer(user.customerId, customerData)
    }
  } else {
    if (data.firstName) customerData.firstName = data.firstName
    if (data.lastName) customerData.lastName = data.lastName

    logger.debug(req, 'Creating Dwolla customer for user ' + data.id + ' with data', { customerData })
    const createdCustomerLink = await paymentManager.createCustomer(customerData, req)
    const customersString = 'customers/'
    const customerId = createdCustomerLink.slice(createdCustomerLink.indexOf(customersString) + customersString.length)
    await models.user.updateById(data.id, {
      verified: true,
      customerId: customerId
    })
  }
}

const _manageAndEncryptUserData = async (req, userId, data) => {
  const updateData = {}

  // address update
  if (data.address1) updateData.address1 = encrypt.encrypt(data.address1)
  if (data.address2) updateData.address2 = encrypt.encrypt(data.address2)
  if (data.aptSuite) updateData.aptSuite = encrypt.encrypt(data.aptSuite)
  if (data.city) updateData.city = encrypt.encrypt(data.city)
  if (data.state) updateData.state = data.state
  if (data.country) updateData.country = data.country
  if (data.zipcode) updateData.zipcode = encrypt.encrypt(data.zipcode)

  if (data.firstName) updateData.firstName = data.firstName
  if (data.lastName) updateData.lastName = data.lastName
  if (data.email) {
    const dbUser = await models.user.findByEmail(data.email, { raw: true })
    if (dbUser && dbUser.id !== userId) {
      throw error('ALREADY_REGISTERED')
    }
    updateData.email = data.email
  }

  if (data.birthdate) {
    const dateOfBirth = moment(data.birthdate).format('YYYY-MM-DD')
    const years = moment().diff(dateOfBirth, 'years')
    if (years < 18) {
      throw (error('MUST_BE_OVER_EIGHTEEN'))
    }
    updateData.birthdate = data.birthdate
  }
  if (data.ssn) {
    if (data.ssn.length !== 9) throw (error('INVALID_SSN'))
    updateData.fullSSN = encrypt.encrypt(data.ssn) // we encrypt data
    updateData.ssn = data.ssn.substr(5, 4) // we take last four
  }
  return updateData
}

const _verifyPhoneNumber = async (req, { userId, phone }) => {
  if (!config.disablePhoneUniqueness) {
    const found = await models.user.findByPhoneNotUser(userId, phone)
    if (found) throw error('PHONE_VERIFIED')
  }

  await models.user.updateById(userId, { verificationCode: null, phoneNumber: phone, verified: true })
  analyticsManager.userUpdatePhone(req, userId, phone)

  if (!config.allowNotVerified && !req.user.phoneNumber) {
    // Only for first phone adding
    await _createUpdateCustomerAtProvider(null, req.user, req)
  }
}

const _verifyLoginNumber = async (req, { userId }) => {
  await models.user.updateById(userId, { verificationCode: null })
}

const _verifyChangePassword = async (req, { userId }) => {
  await models.user.updateById(userId, { verificationCode: null })
}

const _getAccountForUser = async (userId, req) => {
  try {
    const accounts = await models.sequelize.query(scripts.RETURN_USER_ACCOUNTS_DATA,
      { replacements: [userId], type: models.sequelize.QueryTypes.SELECT })
    return accounts.map(account => { account.primary = !!account.primary; return account })
  } catch (err) {
    logger.error(req, err, 'Error fetching user Accounts', { userId })
    throw err
  }
}

module.exports.getAccountForUser = _getAccountForUser
module.exports.generateTokens = _generateTokens
module.exports.returnBasicUserData = _returnBasicUserData

module.exports.register = async (data, req) => {
  const found = await models.user.findByEmail(data.email)
  if (found) throw error('ALREADY_REGISTERED')
  const setting = await models.settings.findOne()

  data.password = _cryptPassword(data.password)
  const trans = await DB.transaction()
  try {
    const user = await models.user.createOne(data, { transaction: trans })
    const userId = user.dataValues.id

    const { token, refreshToken } = _generateTokens(req, user.dataValues, data)

    const usdWallet = await assetManager.initUserWallet(userId, 'USD', trans, req)

    const fixedInvestments = []
    const promises = setting.portfolio.map(({ currency, name, percent }) => {
      fixedInvestments.push({ currency, name, percent, userId })
      // create user wallet
      return assetManager.initUserWallet(userId, currency, trans, req)
    })

    const balance = await Promise.all(promises)
    balance.push(usdWallet)
    await models.portfolioInvestment.bulkCreate(fixedInvestments, { transaction: trans })
    await trans.commit()

    if (config.allowNotVerified) {
      await _createUpdateCustomerAtProvider(null, user.dataValues, req)
    }

    const confirmationLink = _generateEmailConfirmationLink(user.dataValues)
    notificationManager.processEventForNotification(req, user, notificationManager.EVENTS.EMAIL_CONFIRMATION, confirmationLink)
    analyticsManager.createUser(req, user.dataValues)

    const portfolio = await assetManager.getPortfolioForUser(userId, req)

    return {
      token,
      refreshToken,
      user: _returnBasicUserData(user.dataValues, true),
      balance,
      portfolio: portfolio
    }
  } catch (err) {
    logger.error(req, err, 'ERROR creating user assets')
    await trans.rollback()
    throw err
  }
}

/**
 * Try to login user with email and password
 * @param email
 * @param password
 */
module.exports.login = async (req, email, password, code, deviceId) => {
  try {
    /*
    const found = await models.user.findByEmail(email, { raw: true })
    if (!found) throw error('NOT_FOUND')
    const userId = found.id
    req.user = found
    const phoneNumber = found.phoneNumber
    // if (!phoneNumber) throw error("NOT_FOUND", "Phone number")

    if (!_validatePassword(password, found.password)) throw error('INVALID_USERNAME_PASSWORD')

    if (found.phoneNumber && config.enable2FA) {
      if (code) {
        await _verifyCode(req, code, VERIFICATION.EVENTS.LOGIN)
      } else {
        _sendVerificationCode(req, phoneNumber, VERIFICATION.EVENTS.LOGIN)
        throw error('PHONE_VERIFICATION_NEEDED', phoneNumber)
      }
    }

    const { token, refreshToken } = _generateTokens(req, found, { deviceId })*/
    // const accounts = await _getAccountForUser('1060', req)
    const accounts = {
      "id": 824,
      "name": "Chase - Plaid Checking",
      "mask": "0000",
      "type": "depository",
      "subtype": "checking",
      "primary": true,
      "institution": "Chase"
    }
    const balance = await assetManager.getBalance('1060')
    const portfolio = await assetManager.getPortfolioForUser('1060', req)
    return {
      // token,
      // refreshToken,
      user: _returnBasicUserData(),
      accounts,
      balance,
      portfolio
    }
  } catch (err) {
    logger.error(req, err, 'Error in login process', { email, password: code })
    throw err
  }
}

module.exports.logout = async (token) => {
  const data = sessionManager.getKey(token)
  // if (data && data.refreshToken) sessionManager.removeKey(data.refreshToken)
  sessionManager.removeKey(token)
}

/**
 * Issues password change for User
 * @param userId
 * @param oldPassword
 * @param confirmPassword
 * @param newPassword
 */
module.exports.changePassword = async (req, userId, phoneNumber, oldPassword, confirmPassword, newPassword, code) => {
  if (newPassword !== confirmPassword) throw (error('BAD_REQUEST', "Entered new password and confirm password doesn't match"))
  const found = await models.user.findById(userId)

  if (!_validatePassword(oldPassword, found.password)) throw error('INVALID_PASSWORD')

  // if (config.enable2FA) {
  //   if (code) {
  //     await _verifyCode(req, code, VERIFICATION.EVENTS.PASSWORD)
  //   } else {
  //     if (!phoneNumber) throw error("NOT_FOUND", "Phone number")
  //     await _sendVerificationCode(req, phoneNumber, VERIFICATION.EVENTS.PASSWORD)
  //     throw error('PHONE_VERIFICATION_NEEDED')
  //   }
  // }

  const newCryptedPassword = _cryptPassword(newPassword)

  await models.user.updateOne(found, { password: newCryptedPassword })
}

module.exports.generateAndUpdateNewPassword = async (req, userId) => {
  const found = await models.user.findById(userId)

  const newPassword = util.generatePassword()

  const newCryptedPassword = _cryptPassword(newPassword)

  await models.user.updateOne(found, { password: newCryptedPassword })

  return newPassword
}

/**
 * Sends forgot email password
 * @param email
 */
module.exports.forgotPassword = async (req, user) => {
  const code = jwt.sign({
    email: user.email,
    userId: user.id
  }, config.token.forgothPassword, {
    expiresIn: 3600 // expires in 1 hour/
  })

  notificationManager.processEventForNotification(req, user, notificationManager.EVENTS.FORGOT_PASSWORD, config.serverUrl + 'forgot?code=' + code)
}

const _sendVerificationCode = async (req, phone, event) => {
  const userId = req.user.id
  try {
    const code = '' + (development ? 1111 : Math.floor(100000 + Math.random() * 900000))

    const payload = { userId, code, phone, event }

    const verificationCode = _createJWTToken(payload, config.token.userData, config.twilio.expiration)

    if (!development) await _sendSMSCode(phone, code, req)

    await models.user.updateById(userId, { verificationCode })
    logger.info(req, `Successfully sent verification code ${code} for event ${event} to user ${userId}`)
  } catch (err) {
    logger.error(req, err, 'Error Sending verification code to number ' + phone)
    throw err
  }
}

module.exports.sendVerificationCode = _sendVerificationCode

const _verifyCode = async (req, code, event) => {
  code = '' + code // converts it to string
  const { id, verificationCode } = req.user
  const decoded = await _decodeJWTToken(verificationCode, config.token.userData, 'VERIFICATION_CODE_EXPIRED', 'INVALID_VERIFICATION_CODE')
  if (!decoded || decoded.userId !== id || decoded.code !== code || decoded.event !== event) {
    throw error('INVALID_VERIFICATION_CODE')
  }

  if (decoded.event === VERIFICATION.EVENTS.PHONE) {
    await _verifyPhoneNumber(req, decoded)
  } else if (decoded.event === VERIFICATION.EVENTS.LOGIN) {
    await _verifyLoginNumber(req, decoded)
  } else if (decoded.event === VERIFICATION.EVENTS.PASSWORD) {
    await _verifyChangePassword(req, decoded)
  }
}
module.exports.verifyCode = _verifyCode

var _sendSMSCode = async (phoneNumber, code, req) => {
  // generate confirmation code and send it to user's new phone number

  try {
    await twilioClient.lookups.v1.phoneNumbers(phoneNumber).fetch()
  } catch (e) {
    throw error('PHONE_VERIFICATION_ERROR', phoneNumber)
  }

  if (!development) {
    await twilioClient.messages
      .create({
        body: 'Your Onramp verification code is: ' + code,
        from: config.twilio.from,
        to: phoneNumber
      })
    logger.info(req, 'Sent verification code ' + code + 'to phone ' + phoneNumber)
  }
}

module.exports.updateUser = async (req) => {
  const user = req.user
  const data = req.body
  try {
    const updateData = await _manageAndEncryptUserData(req, user.id, req.body)
    if (user.customerId) {
      await _createUpdateCustomerAtProvider(user, data, req)
    }
    await models.user.updateById(req.user.id, updateData)

    analyticsManager.updateUser(req, req.user.id, _.defaultsDeep(updateData, req.user))
  } catch (err) {
    logger.error(req, err, 'ERROR updating basic info for user ', req.user, req.body)
    throw err
  }
}

module.exports.updatePortfolio = async (userId, investments) => {
  await models.portfolioInvestment.bulkCreate(investments, { ignoreDuplicates: true, updateOnDuplicate: ['percent'] })

  return { success: true }
}
