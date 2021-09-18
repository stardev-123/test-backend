const moment = require('moment')
// const DB = require('../setup/databaseConnection')
const paymentManager = require('./payment')
const cryptoManager = require('./crypto')
// const models = require('../database/models')
const constants = require('../lib/constants')
const scripts = require('../scripts')
const error = require('../lib/error')
const logger = require('../lib/logger')
const config = require('../config')

// const analyticsManager = require('./analytics')

exports.checkUserSellAvailability = (req, wallets, assets) => {
  assets.forEach(asset => {
    const wallet = wallets.find(wallet => wallet.currency === asset.currency)
    if ((wallet.amount - wallet.pending) < asset.amount) {
      throw error('NEGATIVE_BALANCE_ERROR', asset.currency)
    }
  })
}

exports.checkUserSellAvailabilityForInvestment = (req, wallets, assets) => {
  assets.forEach(asset => {
    const wallet = wallets.find(wallet => wallet.currency === asset.currency)
    if ((wallet.amount - wallet.pending) < (asset.value - asset.settled)) {
      throw error('NEGATIVE_BALANCE_ERROR', asset.currency)
    }
  })
}

exports.initUserWallet = async (userId, currency, trans, req) => {
  const createdWallet = await models.wallet.createOne({
    currency: currency,
    userId: userId
  }, { transaction: trans })

  logger.info(req, 'Successfully created initial user wallet for user with id ' + userId + ', and currency' + currency)

  return createdWallet
}

exports.getBalanceValue = async (userId) => {
  const prices = await cryptoManager.getPrices()
  const coinPriceMap = {}
  prices.forEach(({ symbol, USD }) => { coinPriceMap[symbol] = USD })

  let result = 0

  const wallets = await models.wallet.findByForUser(userId, { raw: true, attributes: ['currency', 'amount'] })

  wallets.forEach(({ currency, amount }) => { result += amount * (coinPriceMap[currency] || 0) })

  return result
}

exports.getBalanceValueOnDate = async (userId, date) => {
  userId = "1060"
  if (!date) return 0
  const result = await models.sequelize.query(scripts.RETURN_USER_HOLDINGS_TOTAL_ON_DAY,
    { replacements: [date, userId], type: models.sequelize.QueryTypes.SELECT })
  return result && result[0] ? result[0].value : 0
}

exports.getBalanceValueOnHour = async (userId, time) => {
  const result = await models.sequelize.query(scripts.RETURN_USER_HOLDINGS_TOTAL_ON_HOUR,
    { replacements: [time, userId], type: models.sequelize.QueryTypes.SELECT })
  return result && result[0] ? result[0].value : 0
}

exports.getBalance = async (userId) => {
  // const prices = await cryptoManager.getBalances()
  const prices = await cryptoManager.getPrices()  
  const coinPriceMap = {}
  prices.forEach(({ symbol, USD }) => { coinPriceMap[symbol] = USD })

  // const wallets = await models.wallet.findByForUser(userId, { raw: true, attributes: ['currency', 'amount', 'pending'] })
  const wallets = await cryptoManager.getBalances()

  wallets.forEach(wallet => {
    if (wallet.currency === 'USD') wallet.value = wallet.amount
    else {
      wallet.price = coinPriceMap[wallet.currency] || 0
      wallet.value = wallet.amount * wallet.price
    }
  })
  return wallets
}

exports.getBalanceHistory = async (userId, days) => {
  const holdingHistory = await models.sequelize.query(scripts.RETURN_USER_HOLDINGS_HISTORY,
    { replacements: [days, userId], type: models.sequelize.QueryTypes.SELECT })

  return holdingHistory
}

exports.getBalanceHoursHistory = async (userId, limit) => {
  const time = moment().startOf('hour').subtract(limit, 'hours').unix()
  const holdingHistory = await models.sequelize.query(scripts.RETURN_USER_HOLDINGS_HOURLY_HISTORY,
    { replacements: [time, userId], type: models.sequelize.QueryTypes.SELECT })

  return holdingHistory
}

