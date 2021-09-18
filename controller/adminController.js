/**
 * Created by laslo on 04/10/18.
 */

// const models = require('../database/models')
const util = require('../lib/util')
const constants = require('../lib/constants')
// const scripts = require('../scripts')
const cryptoManager = require('../managers/crypto')
const assetManager = require('../managers/assetManager')
const accountManager = require('../managers/accountManager')
const sessionManager = require('../managers/sessionManager')
const error = require('../lib/error')
const logger = require('../lib/logger')

// const _insertNewCurrencies = async (coins, req) => {
//   if (!coins || coins.length == 0) return
//   const coin = coins.pop()
//
//   let query = scripts.INSERT_MISSING_COIN.replace(/#NAME/g, "'" + coin.name + "'").replace(/#CODE/g, "'" + coin.currency + "'")
//
//   try {
//     logger.info(req, 'Adding new coins query=' + query)
//     await DB.query(query)
//   } catch (err) {
//     logger.error(req, err, 'Error adding missing new coin ' + coin.currency + ' to users portfolio')
//   }
//   await _insertNewCurrencies(coins, req)
// }

module.exports.getSettings = async (req, res, next) => {
  try {
    const setting = await models.settings.findOne()
    res.json(setting)
  } catch (err) {
    logger.error(req, err, 'ADMIN URL ERROR')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.updateDefaultPortfolio = async (req, res, next) => {
  const portfolio = req.body.portfolio
  const setting = await models.settings.findOne()
  const supportedCoins = setting.coins.map(coinData => coinData.currency)
  const existing = []
  let percentSum = 0
  portfolio.forEach(crypto => {
    if (existing.indexOf(crypto.currency) > -1) {
      next(error('BAD_REQUEST', "Default Portfolio investments can't have duplicate values"))
    }
    if (supportedCoins.indexOf(crypto.currency) === -1) {
      next(error('BAD_REQUEST', "Default Portfolio can't have not supported coin"))
    } else {
      supportedCoins.splice(supportedCoins.indexOf(crypto.currency), 1)
    }
    existing.push(crypto.currency)
    percentSum += util.round(crypto.percent, 2)
  })
  // if (supportedCoins.length > 0){
  //   next(error('BAD_REQUEST', "Default Portfolio can't have less coins from supported"));
  // }
  percentSum = util.round(percentSum, 2)
  if (percentSum !== 100) {
    next(error('BAD_REQUEST', 'Portfolio investments percent sum must be 100 but it is ' + percentSum))
  }
  try {
    await models.settings.updateOne(setting, { portfolio })
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR updating default portfolio', { portfolio })
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.updateSupportedCoins = async (req, res, next) => {
  const setting = await models.settings.findOne()
  const coins = req.body.coins
  try {
    await models.settings.updateOne(setting, { coins })
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR updating supported coins', { coins })
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.enableDisableTrading = async (req, res, next) => {
  try {
    const setting = await models.settings.findOne()
    await models.settings.updateOne(setting, { tradingEnabled: !setting.tradingEnabled })
    res.json({ success: true })
    logger.info(req, `Successfully changed trading enabled to ` + setting.tradingEnabled)
  } catch (err) {
    logger.error(req, err, 'ERROR changing trading state')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.enableDisablePostponedTrading = async (req, res, next) => {
  try {
    const setting = await models.settings.findOne()
    await models.settings.updateOne(setting, { postponedTrading: !setting.postponedTrading })
    res.json({ success: true })
    logger.info(req, `Successfully changed postponed trading to ` + setting.postponedTrading)
  } catch (err) {
    logger.error(req, err, 'ERROR changing trading postponed state')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.enableDisableUserTrading = async (req, res, next) => {
  try {
    const user = await models.user.findById(req.params.userId)
    await models.user.updateOne(user, { tradingForbidden: !user.tradingForbidden })
    res.json({ success: true })
    logger.info(req, `Successfully changed user ${req.params.userId} trading rights to ` + !user.tradingForbidden)
  } catch (err) {
    logger.error(req, err, 'ERROR updating user trading rights')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.processUnfinishedInvestments = async (req, res, next) => {
  try {
    await require('../cron/tasks/transactions/checkUnfinishedTrades').run()
    logger.info(req, 'Finished processing unfinished investments')
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR processing unfinished investments')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.pullDailyPrices = async (req, res, next) => {
  try {
    await require('../cron/tasks/market/prices').pullDailyPrices()
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR pulling daily prices')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.pullHourlyPrices = async (req, res, next) => {
  try {
    await require('../cron/tasks/market/prices').pullHourlyPrices()
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR pulling daily prices')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.pullHistory = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query
    logger.info(req, 'processing history prices pull for ' + limit + ' days')
    const { portfolio } = await models.settings.findOne({ attributes: ['portfolio'], raw: true })
    const coins = portfolio.map(({ currency }) => currency)
    await _insertCoinsHistory(req, coins, limit)

    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR pulling history prices')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.initEmailWhiteList = async (req, res, next) => {
  try {
    const status = constants.USER.EMAIL_STATUSES.VALID
    logger.info(req, 'processing email whitlist initialization')
    await models.emailWhitelist.deleteAll()
    const emailMap = {}
    const users = await models.user.findAll({ raw: true })
    users.forEach(({ email }) => {
      const parts = email.split('@')
      let username = parts[0].toLowerCase()
      if (username.indexOf('+') !== -1) {
        username = username.substr(0, username.indexOf('+'))
      }
      emailMap[username + '@' + parts[1]] = true
    })
    const emailWhitelist = Object.keys(emailMap).map(email => ({ email, status }))
    await models.emailWhitelist.bulkCreate(emailWhitelist)

    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR processing email whitlist initialization')
    next(error('INTERNAL_ERROR'))
  }
}

const _insertCoinHistory = async (req, coin, limit) => {
  logger.info(req, 'processing history prices pull for ' + coin)
  const history = await cryptoManager.getHistoryDays(coin, 'USD', limit)
  const priceHistory = history.map(dayData => {
    return {
      currency: coin,
      price: dayData.price,
      date: new Date(dayData.time)
    }
  })
  await models.priceHistory.bulkCreate(priceHistory, { updateOnDuplicate: ['price'] })
  logger.info(req, 'Finished processing history prices pull for ' + coin)
}

const _insertCoinsHistory = async (req, coins, limit) => {
  if (coins && coins.length > 0) {
    const coin = coins.pop()
    await _insertCoinHistory(req, coin, limit)
    await _insertCoinsHistory(req, coins, limit)
  }
}

module.exports.findUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.query
    const conditions = []
    if (firstName) conditions.push(models.sequelize.where(models.sequelize.fn('lower', models.user.sequelize.col(`firstName`)), firstName.toLowerCase()))
    if (lastName) conditions.push(models.sequelize.where(models.sequelize.fn('lower', models.user.sequelize.col(`lastName`)), lastName.toLowerCase()))
    if (email) conditions.push(models.sequelize.where(models.sequelize.fn('lower', models.user.sequelize.col(`email`)), email.toLowerCase()))

    let result = []
    if (conditions.length > 0) {
      result = await models.user.findAll({ where: { $and: conditions } })
    }
    res.json(result)
  } catch (err) {
    logger.error(req, err, 'ADMIN URL ERROR')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.updateUser = async (req, res, next) => {
  try {
    const user = await models.user.findById(req.params.userId)
    if (!user) return next(error('NOT_FOUND'))
    await models.user.updateOne(user, req.body)
    const updated = await models.user.findById(req.params.userId)
    res.json(updated)
  } catch (err) {
    logger.error(req, err, 'ADMIN URL ERROR')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.userDetails = async (req, res, next) => {
  try {
    const user = await models.user.findById(req.params.userId)
    const accounts = await accountManager.getAccountForUser(req.params.userId, req)
    const balance = await assetManager.getBalance(req.params.userId)
    const portfolio = await assetManager.getPortfolioForUser(req.params.userId)
    res.send({ user, accounts, balance, portfolio })
  } catch (err) {
    logger.error(req, err, 'ADMIN URL ERROR')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.updateUserWallet = async (req, res, next) => {
  try {
    const wallet = await models.wallet.findByForUserAndCurrency(req.params.userId, req.params.currency)
    if (!wallet) return next(error('NOT_FOUND'))
    await models.wallet.updateOne(wallet, req.body)
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ADMIN URL ERROR')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.userTransactions = async (req, res, next) => {
  try {
    const transactions = await models.transaction.findByUserId(req.params.userId, { raw: true })
    res.json(transactions)
  } catch (err) {
    logger.error(req, err, 'ADMIN URL ERROR')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.whitelistEmail = async (req, res, next) => {
  try {
    const { email, status } = req.body
    const found = await models.emailWhitelist.findByEmail(req.body.email)
    if (found) {
      if (status !== undefined) await models.emailWhitelist.updateOne(found, { status })
    } else {
      await models.emailWhitelist.createOne({ email, status: status || constants.USER.EMAIL_STATUSES.PENDING })
    }
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ADMIN URL ERROR')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.getWhitelists = async (req, res, next) => {
  try {
    const { email, status } = req.query

    const conditions = []
    if (status !== undefined) conditions.push({ status: status })
    if (email) conditions.push(models.sequelize.where(models.sequelize.fn('lower', models.user.sequelize.col(`email`)), email.toLowerCase()))

    let result = []
    if (conditions.length > 0) {
      result = await models.emailWhitelist.findAll({ where: { $and: conditions }, raw: true })
    } else {
      result = await models.emailWhitelist.findAll({ raw: true })
    }

    res.json(result)
  } catch (err) {
    logger.error(req, err, 'ADMIN URL ERROR')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.removeToken = async (req, res, next) => {
  const token = req.body.token
  const data = sessionManager.getKey(token)
  if (data && data.refreshToken) sessionManager.removeKey(data.refreshToken)
  sessionManager.removeKey(token)
  res.json({ success: true })
}

module.exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await models.admins.findAll()
    res.json(admins)
  } catch (err) {
    logger.error(req, err, 'Error loading all admins')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.addAdmin = async (req, res, next) => {
  try {
    const admin = await models.admins.createOne(req.body)
    logger.debug(req, 'Successfully created admin with email ' + req.body.email)
    res.json(admin)
  } catch (err) {
    logger.error(req, err, 'Error adding admin', req.body)
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.getAdmin = async (req, res, next) => {
  try {
    const found = await models.admins.findById(req.params.adminId)
    if (!found) return next(error('NOT_FOUND'))
    res.json(found)
  } catch (err) {
    logger.error(req, err, 'Error updating admin', req.body)
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.updateAdmin = async (req, res, next) => {
  try {
    const found = await models.admins.findById(req.params.adminId)
    if (!found) return next(error('NOT_FOUND'))
    await models.admins.updateOne(found, req.body)
    logger.debug(req, 'Successfully updated admin with id ' + req.params.adminId)
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'Error updating admin', req.body)
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.deleteAdmin = async (req, res, next) => {
  try {
    const found = await models.admins.findById(req.params.adminId)
    if (!found) return next(error('NOT_FOUND'))
    await models.admins.deleteOne(found)
    logger.debug(req, 'Successfully removed admin with id ' + req.params.adminId)
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'Error removing admin', req.body)
    next(error('INTERNAL_ERROR'))
  }
}
