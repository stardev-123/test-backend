const BigNumber = require('bignumber.js')
const assetManager = require('../managers/assetManager')
const accountManager = require('../managers/accountManager')
const investmentManager = require('../managers/investmentManager')
const cryptoManager = require('../managers/crypto')
const paymentManager = require('../managers/payment')
const notificationManager = require('../managers/notificationManager')
// const models = require('../database/models')
const error = require('../lib/error')
const logger = require('../lib/logger')
const config = require('../config')
const util = require('../lib/util')
const encrypt = require('../lib/encrypt')
const constants = require('../lib/constants')
const analyticsManager = require('../managers/analytics')
const { TYPE } = constants.TRANSACTIONS

const PENDING_TRANSACTION_MESSAGE = 'Your funds will settle in your Onramp account in 1-2 business days. You may immediately access funds for investments and trades, but funds cannot be withdrawn until the settlement is complete.'

const POSTPONED_WAIT_TIME = config.postponedWaitTime || 0

const _payOutMessage = (amount, bankAccount) => {
  return `Your transfer of $${util.format(amount, 2)} to ${bankAccount.name} has been initiated. ` +
      `This transfer will take up to 2 business day to complete.`
}

/**
 * Returns ratio of list of currency value combinations pairs
 *
 * @param amount total amount to invest
 * @param requests list of currency percent pairs
 * @private
 */
const _returnCryptoRatio = (requests, amount) => {
  const ratio = []
  amount = new BigNumber(amount).decimalPlaces(2)
  let sumValues = new BigNumber(0)
  let sumPercentages = new BigNumber(0)
  const lastIndex = requests.length - 1
  requests.forEach(({ currency, percent }, index) => {
    if (percent > 0) {
      let value
      if (index === lastIndex) {
        value = amount.minus(sumValues)
      } else {
        value = amount.multipliedBy(percent).dividedBy(100).decimalPlaces(4)
      }
      sumValues = sumValues.plus(value).decimalPlaces(4)
      sumPercentages = sumPercentages.plus(percent)
      ratio.push({ currency, value: value.toNumber(), percent })
    }
  })

  if (sumPercentages.toNumber() < 100) {
    throw (error('BAD_REQUEST', 'Sum of percentages is not 100%'))
  }

  return ratio
}

const _returnInstitutionCards = async (institution) => {
  const { name, code, accessToken } = institution

  const accounts = await paymentManager.getBankAccounts(accessToken)
  const cards = accounts.filter(account => {
    delete account.balances
    return account.subtype === 'credit card' || account.subtype === 'cd'
  })

  return { institution: name, code, cards }
}

const _getTransactionData = async (req, transactionId) => {
  const userId = req.user.id
  const transaction = await models.transaction.findById(transactionId, { raw: true })
  if (!transaction) throw (error('NOT_FOUND', 'transaction'))
  if (transaction.userId !== userId) throw (error('NOT_ALLOWED'))
  const result = {}
  let details = ''
  if (transaction.bankAccountId) {
    details = await _getTransactionDescription(transaction)
  }
  result.date = transaction.createdAt
  result.type = transaction.type
  result.details = details

  if (transaction.type === TYPE.BUY_CRYPTO || transaction.type === TYPE.INVESTMENT ||
      transaction.type === TYPE.SELL_INCOME || transaction.type === TYPE.SELL_CRYPTO) {
    const investment = await models.investment.findById(transaction.investmentId, { raw: true })
    result.transactionId = investment.tid
    result.bundleId = investment.bundleId
    result.date = transaction.createdAt
    result.type = transaction.type
    if (transaction.type === TYPE.BUY_CRYPTO || transaction.type === TYPE.SELL_CRYPTO) {
      result.currency = transaction.currency
      result.amount = transaction.amount
    } else {
      result.currency = 'USD'
      result.amount = investment.amount
    }
    result.status = investment.status
    const investmentTransactions = await models.investmentTransaction.findForDetailsForInvestmentId(transaction.investmentId)
    if (transaction.type !== TYPE.SELL_INCOME && transaction.type !== TYPE.SELL_CRYPTO) {
      result.transactions = investmentTransactions
    } else {
      result.transactions = investmentTransactions.map(invTrans => { invTrans.volume = -invTrans.volume; return invTrans })
    }
  } else {
    result.transactionId = transaction.providerTransactionId
    result.status = transaction.status
    result.currency = transaction.currency
    result.amount = transaction.amount
  }
  return result
}