const _syncProviderDateWithOurs = async (createdTransaction, trans, req) => {
  if (createdTransaction.dataValues.providerTransactionId) {
    const providerTransactionData = await paymentManager.getTransactionById(createdTransaction.dataValues.providerTransactionId, { transaction: trans })
    try {
      if (providerTransactionData && providerTransactionData.created) {
        await models.transaction.updateOne(createdTransaction, { providerTransactionTime: providerTransactionData.created }, { transaction: trans })
        logger.debug(req, 'SUCCESSFULLY updated providerTransactionTime for transaction with Id ' + createdTransaction.providerTransactionId)
      } else {
        logger.warn(req, 'NOT FOUND PROVIDER TRANSACTION for transaction with Id ' + createdTransaction.providerTransactionId)
      }
    } catch (err) {
      logger.error(req, err, 'ERROR updating providerTransactionTime for transaction with Id ' + createdTransaction.providerTransactionId)
    }
  }
}

const _getWeekInvestments = async (userId) => {
  const transactions = await models.transaction.findByUserIdBankChargesForCurrentWeek(userId, { raw: true })
  return transactions.reduce((result, transaction) => result + transaction.amount, 0)
}

const _checkUserPayOutRules = (amount, balance, unsettled) => {
  if (amount > 0) {
    let available = balance - unsettled
    if (available < 0) available = 0
    if (balance === 0) {
      throw (error('CASH_BALANCE_IS_EMPTY'))
    } else if (amount > available) {
      if (unsettled === 0) {
        throw (error('NOT_ENOUGH_FUNDS', available))
      } else {
        throw (error('NOT_ENOUGH_SETTLED_FUNDS', { available, unsettled }))
      }
    }
  }
}

const _checkVerifiedUserBuyRules = async (user, amount, balance, unsettled, investment) => {
  const chargeAmount = amount - balance
  if (chargeAmount > 0) {
    let limit = config.dwolla.MAX_VERIFIED_AMOUNT - unsettled + balance
    if (limit < 0) limit = 0

    if (chargeAmount > config.dwolla.MAX_VERIFIED_AMOUNT) {
      if (investment) {
        throw (error('MAX_VERIFIED_LIMIT_REACHED', limit))
      } else {
        throw (error('MAX_VERIFIED_LIMIT_REACHED_ADD_FUNDS', limit))
      }
    }
    if (chargeAmount + unsettled > config.dwolla.MAX_VERIFIED_AMOUNT) {
      if (investment) {
        throw (error('MAX_VERIFIED_LIMIT_REACHED_UNSETTLED', limit))
      } else {
        throw (error('MAX_VERIFIED_LIMIT_REACHED_UNSETTLED_ADD_FUNDS', limit))
      }
    }
  }
}

const _checkUnverifiedUserBuyRules = async (user, amount, balance, unsettled, allowBankCharge, investment) => {
  const chargeAmount = amount - balance
  if (chargeAmount > 0) {
    const weekInvestment = await _getWeekInvestments(user.id)

    let limit = config.dwolla.MAX_UNVERIFIED_AMOUNT - weekInvestment + balance
    if (limit < 0) limit = 0

    if (weekInvestment >= config.dwolla.MAX_UNVERIFIED_AMOUNT || limit === 0) {
      throw (error('MAX_UNVERIFIED_LIMIT_REACHED'))
    }

    if (chargeAmount > config.dwolla.MAX_UNVERIFIED_AMOUNT) {
      throw (error('MAX_UNVERIFIED_WEEK_LIMIT_REACHED', limit))
    }

    if (weekInvestment + chargeAmount > config.dwolla.MAX_UNVERIFIED_AMOUNT) {
      throw (error('MAX_UNVERIFIED_WEEK_LIMIT_REACHED', limit))
    }
    if (!allowBankCharge) {
      if (investment && balance) throw (error('ADDITIONAL_BANK_CHARGE_NEEDED', { have: balance, needed: chargeAmount }))
      throw (error('CONFIRM_BANK_CHARGE', chargeAmount))
    }
  }
}

