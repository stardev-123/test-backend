/**
 * Created by laslo on 19/10/18.
 */

const moment = require('moment')
const models = require('../../../database/models')
const paymentManager = require('../../../managers/payment')
const assetManager = require('../../../managers/assetManager')
const boostManager = require('../../../managers/boostManager')
const analyticsManager = require('../../../managers/analytics')
const util = require('../../../lib/util')
const error = require('../../../lib/error')
const logger = require('../../../lib/logger')

const _processAccountTransactions = async (req, userId, account, startDate, endDate) => {
  const { code, account_id: accountId, name, mask } = account
  const institution = await models.institution.findByUserIdAndCode(userId, code, { raw: true })
  if (!institution) {
    logger.warn(req, 'NOT found institution for ', { userId, code })
    return 0
  }
  let roundUps = 0

  const transactionData = await paymentManager.getBankTransactions(institution.accessToken, accountId, startDate, endDate)
  if (transactionData.transactions) {
    const processed = []

    transactionData.transactions.forEach(transaction => {
      if (transaction.amount > 0) {
        transaction.currency = transaction.iso_currency_code || transaction.unofficial_currency_code
        transaction.date = moment(transaction.date)
        transaction.userId = userId
        transaction.accountName = name
        transaction.accountMask = mask
        transaction.roundUp = Math.ceil(transaction.amount) - transaction.amount
        if (transaction.roundUp > 0) roundUps += transaction.roundUp
        processed.push(transaction)
      }
    })
    logger.debug(req, 'Inserting ' + processed.length + ' for ' + userId + ', accountId ' + accountId)
    await models.userCardTransaction.bulkCreate(processed)
  }

  return roundUps
}

// DAILY PULL FUNCTIONS

/**
 * Task entry point
 */
const dailyPull = async (startDate, endDate) => {
  const req = util.returnBatchRequest()
  try {
    const sparechanges = await models.sparechange.findActive()

    if (sparechanges && sparechanges.length > 0) {
      startDate = startDate || moment().subtract(1, 'days').format('YYYY-MM-DD')
      endDate = endDate || moment().format('YYYY-MM-DD')

      logger.info(req, 'processing sparechange daily pull, count=' + sparechanges.length)

      await _processUserSpareChangeTransactions(req, sparechanges, startDate, endDate)

      logger.info(req, 'Finished processing sparechange daily pull, count=' + sparechanges.length)
    }
  } catch (err) {
    logger.info(req, 'Error processing sparechange daily pull', err)
  }
}

const _processUserSpareChangeTransactions = async (req, sparechanges, startDate, endDate) => {
  if (sparechanges && sparechanges.length > 0) {
    const sparechange = sparechanges.pop()
    logger.info(req, 'Processing sparechange ' + sparechange.id + ' daily pull, remaining ' + sparechanges.length)
    await _processUserTransactions(req, sparechange, startDate, endDate)
    await _processUserSpareChangeTransactions(req, sparechanges, startDate, endDate)
  }
}

const _processUserTransactions = async (req, sparechange, startDate, endDate) => {
  try {
    const { userId, accounts } = sparechange.dataValues
    let roundUps = 0

    let promises = []

    if (accounts) {
      try {
        promises = accounts.map(account => {
          return _processAccountTransactions(req, userId, account, startDate, endDate)
        })
      } catch (err) {
        logger.error(req, err, 'Error processing card account transactions', { userId, accounts })
      }
    }

    const allRoundUps = await Promise.all(promises)
    allRoundUps.forEach(value => { roundUps += value })

    if (roundUps > 0) {
      await models.sparechange.incrementOngoingAmount(sparechange, roundUps)
    }
  } catch (err) {
    logger.error(req, err, 'ERROR in sparechanges daily pull', { sparechange })
  }
}

// SPARECHANGE PRE CHARGE FUNCTIONS

/**
 * Task entry point
 */
const monthlyPreCharge = async () => {
  const req = util.returnBatchRequest()
  const sparechanges = await models.sparechange.findActive()

  if (sparechanges && sparechanges.length > 0) {
    logger.info(req, 'processing sparechanges monthly charge, count=' + sparechanges.length)

    await _processSpareChangesPreCharges(req, sparechanges)
  } else {
    logger.info(req, 'No sparechanges to process')
  }
}

const _processSpareChangesPreCharges = async (req, sparechanges) => {
  if (sparechanges && sparechanges.length > 0) {
    const sparechange = sparechanges.pop()
    logger.info(req, 'Pre charge sparechange ' + sparechange.id + ' remaining ' + sparechanges.length)
    await _processSpareChangePreCharge(req, sparechange)
    await _processSpareChangesPreCharges(req, sparechanges)
  }
}

const _processSpareChangePreCharge = async (req, sparechange) => {
  try {
    const { ongoing, userId } = sparechange.dataValues
    logger.debug(req, 'Processing sparchange pre charge for user ' + userId)

    await models.sparechange.updateOne(sparechange, { charge: ongoing, ongoing: 0 })
    boostManager.notifyForSparechange(req, sparechange.dataValues)
  } catch (err) {
    logger.error(req, err, 'ERROR in sparechanges pre charge', { sparechange })
  }
}

// SPARCHANGE CHARGE FUNCTIONS

/**
 * Task entry point
 */
const monthlyCharge = async () => {
  const req = util.returnBatchRequest()
  const sparechanges = await models.sparechange.findActive()

  if (sparechanges && sparechanges.length > 0) {
    logger.info(req, 'processing sparechanges monthly charge, count=' + sparechanges.length)

    await _processSpareChangeCharges(req, sparechanges)
  } else {
    logger.info(req, 'No sparechanges to process')
  }
}

const _processSpareChangeCharges = async (req, sparechanges) => {
  if (sparechanges && sparechanges.length > 0) {
    const sparechange = sparechanges.pop()
    logger.info(req, 'Charging sparechange ' + sparechange.id + ' remaining ' + sparechanges.length)
    await _processSpareChangeCharge(req, sparechange)
    await _processSpareChangeCharges(req, sparechanges)
  }
}

const _processSpareChangeCharge = async (req, sparechange) => {
  try {
    const { invested, charge, currency, userId, bankAccountId } = sparechange.dataValues
    logger.debug(req, 'Processing sparchange for user ' + userId)
    const bankAccount = await models.bankAccount.findById(bankAccountId, { raw: true })
    const updateData = { lastChargeDate: new Date() }
    if (charge > 0) {
      const bankInfo = await paymentManager.getBalance(req, bankAccount.accessToken, bankAccount.accountId)
      if (bankInfo.balances.available < charge) {
        throw (error('NOT_ENOUGH_MONEY', bankAccount))
      }

      updateData.charge = 0
      updateData.invested = invested + charge
      await assetManager.chargeUserBank(userId, bankAccount, charge, currency)
      analyticsManager.userSparechangeInvestment(req, charge)
    }

    await models.sparechange.updateOne(sparechange, updateData)
  } catch (err) {
    await boostManager.addSparechangeToFailed(sparechange.dataValues)
    logger.error(req, err, 'ERROR in sparechanges monthly charge', { sparechange })
  }
}

exports.dailyPull = dailyPull
exports.monthlyPreCharge = monthlyPreCharge
exports.monthlyCharge = monthlyCharge
