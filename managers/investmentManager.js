const constants = require('../lib/constants')
const models = require('../database/models')
const notificationManager = require('./notificationManager')
const analyticsManager = require('./analytics')
const logger = require('../lib/logger')

/**
 * Updates investmentTransaction amount in Investment and returns is investment finished
 *
 * @param id
 * @param assets
 * @param currency
 * @param volume
 * @param req
 * @returns {object} - with fields done and amount
 * @private
 */
const _updateInvestmentState = (id, assets, currency, volume, req) => {
  const asset = assets.find(one => one.currency === currency)
  if (asset) {
    asset.settled += volume
    if (asset.settled >= asset.value) {
      if (asset.settled > asset.value) {
        logger.warn(req, 'More invested then targeted, settled:' + asset.settled + ' targeted ' + asset.value, {
          currency,
          volume,
          investmentId: id
        })
      }
      asset.settled = asset.value
      asset.done = true
    }
  } else {
    logger.warn(req, 'Not found currency in investment assets', { currency, volume, investmentId: id })
  }
}

/**
 * Creates investment object in DB
 *
 * @param userId
 * @param type
 * @param amount
 * @param ratio - List of {currency , value} pairs
 * @param req
 * @returns {*}
 */
module.exports.createInvestment = async ({ userId, type, amount, ratio, single, bundleId }, trans, req) => {
  const status = constants.INVESTMENTS.STATUS.PENDING
  const assets = []
  ratio.forEach(({ currency, value, percent }) => {
    assets.push({ currency, value, percent, settled: 0, done: value === 0 })
  })
  const investment = await models.investment.createOne({
    type, amount, assets, userId, status, single, bundleId
  }, { transaction: trans })
  if (req.user.firstInvestment && type !== constants.INVESTMENTS.TYPE.SELL) {
    await models.user.updateById(req.user.id, { firstInvestment: false, investmentsCount: 1, firstInvestmentDate: new Date() }, { transaction: trans })
  } else {
    await models.user.updateInvestmentsCountById(userId, { transaction: trans })
  }

  return investment
}

/**
 * On trade offer creating or quoting we create investmentTransaction to track that trade result
 *
 * @param userId
 * @param investmentId
 * @param providerTransactionId
 * @param type
 * @param currency
 * @param amount
 * @param price
 * @param req
 */
module.exports.investmentTransactionCreate = async ({ investmentId, providerTransactionId, type, currency, volume, amount, price, status }, req) => {
  try {
    await models.investmentTransaction.createOne({
      investmentId, providerTransactionId, type, currency, volume, amount, price, status
    })
  } catch (err) {
    logger.error(req, err, 'Error creating Investment Transaction', { investmentId, type, amount, price })
  }
}

/**
 * On crypto trade provider trade confirmation we set that investment transaction to done
 * and check the state of the investment
 * @param req
 * @param investment
 * @param push
 * @returns boolean - is the investment done true or false
 */
module.exports.updateInvestmentState = async (req, investment, push) => {
  try {
    logger.debug(req, 'checking investment state for status update', { investment })
    const { id, assets, type, amount, userId } = investment.dataValues
    const investmentTransactions = await models.investmentTransaction.findForInvestmentId(id, { raw: true })
    let done = true
    let totalAmount = 0
    assets.forEach(asset => {
      asset.settled = 0
      asset.done = false
    })
    investmentTransactions.forEach(({ currency, amount, volume }) => {
      const volumeValue = type === constants.INVESTMENTS.TYPE.SELL ? volume : amount
      _updateInvestmentState(id, assets, currency, volumeValue, req)
      totalAmount += amount
    })

    assets.forEach(asset => {
      done = done && asset.done
    })

    const data = { assets }
    if (done) {
      req.disablePush = !push
      data.status = constants.INVESTMENTS.STATUS.PROCESSED
      if (type === constants.INVESTMENTS.TYPE.SELL) {
        data.amount = totalAmount
        notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.CONFIRM_SALE_OF_CRYPTO, { coins: investmentTransactions, value: totalAmount })
        analyticsManager.userSold(req, userId, totalAmount)
      } else {
        analyticsManager.userInvested(req, userId, amount, assets)
        if (!req.user.investmentsCount) {
          notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.FIRST_INVESTMENT, { investments: investmentTransactions, amount })
        } else {
          notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.CONFIRM_NEW_INVESTMENT, { investments: investmentTransactions, amount })
        }
      }
    }
    await models.investment.updateOne(investment, data)
  } catch (err) {
    logger.error(req, err, 'Error updating Investment transaction done', investment.dataValues.id)
  }
}

module.exports.markInvestmentFailed = async (investmentId, options) => {
  await models.investment.markFailed(investmentId, options)
}