module.exports.verifyBankAccount = async (req, res, next) => {
  try {
    const { id, name, type, subtype, mask, primary, accessToken } = await assetManager.verifyBankAccount(req.user, req.body, req)
    logger.info(req, 'Successfully verified bank account for user with id ' + req.user.id)
    if (primary && !req.user.state) {
      logger.debug(req, 'Pulling user plaid address ' + req.user.id)
      const identityData = await paymentManager.getIdentity(accessToken)
      if (identityData && identityData.identity && identityData.identity.addresses) {
        const { data } = identityData.identity.addresses.find(address => address.primary)
        if (data) {
          const updateData = {}
          updateData.city = encrypt.encrypt(data.city)
          updateData.state = data.state
          updateData.zipcode = encrypt.encrypt(data.zip)
          updateData.address1 = encrypt.encrypt(data.street)
          logger.debug(req, 'Plaid address found updating user' + req.user.id)
          await models.user.updateById(req.user.id, updateData)
          analyticsManager.userUpdateAddress(req, req.user.id, updateData)
        }
      }
    }
    res.send({ id, name, type, subtype, mask, primary })
  } catch (err) {
    logger.error(req, err, 'Failed to verify bank account for user with id ' + req.user.id)
    next(err)
  }
}

module.exports.getBankAccounts = async (req, res, next) => {
  try {
    const { id } = req.params
    let result
    if (id) {
      result = await models.bankAccount.findById(id)
    } else {
      result = await models.bankAccount.findAll()
    }
    res.json(result)
  } catch (err) {
    logger.error(req, err, 'Failed to load bank accounts for user with id ' + req.user.id)
    next(err)
  }
}

module.exports.removeUserBankAccount = async (req, res, next) => {
  try {
    const { id } = req.params
    const bankAccount = await models.bankAccount.findById(id)
    if (!bankAccount) return next(error('NOT_FOUND', 'Bank'))
    if (bankAccount.primary) {
      return next(error('CANT_DELETE_PRIMARY_BANK'))
    }
    const sparechange = await models.sparechange.findActiveForUserIdAndBankAccountId(req.user.id, id)
    if (sparechange) return next(error('CANT_DELETE_BANK_SPARECHANGE'))
    const recurring = await models.recurring.findActiveForUserIdAndBankAccountId(req.user.id, id)
    if (recurring) return next(error('CANT_DELETE_BANK_RECURRING'))
    await models.bankAccount.updateOne(bankAccount, { active: false })
    const accounts = await accountManager.getAccountForUser(req.user.id, req)
    res.json({ accounts })
  } catch (err) {
    logger.error(req, err, 'Failed to load bank accounts for user with id ' + req.user.id)
    next(err)
  }
}