const _createTransaction = async (data, userId, trans, req) => {
  const wallet = await models.wallet.findByForUserAndCurrency(userId, data.currency, { transaction: trans })
  if (wallet.amount + data.amount < 0) throw (error('NEGATIVE_BALANCE_ERROR', data.currency))

  let t
  if (!trans) {
    t = await DB.transaction()
  } else {
    t = trans
  }
  try {
    const createdTransaction = await models.transaction.createOne({
      amount: data.amount,
      currency: data.currency,
      type: data.type,
      providerTransactionId: data.transactionId,
      status: data.status,
      fromBankAccountId: data.fundingSourceId,
      userId: userId,
      bankAccountId: data.bankAccountId,
      investmentId: data.investmentId,
      singleInvestment: data.singleInvestment
    }, { transaction: t })

    if (constants.TRANSACTIONS.ACH_TYPES.indexOf(data.type) > -1 && data.status === constants.TRANSACTIONS.STATUS.PENDING) {
      // if we wait amount to be settled we are adding it to pending amount
      await models.wallet.updatePendingAmount(wallet, data.amount, { transaction: t })
      await models.wallet.updateAmount(wallet, data.amount, { transaction: t })
    } else {
      await models.wallet.updateAmount(wallet, data.amount, { transaction: t })
    }
    if (!trans) await t.commit()

    logger.info(req, 'Successfully created transaction and updated wallet for user ' + userId + ', currency ' + data.currency + ', amount ' + data.amount)
    return createdTransaction
  } catch (err) {
    logger.error(req, err, 'ERROR creating transaction and wallet update', {
      data,
      userId,
      currency: data.currency,
      amount: data.amount
    })
    if (!trans) await t.rollback()
    throw err
  }
}

const _chargeUserBank = async (userId, bankAccount, amount, currency, investmentId, single, trans, req) => {
  try {
    logger.info(req, 'Initiating transfer for userId ' + userId + ', fundingSourceId ' + bankAccount.fundingSourceId + ' amount ' + amount + ' currency ' + currency)
    const { transactionId } = await paymentManager.chargeUser(bankAccount.fundingSourceId, amount, currency)
    logger.info(req, 'Successfully created transfer for fundingSourceId ' + bankAccount.fundingSourceId + ' amount ' + amount + ' currency ' + currency, { userId, transactionId })
    // create transaction
    const data = {
      amount: amount,
      currency: currency,
      type: constants.TRANSACTIONS.TYPE.ADD_FUNDS,
      transactionId: transactionId,
      status: constants.TRANSACTIONS.STATUS.PENDING,
      userId: userId,
      bankAccountId: bankAccount.id,
      investmentId,
      singleInvestment: single
    }
    const createdTransaction = await _createTransaction(data, userId, trans, req)
    logger.debug(req, 'Successfully added ' + amount + ' ' + currency + ' to user wallet from bank account')
    await _syncProviderDateWithOurs(createdTransaction, trans, req)
    return transactionId
  } catch (err) {
    logger.error(req, err, 'Error making transaction for ', { userId, fundingSourceId: bankAccount.fundingSourceId, amount, currency })
    throw err
  }
}

const _chargeUserBankAccount = async (user, bankAccount, amount, currency, investmentId, single, trans, req) => {
  const userId = user.id
  const accessToken = bankAccount.accessToken

  try {
    const bankInfo = await paymentManager.getBalance(req, accessToken, bankAccount.accountId)
    if (bankInfo.balances.available < amount) {
      throw (error('NOT_ENOUGH_MONEY', bankAccount))
    } else {
      try {
        const transactionId = await _chargeUserBank(userId, bankAccount, amount, currency, investmentId, single, trans, req)
        return transactionId
      } catch (err) {
        logger.error(req, err, 'ERROR charging user for amount', { userId, bankAccountId: bankAccount.id, amount })
        throw (err)
      }
    }
  } catch (err) {
    logger.error(req, err, 'ERROR charging bank', { userId, bankAccount })
    throw (err)
  }
}

