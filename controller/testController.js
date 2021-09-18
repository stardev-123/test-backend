/**
 * Created by laslo on 04/10/18.
 */

// const models = require('../database/models')
const error = require('../lib/error')
const plaid = require('../managers/payment/dwolla/plaid')

module.exports.resetBankToken = async (req, res, next) => {
  const { bankAccountId } = req.params
  const bankAccount = await models.bankAccount.findById(bankAccountId, { raw: true })
  if (!bankAccount) return next(error('NOT_FOUND'))
  plaid.resetAccessToken(bankAccount.accessToken).then(() => {
    res.json({ success: true })
  }).catch(next)
}

module.exports.pullDailyPrices = async (req, res, next) => {
  require('../cron/tasks/market/prices').pullAndUpdateDailyPrices()
  res.json({ started: true })
}