module.exports.setPrimaryBank = async (req, res, next) => {
  const userId = req.user.id
  const { id } = req.params
  try {
    await assetManager.setPrimaryBank(req, id, userId)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

module.exports.getBankCardAccounts = async (req, res, next) => {
  const userId = req.user.id
  const { code } = req.query
  try {
    let institutions = []
    if (code) {
      const institution = await models.institution.findByUserIdAndCode(userId, code)
      if (institution) institutions.push(institution)
    } else {
      institutions = await models.institution.findByUserId(userId, { raw: true })
    }
    const promises = institutions.map(institution => {
      return _returnInstitutionCards(institution)
    })

    const result = await Promise.all(promises)

    res.json(result)
  } catch (e) {
    logger.error(req, e, 'Error getting Bank Card Accounts')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.payOutToUserBank = async (req, res, next) => {
  const user = req.user
  const amount = req.body.amount
  const bankAccountId = req.body.bankAccountId

  try {
    const foundBankAccount = await models.bankAccount.findById(bankAccountId)
    if (!foundBankAccount) return next(error('NOT_FOUND', 'Bank, please connect bank account to your profile'))
    // if bank account doesn't belong to user
    if (foundBankAccount.userId !== user.id) return next(error('NOT_ALLOWED', 'This bank account belongs to different user!!!!!'))

    await assetManager.payOutToUserBank(user.id, foundBankAccount, amount, 'USD', null, req)
    res.send({
      success: true,
      message: _payOutMessage(amount, foundBankAccount),
      amount
    })
    notificationManager.processEventForNotification(req, user, notificationManager.EVENTS.WITHDRAWAL_OF_FUNDS, amount)
  } catch (err) {
    if (err && err.code === 402) {
      logger.warn(req, 'ACH Rules not meet for withdraw', err)
      res.statusCode = 402
      res.json({ error: err })
    } else {
      logger.error(req, err, 'ERROR withdrawing funds')
      next(err)
    }
  }
}

module.exports.checkInvestmentAvailability = async (req, res, next) => {
  const userId = req.user.id
  if (!req.user.verifiedAtProvider) {
    const weekInvestment = await assetManager.getWeekInvestments(userId)

    if (weekInvestment >= config.dwolla.MAX_UNVERIFIED_AMOUNT) {
      return next(error('MAX_UNVERIFIED_LIMIT_REACHED'))
    }
  }
  res.json({ success: true })
}

module.exports.addFunds = async (req, res, next) => {
  const userId = req.user.id
  const amount = util.round(req.body.amount, 2)
  const currency = req.body.currency || 'USD'
  const bankAccountId = req.body.bankAccountId

  try {
    const foundBankAccount = await models.bankAccount.findById(bankAccountId)
    if (!foundBankAccount) return next(error('NOT_FOUND', 'Bank, please connect bank account to your profile'))
    // if bank account doesn't belong to user
    if (foundBankAccount.userId !== userId) return next(error('NOT_ALLOWED', 'This bank account belongs to different user!!!!!'))

    // we don't need wallet information when user is adding funds
    await assetManager.checkCustomerBuyAmountRules(req.user, amount, { amount: 0, pending: 0 }, true)

    await assetManager.chargeUserBankAccount(req.user, foundBankAccount, amount, currency, null, null, null, req)
    res.json({ success: true, message: PENDING_TRANSACTION_MESSAGE })
    notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.ADD_FUNDS_COMPLETED, amount)
  } catch (err) {
    if (err && err.code === 402) {
      logger.warn(req, 'ACH Rules not meet for add funds', err)
      res.statusCode = 402
      res.json({ error: err })
    } else {
      logger.error(req, err, 'ERROR adding funds')
      next(err)
    }
  }
}

const _checkSupportedCoins = async (currencies) => {
  const settings = await models.settings.findOne()
  const coinList = settings.coins.map(coin => coin.currency)
  const filtered = currencies.filter(({ currency }) => coinList.indexOf(currency) > -1)
  if (currencies.length === 1 && filtered.length === 0) {
    throw (error('COIN_NOT_SUPPORTED', currencies[0].currency))
  }
  return filtered
}

module.exports.makePortfolioInvestment = async (req, res, next) => {
  const userId = req.user.id
  const amount = util.round(req.body.amount, 2)
  let portfolio = req.body.portfolio
  const bundleId = req.body.bundleId
  const bankAccountId = req.body.bankAccountId
  const currency = req.body.currency || 'USD'
  let allowBankCharge = req.body.allowBankCharge
  if (allowBankCharge === undefined) allowBankCharge = true
  const coinPrices = req.body.prices

  const responseSent = false
  try {
    const foundBankAccount = await models.bankAccount.findById(bankAccountId)
    if (!foundBankAccount) return next(error('NOT_FOUND', 'Bank, please connect bank account to your profile'))
    // if bank account doesn't belong to user
    if (foundBankAccount.userId !== userId) return next(error('NOT_ALLOWED', 'This bank account belongs to different user!!!!!'))

    if (bundleId) {
      portfolio = await models.bundleCoins.findByBundleId(bundleId)
      if (!portfolio || portfolio.length === 0) return next(error('NOT_FOUND', 'No coin allocation found for bundle'))
    } else if (!portfolio) {
      portfolio = await assetManager.getPortfolioForUser(userId, req)
    }

    // const portfolioList = await assetManager.getPortfolioForUser(userId, req)
    const portfolioListToInvest = await _checkSupportedCoins(portfolio)
    const ratio = _returnCryptoRatio(portfolioListToInvest, amount)
    if (ratio.length === 0) return next(error('BAD_REQUEST', 'No supported coins allocated'))

    const wallet = await models.wallet.findByForUserAndCurrency(userId, currency, { raw: true })
    await assetManager.checkCustomerBuyAmountRules(req.user, amount, wallet, allowBankCharge, true)

    const trans = await models.sequelize.transaction()
    let investment, createdTransaction
    try {
      investment = await investmentManager.createInvestment({
        userId,
        amount,
        type: constants.INVESTMENTS.TYPE.BUY,
        ratio,
        single: false,
        bundleId
      }, trans, req)

      const { id, single } = investment.dataValues

      createdTransaction = await assetManager.chargeUserInvestment(req.user, foundBankAccount.dataValues, amount, currency, id, single, trans, req)
      await trans.commit()
    } catch (err) {
      await trans.rollback()
      logger.error(req, err, 'ERROR creating and charging portfolio investment')
      throw err
    }
    if (!req.postponedTrading) {
      await assetManager.buyCryptoCurrencies(investment, coinPrices, req)
      await investmentManager.updateInvestmentState(req, investment, false)
      const data = await _getTransactionData(req, createdTransaction.id)
      res.json({ success: true, data })
    } else {
      logger.info(req, 'Postponed portfolio investment for userId ' + userId + ' investmentId ' + investment.id)
      let responseSent = false
      // if we dont finish under 3 seconds we send accepted response
      setTimeout(() => {
        if (!responseSent) {
          responseSent = true
          res.statusCode = 202
          res.json({ success: true })
        }
      }, POSTPONED_WAIT_TIME)

      await assetManager.buyCryptoCurrencies(investment, coinPrices, req)

      if (POSTPONED_WAIT_TIME && !responseSent) {
        responseSent = true
        await investmentManager.updateInvestmentState(req, investment, false)
        const data = await _getTransactionData(req, createdTransaction.id)
        res.json({ success: true, data })
      } else {
        // if response is already sent only then we send push
        investmentManager.updateInvestmentState(req, investment, true)
      }
    }
  } catch (err) {
    if (err && err.code === 402) {
      logger.warn(req, 'ACH Rules not meet for portfolio investment', err)
      if (!responseSent) {
        res.statusCode = 402
        res.json({ error: err })
      }
    } else {
      logger.error(req, err, 'ERROR making portfolio investment')
      if (!responseSent) next(err)
    }
  }
}

module.exports.makeSingleInvestment = async (req, res, next) => {
  const userId = req.user.id
  const amount = util.round(req.body.amount, 2)
  const bankAccountId = req.body.bankAccountId
  const crypto = req.body.crypto
  const currency = req.body.currency || 'USD'
  let allowBankCharge = req.body.allowBankCharge
  if (allowBankCharge === undefined) allowBankCharge = true
  const coinPrices = req.body.prices

  const percent = 100
  let responseSent = false
  try {
    await _checkSupportedCoins([{ currency: crypto }])

    const foundBankAccount = await models.bankAccount.findById(bankAccountId)
    if (!foundBankAccount) return next(error('NOT_FOUND', 'Bank, please connect bank account to your profile'))
    // if bank account doesn't belong to user
    if (foundBankAccount.userId !== userId) return next(error('NOT_ALLOWED', 'This bank account belongs to different user!!!!!'))

    const wallet = await models.wallet.findByForUserAndCurrency(userId, currency, { raw: true })
    await assetManager.checkCustomerBuyAmountRules(req.user, amount, wallet, allowBankCharge, true)

    const ratio = _returnCryptoRatio([{ currency: crypto, percent }], amount)

    const trans = await models.sequelize.transaction()
    let investment, createdTransaction
    try {
      investment = await investmentManager.createInvestment({
        userId,
        amount,
        type: constants.INVESTMENTS.TYPE.BUY,
        ratio,
        single: true
      }, trans, req)

      const { id, single } = investment.dataValues

      createdTransaction = await assetManager.chargeUserInvestment(req.user, foundBankAccount.dataValues, amount, currency, id, single, trans, req)
      await trans.commit()
    } catch (err) {
      await trans.rollback()
      logger.error(req, err, 'ERROR creating and charging single investment')
      throw err
    }
    if (!req.postponedTrading) {
      await assetManager.buyCryptoCurrencies(investment, coinPrices, req)
      await investmentManager.updateInvestmentState(req, investment, false)
      const data = await _getTransactionData(req, createdTransaction.id)
      res.json({ success: true, data })
    } else {
      // if we dont finish under 3 seconds we send accepted response
      setTimeout(() => {
        if (!responseSent) {
          responseSent = true
          res.statusCode = 202
          res.json({ success: true })
        }
      }, POSTPONED_WAIT_TIME)

      await assetManager.buyCryptoCurrencies(investment, coinPrices, req)
      if (POSTPONED_WAIT_TIME && !responseSent) {
        responseSent = true
        await investmentManager.updateInvestmentState(req, investment, false)
        const data = await _getTransactionData(req, createdTransaction.id)
        res.json({ success: true, data })
      } else {
        // if response is already sent only then we send push
        investmentManager.updateInvestmentState(req, investment, true)
      }
    }
  } catch (err) {
    if (err && err.code === 402) {
      logger.warn(req, 'ACH Rules not meet for single investment', err)
      if (!responseSent) {
        res.statusCode = 402
        res.json({ error: err })
      }
    } else {
      logger.error(req, err, 'ERROR making single investment')
      if (!responseSent) next(err)
    }
  }
}

module.exports.sellCryptoCurrencies = async (req, res, next) => {
  const userId = req.user.id
  const ratio = req.body.ratio
  ratio.forEach(one => { one.value = Math.abs(one.amount) })
  const coinPrices = req.body.prices

  let responseSent = false
  try {
    const wallets = await models.wallet.findByForUser(userId, { raw: true })
    assetManager.checkUserSellAvailability(req, wallets, ratio)

    const investment = await investmentManager.createInvestment({
      userId,
      type: constants.INVESTMENTS.TYPE.SELL,
      amount: 0,
      ratio,
      single: ratio.length === 1
    }, null, req)

    if (!req.postponedTrading) {
      const createdTransaction = await assetManager.sellCryptoCurrencies(investment, coinPrices, req)
      await investmentManager.updateInvestmentState(req, investment, false)
      const data = await _getTransactionData(req, createdTransaction.id)
      res.json({ success: true, data })
    } else {
      logger.info(req, 'Postponed sell trade for userId ' + userId + ' investmentId ' + investment.id)

      // if we dont finish under 3 seconds we send accepted response
      setTimeout(() => {
        if (!responseSent) {
          responseSent = true
          res.statusCode = 202
          res.json({ success: true })
        }
      }, POSTPONED_WAIT_TIME)

      const createdTransaction = await assetManager.sellCryptoCurrencies(investment, coinPrices, req)
      if (POSTPONED_WAIT_TIME && !responseSent) {
        responseSent = true
        await investmentManager.updateInvestmentState(req, investment, false)
        const data = await _getTransactionData(req, createdTransaction.id)
        res.json({ success: true, data })
      } else {
        // if response is already sent only then we send push
        investmentManager.updateInvestmentState(req, investment, true)
      }
    }
  } catch (err) {
    logger.error(req, err, 'ERROR selling crypto currencies')
    if (!responseSent) next(err)
  }
}

// CRYPTO DATA

const _calculateChangeRate = (coin, prices) => {
  let change = 0
  if (prices.length > 0) {
    const first = prices[0].price
    const last = prices[prices.length - 1].price
    change = (1 - first / last) * 100
  }
  return { coin, change, prices }
}

const _getHistoryInDays = async (coin, currency, limit) => {
  const prices = await cryptoManager.getHistoryDays(coin, currency, limit)
  return _calculateChangeRate(coin, prices)
}

module.exports.checkTradePrices = async (req, res, next) => {
  const supportedCoins = await cryptoManager.getSupportedCoins()
  const coinSymbols = supportedCoins.map(data => data.currency)
  try {
    const prices = await cryptoManager.getCurrentTradePrices(coinSymbols)
    res.json({ prices })
  } catch (err) {
    logger.error(req, err, 'ERROR retriving current crypto trading prices')
    next(err)
  }
}

module.exports.getCryptoPrices = async (req, res, next) => {
  try {
    const prices = await cryptoManager.getPrices()
    res.json(prices)
  } catch (err) {
    logger.error(req, err, 'ERROR retriving crypto prices')
    next(err)
  }
}

module.exports.getHistoryMinutes = async (req, res, next) => {
  try {
    const { coin, currency, limit } = req.query
    if (!coin) return next(error('BAD_REQUEST', 'missing target coin query (?coin=BTC)'))
    const prices = await cryptoManager.getHistoryMinutes(coin, currency, limit)
    res.json(_calculateChangeRate(coin, prices))
  } catch (err) {
    logger.error(req, err, 'ERROR retrieving history in minutes')
    next(err)
  }
}

module.exports.getHistoryHours = async (req, res, next) => {
  try {
    const { coin, currency, limit } = req.query
    if (!coin) return next(error('BAD_REQUEST', 'missing target coin query (?coin=BTC)'))
    const prices = await cryptoManager.getHistoryHours(coin, currency, limit)
    res.json(_calculateChangeRate(coin, prices))
  } catch (err) {
    logger.error(req, err, 'ERROR retrieving history in days')
    next(err)
  }
}

module.exports.getHistoryDays = async (req, res, next) => {
  try {
    const { coin, currency, limit } = req.query
    if (!coin) return next(error('BAD_REQUEST', 'missing target coin query (?coin=BTC)'))
    const result = await _getHistoryInDays(coin, currency, limit)
    res.json(result)
  } catch (err) {
    logger.error(req, err, 'ERROR retrieving history in hours')
    next(err)
  }
}

module.exports.getHistoryChart = async (req, res, next) => {
  const { limit = 7, currency = 'USD' } = req.query
  try {
    // const { portfolio } = await models.settings.findOne({ attributes: ['portfolio'] })
    const setting = {
      'portfolio': [{"percent": "69.18", "currency": "BTC"}, {"percent": "17.05", "currency": "ETH"}, {"percent": "8.16", "currency": "LTC"}, {"percent": "2.21", "currency": "BCH"}, {"percent": "3.41", "currency": "ZEC"}],
      'coins': [{"icon": "Bitcoin.png", "name": "Bitcoin", "currency": "BTC", "description": "Bitcoin uses peer-to-peer technology to operate with no central authority or banks; managing transactions and the issuing of bitcoins is carried out collectively by the network."}, {"icon": "Ethereum.png", "name": "Ethereum", "currency": "ETH", "description": "Ethereum Classic is a blockchain-based distributed computing platform featuring smart contract functionality."}, {"icon": "Litecoin.png", "name": "Litecoin", "currency": "LTC", "description": "Litecoin is a cryptocurrency that enables instant payments to anyone in the world."}, {"icon": "Bitcoin_cash.png", "name": "Bitcoin Cash", "currency": "BCH", "description": "Bitcoin Cash is a peer-to-peer electronic cash system. It's a permissionless, decentralized cryptocurrency."}, {"icon": "Zcash.png", "name": "Zcash", "currency": "ZEC", "description": "Zcash is a peer-to-peer electronic cash system. It's a permissionless, decentralized cryptocurrency."}]
    }
    const coins = setting['portfolio'].map(({ currency }) => currency)

    const promises = coins.map(coin => _getHistoryInDays(coin, currency, limit))

    const coinsData = await Promise.all(promises)
    res.json(coinsData)
  } catch (err) {
    logger.error(req, err, 'ERROR retrieving history chart')
    next(err)
  }
}

module.exports.getUserTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { limit, offset } = req.query

    const options = {}
    if (limit) options.limit = Number(limit)
    if (offset) options.offset = Number(offset)

    const transactions = await models.transaction.findActivityByUserId(userId, options)

    const result = transactions.map(({ id, type, status, amount, currency, createdAt, singleInvestment }) => {
      return {
        id,
        type,
        status,
        amount: type === TYPE.INVESTMENT ? Math.abs(amount) : amount,
        currency,
        createdAt
      }
    })

    res.json(result)
  } catch (err) {
    logger.error(req, err, 'ERROR retrieving transactions')
    next(err)
  }
}

const _getTransactionDescription = async (transaction) => {
  if (transaction.type === 0 || transaction.type === 4) {
    const bankAccount = await models.bankAccount.findById(transaction.bankAccountId, { raw: true })
    return (transaction.type === 0 ? 'From ' : 'Deposited to ') + bankAccount.name + ' ending ' + bankAccount.mask
  } else {
    return ''
  }
}

module.exports.getUserTransactionData = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await _getTransactionData(req, id)
    res.json(result)
  } catch (err) {
    logger.error(req, err, 'ERROR retrieving transaction data')
    next(err)
  }
}

module.exports.buyCryptoCurrency = async (req, res, next) => {
  const amount = util.round(req.body.amount, 2)
  const crypto = req.body.crypto
  const type = 'buy'
  try {
    const data = await cryptoManager.tradeCryptoCurrency(amount, crypto, type)
    res.json({ success: true, data })
  } catch (err) {
    logger.error(req, err, " Error buy coin")
  }
}

module.exports.sellCryptoCurrency = async (req, res, next) => {
  const ratio = req.body.ratio
  const amount = ratio[0]['amount']
  const crypto = ratio[0]['currency']
  const type = 'sell'
  try {
    const data = await cryptoManager.tradeCryptoCurrency(amount, crypto, type)
    res.json({ success: true, data })
  } catch (err) {
    logger.error(req, err, " Error sell coin")
  }
}