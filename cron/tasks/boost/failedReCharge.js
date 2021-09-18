/**
 * Created by laslo on 12/10/18.
 */

// const models = require('../../../database/models')
const assetManager = require('../../../managers/assetManager')
const boostManager = require('../../../managers/boostManager')
const paymentManager = require('../../../managers/payment')
const util = require('../../../lib/util')
const error = require('../../../lib/error')
const logger = require('../../../lib/logger')

const _reChargeUser = async (req, failedBoost) => {
  const { currency, amount, userId, recurringId, sparechangeId } = failedBoost.dataValues
  try {
    if (amount <= 0) return
    let bankAccountId
    if (recurringId) {
      const recurring = await models.recurring.findById(recurringId, { raw: true })
      bankAccountId = recurring.bankAccountId
    } else if (sparechangeId) {
      const sparechange = await models.sparechange.findById(sparechangeId, { raw: true })
      bankAccountId = sparechange.bankAccountId
    }
    const bankAccount = await models.bankAccount.findById(bankAccountId, { raw: true })
    if (bankAccount) {
      const bankInfo = await paymentManager.getBalance(req, bankAccount.accessToken, bankAccount.accountId)
      if (bankInfo.balances.available < amount) {
        throw (error('NOT_ENOUGH_MONEY', bankAccount))
      }

      await assetManager.chargeUserBank(userId, bankAccount, amount, currency, null, null, null, req)
      await models.failedBoosts.updateOne(failedBoost, { active: false, success: true, nextProcessingDate: null })
    }
  } catch (err) {
    logger.error(req, err, 'ERROR in recharge', { failedBoost })
    await boostManager.failedRecharge(failedBoost)
  }
}

const _recharge = async () => {
  const req = util.returnBatchRequest()
  const failedBoosts = await models.failedBoosts.findForRecharge()

  if (failedBoosts && failedBoosts.length > 0) {
    logger.info(req, 'processing recharges, count=' + failedBoosts.length)

    _rechargeBoosts(req, failedBoosts)
  } else {
    logger.info(req, 'No recharges to process')
  }
}

const _rechargeBoosts = async (req, failedBoosts) => {
  if (failedBoosts && failedBoosts.length > 0) {
    const failedBoost = failedBoosts.pop()
    logger.info(req, 'Recharging boost ' + failedBoost.id + ' remaining ' + failedBoosts.length)
    await _reChargeUser(req, failedBoost)
    await _rechargeBoosts(req, failedBoosts)
  }
}

/**
 * Task entry point
 */
const run = async () => {
  _recharge()
}

exports.run = run
