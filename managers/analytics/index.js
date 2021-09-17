/**
 * Created by laslo on 07/11/18.
 */
const logger = require('../../lib/logger')
const config = require('../../config')
const assetManager = require('../assetManager')
let analyticsProvider

if (config.analytics) {
  analyticsProvider = require('./' + config.analytics)
}

const SPARECHANGE = 'sparechange'
const RECCURING = 'reccuring'

exports.createUser = (req, { id, email, firstName, lastName }) => {
  if (!analyticsProvider) return
  try {
    analyticsProvider.createUser({ id, email, firstName, lastName })
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { userId: id, data: { id, email, firstName, lastName } }, err)
  }
}

exports.updateUser = (req, userId, { email, firstName, lastName, birthday, phoneNumber }) => {
  if (!analyticsProvider) return
  try {
    analyticsProvider.updateUser(userId, { email, firstName, lastName, birthday, phoneNumber })
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { userId, data: { email, firstName, lastName, birthday, phoneNumber } }, err)
  }
}

exports.userUpdatePhone = (req, userId, PhoneNumber) => {
  if (!analyticsProvider) return
  try {
    analyticsProvider.userUpdatePhone(userId, PhoneNumber)
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { userId, data: { PhoneNumber } }, err)
  }
}

exports.userConfirmedCAState = (req, userId) => {
  if (!analyticsProvider) return
  try {
    analyticsProvider.userConfirmedCAState(userId)
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { userId }, err)
  }
}

exports.userUpdateAddress = (req, userId, { address1, address2, city, state, zipcode }) => {
  if (!analyticsProvider) return
  try {
    analyticsProvider.userUpdateAddress(userId, { address1, address2, city, state, zipcode })
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { userId, data: { address1, address2, city, state, zipcode } }, err)
  }
}

exports.userCharged = (req, userId, amount) => {
  if (!analyticsProvider) return
  try {
    analyticsProvider.userCharged(userId, amount)
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { userId, data: { amount } }, err)
  }
}

exports.userInvested = async (req, userId, InvestmentAmount) => {
  if (!analyticsProvider) return
  const balance = await assetManager.getBalance(userId)
  try {
    analyticsProvider.userInvested(userId, InvestmentAmount, balance)
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { userId, data: { InvestmentAmount, balance } }, err)
  }
}

exports.userSold = async (req, userId, amount) => {
  if (!analyticsProvider) return
  const balance = await assetManager.getBalance(userId)
  try {
    analyticsProvider.userSold(userId, amount, balance)
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { userId, data: { amount, balance } }, err)
  }
}

exports.userRecurringInvestment = async (req, InvestmentAmount) => {
  if (!analyticsProvider) return
  try {
    analyticsProvider.globalEvent('boost_investment', { type: RECCURING, InvestmentAmount })
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { InvestmentAmount }, err)
  }
}

exports.userSparechangeInvestment = async (req, InvestmentAmount) => {
  if (!analyticsProvider) return
  try {
    analyticsProvider.globalEvent('boost_investment', { type: SPARECHANGE, InvestmentAmount })
  } catch (err) {
    logger.warn(req, 'Error updating analytics', { InvestmentAmount }, err)
  }
}
