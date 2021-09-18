// const models = require('../database/models')
const error = require('../lib/error')

exports.checkIsTradingRules = async (req, res, next) => {
  const { tradingEnabled, postponedTrading } = await models.settings.getTradingData()
  if (!tradingEnabled) return next(error('TRADING_NOT_ACTIVE'))
  if (req.user.tradingForbidden) return next(error('TRADING_FORBIDDEN'))
  req.postponedTrading = postponedTrading
  next()
}