const _createCryptoTransaction = async (cryptoData, userId, single, trans, req) => {
  if (cryptoData.volume === 0) return 0
  const data = {
    amount: cryptoData.volume,
    currency: cryptoData.currency,
    transactionId: cryptoData.transactionId,
    type: cryptoData.volume > 0 ? constants.TRANSACTIONS.TYPE.BUY_CRYPTO : constants.TRANSACTIONS.TYPE.SELL_CRYPTO,
    status: constants.TRANSACTIONS.STATUS.PROCESSED,
    investmentId: cryptoData.investmentId,
    singleInvestment: single
  }

  await _createTransaction(data, userId, trans, req)

  return cryptoData.volume
}

const _returnInstitution = async (accessToken, userId, institutionData) => {
  let institution = await models.institution.findByUserIdAndCode(userId, institutionData.institution_id)
  if (institution) {
    await models.institution.updateOne(institution, { accessToken })
  } else {
    institution = await models.institution.createOne({
      name: institutionData.name,
      code: institutionData.institution_id,
      accessToken,
      userId
    })
  }
  return institution.dataValues
}

exports.getWeekInvestments = _getWeekInvestments
exports.chargeUserBank = _chargeUserBank
exports.chargeUserBankAccount = _chargeUserBankAccount

exports.payOutToUserBank = async (userId, bankAccount, amount, currency, req) => {
  logger.info(req, 'Initiating transfer for fundingSourceId ' + bankAccount.fundingSourceId + ' amount ' + amount + ' currency ' + currency)
  const wallet = await models.wallet.findByForUserAndCurrency(userId, currency, { raw: true })

  _checkUserPayOutRules(amount, wallet.amount, wallet.pending)

  const { transactionId } = await paymentManager.payOutToUser(bankAccount.fundingSourceId, amount, currency)
  logger.info(req, 'Successfully created transfer for fundingSourceId ' + bankAccount.fundingSourceId + ' amount ' + amount + ' currency ' + currency, { transactionId })
  // create transaction
  const data = {
    amount: -amount,
    currency: currency,
    type: constants.TRANSACTIONS.TYPE.PAY_OUT,
    transactionId: transactionId,
    status: constants.TRANSACTIONS.STATUS.PENDING,
    userId: userId,
    bankAccountId: bankAccount.id
  }
  const createdTransaction = await _createTransaction(data, userId, null, req)
  logger.debug(req, 'Successfully added ' + amount + ' ' + currency + ' to user wallet from bank account')
  return createdTransaction
}

exports.checkCustomerBuyAmountRules = async (user, amount, wallet, allowBankCharge, investment) => {
  if (!user.state) throw error('BAD_REQUEST', 'User is missing state')
  if (config.allowedStates && config.allowedStates.indexOf(user.state) === -1) throw error('STATE_NOT_SUPPORTED')
  if (user.verifiedAtProvider) {
    await _checkVerifiedUserBuyRules(user, amount, wallet.amount, wallet.pending, investment)
  } else {
    await _checkUnverifiedUserBuyRules(user, amount, wallet.amount, wallet.pending, allowBankCharge, investment)
  }
}

