const moment = require('moment')
const models = require('../../../database/models')
const constants = require('../../../lib/constants')
const assetManager = require('../../../managers/assetManager')
const investmentManager = require('../../../managers/investmentManager')
const util = require('../../../lib/util')
const logger = require('../../../lib/logger')

const { TYPE } = constants.INVESTMENTS

const _executeInvestments = async (req, investments) => {
  if (investments && investments.length > 0) {
    const investment = investments.pop()
    logger.info(req, 'Charging unfinished investment ' + investment.id + ' remaining ' + investments.length)
    await _executeInvestment(req, investment)
    await _executeInvestments(req, investments)
  }
}

const _executeInvestment = async (req, investment) => {
  const user = await models.user.findById(investment.userId, { raw: true })
  const userReq = util.cloneBatchRequest(req, { user })
  let success = true
  if (investment.type === TYPE.BUY) {
    await assetManager.buyCryptoCurrencies(investment, userReq)
  } else {
    try {
      const wallets = await models.wallet.findByForUser(user.id, { raw: true })
      assetManager.checkUserSellAvailabilityForInvestment(req, wallets, investment.assets)

      await assetManager.sellCryptoCurrencies(investment, userReq)
    } catch (err) {
      if (err.internalCode === 4021) { // internal code for not enough coins to sell
        success = false
        await investmentManager.markInvestmentFailed(investment.id)
      }
    }
  }
  if (success) await investmentManager.updateInvestmentState(userReq, investment, true)
}

/**
 * Task entry point
 */
const run = async () => {
  const req = util.returnBatchRequest()
  try {
    logger.info(req, 'processing unfinished investments')
    const { postponedTrading } = await models.settings.getTradingData()
    req.postponedTrading = postponedTrading

    const checkDate = moment().subtract(1, 'hour').startOf('hour').toDate()
    const investments = await models.investment.findInProgressBeforeDate(checkDate)

    if (investments && investments.length > 0) {
      logger.info(req, 'unfinished investments count ' + investments.length)

      await _executeInvestments(req, investments)

      logger.info(req, 'finished processing unfinished investments')
    } else {
      logger.info(req, 'No unfinished investments for processing')
    }
  } catch (err) {
    logger.error(req, err, 'Failed to do processing unfinished investments')
  }
}

exports.run = run
