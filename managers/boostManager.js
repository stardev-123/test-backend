const moment = require('moment')
const models = require('../database/models')
const notificationManager = require('./notificationManager')
const logger = require('../lib/logger')

module.exports.notifyForRecurring = async (req, { userId, amount }) => {
  try {
    const user = await models.user.findById(userId, { raw: true })
    const date = moment().add(2, 'days').format('MM/DD/YYYY')
    notificationManager.processEventForNotification(req, user, notificationManager.EVENTS.NOTIFY_FOR_RECURRING, { amount, date })
  } catch (err) {
    logger.error(req, err, 'Error notifying user for recurring')
  }
}

module.exports.notifyForSparechange = async (req, { id, userId, charge, accounts }) => {
  try {
    const user = await models.user.findById(userId, { raw: true })
    const date = moment().add(2, 'days').format('MM/DD/YYYY')
    const masks = accounts.map(account => account.mask)
    notificationManager.processEventForNotification(req, user, notificationManager.EVENTS.NOTIFY_FOR_SPARECHANGE, {
      amount: charge,
      date,
      masks
    })
  } catch (err) {
    logger.error(req, err, 'Error notifying user for spreachange with id ' + id)
  }
}

module.exports.addRecurringToFailed = async ({ id, userId, currency, amount }) => {
  const found = await models.failedBoosts.findByRecurringId(id)
  if (!found) {
    models.failedBoosts.createOne({
      recurringId: id,
      currency,
      userId,
      amount,
      nextProcessingDate: moment().add(2, 'days').toDate()
    })
  }
  const user = models.user.findById(userId, { raw: true })
  notificationManager.processEventForNotification(null, user, notificationManager.EVENTS.INSUFFICIENT_FUND_FOR_RECURRING)
}

module.exports.addSparechangeToFailed = async ({ id, userId, currency, ongoing }) => {
  const found = await models.failedBoosts.findBySparechangeId(id)
  if (!found) {
    models.failedBoosts.createOne({
      sparechangeId: id,
      currency,
      userId,
      amount: ongoing,
      nextProcessingDate: moment().add(2, 'days').toDate()
    })
  }
  const user = models.user.findById(userId, { raw: true })
  notificationManager.processEventForNotification(null, user, notificationManager.EVENTS.INSUFFICIENT_FUND_FOR_SPARECHANGE)
}

module.exports.failedRecharge = async (failedBoost) => {
  const { count, userId, recurringId } = failedBoost.dataValues
  let event
  if (recurringId) {
    event = notificationManager.EVENTS.INSUFFICIENT_FUND_FOR_RECURRING
  } else {
    event = notificationManager.EVENTS.INSUFFICIENT_FUND_FOR_SPARECHANGE
  }
  const user = models.user.findById(userId, { raw: true })
  if (count === 1) { // second time
    logger.info(null, 'UNSUCCESSFUL second recharge, abound', failedBoost)
    await models.failedBoosts.updateOne(failedBoost, { count: count + 1, active: false })
  } else {
    logger.info(null, 'UNSUCCESSFUL recharge, postpone', failedBoost)
    await models.failedBoosts.updateOne(failedBoost, { count: count + 1, nextProcessingDate: moment().add(2, 'days').toDate() })
    notificationManager.processEventForNotification(null, user, event)
  }
}