exports.verifyBankAccount = async (user, providerResponse, req) => {
  const userId = user.id

  const accessToken = await paymentManager.getAccessTokenFromPublic(providerResponse.public_token)

  const institution = await _returnInstitution(accessToken, userId, providerResponse.institution)

  const data = await paymentManager.bindBankAccountToDwolla(accessToken, providerResponse, user.customerId)

  let bankAccount = await models.bankAccount.findByFundingSourceId(data.fundingSourceId)
  if (!data.createNew && bankAccount) {
    if (bankAccount.dataValues.userId !== userId) throw (error('NOT_ALLOWED', 'Found bank account which belongs to different user!!!!!'))

    await models.bankAccount.updateOne(bankAccount, {
      accountId: data.accountId,
      institutionId: institution.id,
      accessToken,
      active: true
    })

    logger.info(req, 'Successfully updated bank account with id ' + bankAccount.dataValues.id)
  } else {
    const primaryAccount = await models.bankAccount.findPrimaryForUserId(userId)

    // account doesn't exist
    const bankData = {
      userId,
      name: data.accountName,
      type: data.accountType,
      subtype: data.accountSubType,
      mask: data.accountMask,
      fundingSourceId: data.fundingSourceId,
      accountId: data.accountId,
      institutionId: institution.id,
      accessToken,
      primary: !primaryAccount
    }
    bankAccount = await models.bankAccount.createOne(bankData)
    logger.info(req, 'Successfully created a bank account for user with id ' + userId)
  }
  return bankAccount.dataValues
}

const _setPrimaryBank = async (req, bankAccountId, userId) => {
  const transaction = await models.sequelize.transaction()
  try {
    const bankAccount = await models.bankAccount.findById(bankAccountId, { transaction })
    if (!bankAccount) throw error('NOT_FOUND')
    if (bankAccount.userId !== userId) throw error('NOT_ALLOWED', 'This bank account belongs to different user!!!!!')
    const currentBankAccount = await models.bankAccount.findPrimaryForUserId(userId, { transaction })
    if (currentBankAccount && currentBankAccount.id !== bankAccount.id) {
      logger.info(req, 'Switching primary bank account', { primary: bankAccount.dataValues.id, newPrimary: currentBankAccount.id, userId })
      await models.bankAccount.updateOne(currentBankAccount, { primary: false }, { transaction })
      const recurring = await models.recurring.findActiveForUserIdAndBankAccountId(userId, currentBankAccount.id, { transaction })
      if (recurring) {
        await models.recurring.updateOne(recurring, { bankAccountId }, { transaction })
      }
      const sparechange = await models.sparechange.findForUserIdActive(userId, { transaction })
      if (sparechange) {
        await models.sparechange.updateOne(sparechange, { bankAccountId, accounts: [], ongoing: 0 }, { transaction })
      }
    }
    await models.bankAccount.updateOne(bankAccount, { primary: true }, { transaction })
    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    logger.error(req, err, 'Failed to change primary bank account to ' + bankAccountId + ' for user ' + req.user.id)
    throw err
  }
}

const _getWalletsForUser = async (userId, req) => {
  try {
    const wallets = await models.wallet.findByForUser(userId)
    return wallets
  } catch (err) {
    logger.error(req, err, 'Error fetching user wallets', { userId })
    throw err
  }
}

exports.setPrimaryBank = _setPrimaryBank
exports.getWalletsForUser = _getWalletsForUser
exports.getPortfolioForUser = async (userId, req) => {
  try {
    // const setting = await models.settings.findOne({ attributes: ['portfolio', 'coins'], raw: true })
    const setting = {
      'portfolio': [{"percent": "69.18", "currency": "BTC"}, {"percent": "17.05", "currency": "ETH"}, {"percent": "8.16", "currency": "LTC"}, {"percent": "2.21", "currency": "BCH"}, {"percent": "3.41", "currency": "ZEC"}],
      'coins': [{"icon": "Bitcoin.png", "name": "Bitcoin", "currency": "BTC", "description": "Bitcoin uses peer-to-peer technology to operate with no central authority or banks; managing transactions and the issuing of bitcoins is carried out collectively by the network."}, {"icon": "Ethereum.png", "name": "Ethereum", "currency": "ETH", "description": "Ethereum Classic is a blockchain-based distributed computing platform featuring smart contract functionality."}, {"icon": "Litecoin.png", "name": "Litecoin", "currency": "LTC", "description": "Litecoin is a cryptocurrency that enables instant payments to anyone in the world."}, {"icon": "Bitcoin_cash.png", "name": "Bitcoin Cash", "currency": "BCH", "description": "Bitcoin Cash is a peer-to-peer electronic cash system. It's a permissionless, decentralized cryptocurrency."}, {"icon": "Zcash.png", "name": "Zcash", "currency": "ZEC", "description": "Zcash is a peer-to-peer electronic cash system. It's a permissionless, decentralized cryptocurrency."}]
    }
    const portfolio = setting.portfolio.sort((one, second) => second.percent - one.percent)
    const extendedDataPortfolio = []
    portfolio.forEach(({ currency, percent }) => {
      const coinData = setting.coins.find(coin => currency === coin.currency)
      if (coinData) {
        coinData.percent = percent
        extendedDataPortfolio.push(coinData)
      }
    })
    return extendedDataPortfolio
  } catch (err) {
    logger.error(req, err, 'Error fetching user Portfolio', { userId })
  }
}

