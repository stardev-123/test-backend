/**
 * Created by laslo on 07/09/18.
 */

const models = require('../database/models')
const constants = require('../lib/constants')
const notificationManager = require('../managers/notificationManager')
const isEmail = require('validator/lib/isEmail')
const error = require('../lib/error')
const logger = require('../lib/logger')
const config = require('../config')

exports.checkEmail = (req, res, next) => {
  if (!req.body.email || req.body.email.trim().length === 0) return next(error('BAD_REQUEST', 'Email missing'))
  req.body.email = req.body.email.toLowerCase()

  // email validation
  if (!isEmail(req.body.email)) {
    logger.warn(req, 'ERROR Verify Code - Wrong Email format')
    return next(error('BAD_REQUEST', 'Wrong Email format'))
  }
  next()
}

exports.checkEmailAvailability = async (req, res, next) => {
  req.body.email = req.body.email.toLowerCase()

  const found = await models.user.findByEmail(req.body.email, { attributes: ['id'], raw: true })
  if (found) return next(error('ALREADY_REGISTERED'))
  res.json({ success: true })
}

exports.checkIsWhitelisted = async (req, res, next) => {
  if (!config.emailWhitelisting) return next()
  const originalEmail = req.body.email.toLowerCase()
  let email = req.body.email.toLowerCase()
  if (!email) return next(error('EMAIL_NOT_WHITELISTED'))
  const parts = email.split('@')
  let username = parts[0]
  if (username.indexOf('+') !== -1) {
    username = username.substr(0, username.indexOf('+'))
  }

  email = username + '@' + parts[1]

  logger.debug(req, 'Checking whitelisted email ' + email)
  const found = await models.emailWhitelist.findWhitelistedEmail(email, parts[1], { raw: true })
  if (!found || found.status !== constants.USER.EMAIL_STATUSES.VALID) {
    try {
      if (!found) await models.emailWhitelist.createOne({ email, status: constants.USER.EMAIL_STATUSES.PENDING })
    } catch (err) {
      logger.error(req, err, 'Error saving not whitelisted email ' + email)
    }
    notificationManager.processEventForNotification(req, { id: 'none', email: originalEmail }, notificationManager.EVENTS.NOT_IN_WHITELIST)
    return next(error('EMAIL_NOT_WHITELISTED'))
  }
  next()
}
