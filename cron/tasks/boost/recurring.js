/**
 * Created by laslo on 12/10/18.
 */

const moment = require('moment')
const util = require('../../../lib/util')
// const models = require('../../../database/models')
const assetManager = require('../../../managers/assetManager')
const paymentManager = require('../../../managers/payment')
const boostManager = require('../../../managers/boostManager')
const analyticsManager = require('../../../managers/analytics')
const error = require('../../../lib/error')
const logger = require('../../../lib/logger')

// CHARGE FUNCTIONS
const _chargeUser = async (req, { id, currency, amount, userId, bankAccountId }) => {
  try {
    if (amount <= 0) return
    const bankAccount = await models.bankAccount.findById(bankAccountId, { raw: true })
    if (bankAccount) {
      const bankInfo = await paymentManager.getBalance(req, bankAccount.accessToken, bankAccount.accountId)
      if (bankInfo.balances.available < amount) {
        throw (error('NOT_ENOUGH_MONEY', bankAccount))
      }
      await assetManager.chargeUserBank(userId, bankAccount, amount, currency)
      analyticsManager.userRecurringInvestment(req, amount)
    }
  } catch (err) {
    logger.error(req, err, 'ERROR in test recurring process', { currency, amount, userId, bankAccountId })
    await boostManager.addRecurringToFailed({ id, currency, amount, userId, bankAccountId })
  }
}

/**
 * Task entry point
 */
const run = async () => {
  const req = util.returnBatchRequest()
  const recurrings = await models.recurring.findActive({ raw: true })

  if (recurrings && recurrings.length > 0) {
    logger.info(req, 'processing recurring, count=' + recurrings.length)

    await _chargeReccurings(req, recurrings)

    logger.info(req, 'Finished processing recurrings')
  } else {
    logger.info(req, 'No recurrings to process')
  }
}

const _chargeReccurings = async (req, recurrings) => {
  if (recurrings && recurrings.length > 0) {
    const recurring = recurrings.pop()
    logger.info(req, 'Charging recurring ' + recurring.id + ' remaining ' + recurrings.length)
    await _chargeUser(req, recurring)
    await _chargeReccurings(req, recurrings)
  }
}

// NOTIFY FUNSTIONS
/**
 * Test Task entry point
 */
const notify = async () => {
  const today = moment().startOf('day')
  const notifyDate = moment().endOf('month')
  if (notifyDate().diff(today, 'days') === 2) {
    const req = util.returnBatchRequest()
    const recurrings = await models.recurring.findActive({ raw: true })

    if (recurrings && recurrings.length > 0) {
      logger.info(req, 'notify processing recurring, count=' + recurrings.length)

      await _notifyReccurings(req, recurrings)

      logger.info(req, 'Finished notify processing for recurrings')
    } else {
      logger.info(req, 'No recurrings to process notify')
    }
  }
}

const _notifyReccurings = async (req, recurrings) => {
  if (recurrings && recurrings.length > 0) {
    const recurring = recurrings.pop()
    logger.info(req, 'Notifying recurring ' + recurring.id + ' remaining ' + recurrings.length)
    await _notifyUser(req, recurring)
    await _notifyReccurings(req, recurrings)
  }
}

const _notifyUser = async (req, { amount, userId }) => {
  try {
    if (amount <= 0) return
    boostManager.notifyForRecurring(req, { amount, userId })
  } catch (err) {
    logger.error(req, err, 'ERROR in notifying recurring process', { userId })
  }
}

exports.run = run
exports.notify = notify
exports.test = run