exports.chargeUserInvestment = async (user, bankAccount, amount, currency, investmentId, single, trans, req) => {
  const wallet = await models.wallet.findByForUserAndCurrency(user.id, currency)

  let availableInWallet = wallet.amount
  if (availableInWallet < 0) availableInWallet = 0
  if (availableInWallet < amount) {
    await _chargeUserBankAccount(user, bankAccount, amount - availableInWallet, currency, investmentId, single, trans, req)
  }
  // create transaction
  const data = {
    amount: -amount,
    currency: currency,
    type: constants.TRANSACTIONS.TYPE.INVESTMENT,
    status: constants.TRANSACTIONS.STATUS.PROCESSED,
    userId: user.id,
    investmentId,
    singleInvestment: single
  }

  const createdTransaction = await _createTransaction(data, user.id, trans, req)
  logger.debug(req, 'Successfully removed ' + amount + ' ' + currency + ' from user ' + user.id + ' wallet')
  return createdTransaction
}

exports.buyCryptoCurrencies = async (investment, coinPrices, req) => {
  const { userId, single } = investment.dataValues

  const trans = await DB.transaction()
  try {
    const result = await cryptoManager.buyCurrencies(investment.dataValues, coinPrices, req)
    if (result) {
      const promises = result.map((cryptoData) => {
        if (cryptoData) return _createCryptoTransaction(cryptoData, userId, single, trans, req)
      })
      await Promise.all(promises)
    }

    await trans.commit()
    // investmentManager.updateInvestmentState(req, investment)
  } catch (err) {
    logger.error(req, err, 'ERROR buying crypto currencies for data', investment)
    await trans.rollback()
    throw err
  }
}

exports.sellCryptoCurrencies = async (investment, coinPrices, req) => {
  const { userId, id, single } = investment.dataValues
  const trans = await DB.transaction()
  try {
    const result = await cryptoManager.sellCurrencies(investment.dataValues, coinPrices, req)
    const promises = result.map((cryptoData) => {
      if (cryptoData) return _createCryptoTransaction(cryptoData, userId, single, trans, req)
      else return null
    })

    await Promise.all(promises)
    const totalAmount = result.reduce((a, b) => { if (b) { return a + b.value } else return a }, 0)

    const data = {
      amount: totalAmount,
      currency: 'USD',
      type: constants.TRANSACTIONS.TYPE.SELL_INCOME,
      status: constants.TRANSACTIONS.STATUS.PROCESSED,
      userId: userId,
      investmentId: id,
      singleInvestment: single
    }
    const createdTransaction = await _createTransaction(data, userId, trans, req)
    await trans.commit()
    return createdTransaction
  } catch (err) {
    console.log(err)
    logger.error(req, err, 'ERROR selling crypto currencies for data', investment)
    await trans.rollback()
    throw err
  }
}

exports.fundsReceived = async (transaction, trans, req) => {
  const { userId, amount, currency } = transaction.dataValues
  const wallet = await models.wallet.findByForUserAndCurrency(userId, currency, { transaction: trans })
  let forUpdate = amount
  if (wallet.pending - amount < 0) {
    forUpdate = wallet.pending
  }
  if (amount > 0) {
    await models.wallet.updatePendingAmount(wallet, -forUpdate, { transaction: trans })
  }
}
