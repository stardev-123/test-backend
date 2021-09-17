const error = require('../lib/error')
const logger = require('../lib/logger')
const notificationManager = require('../managers/notificationManager')
const models = require('../database/models')
const moment = require('moment')

// RECURRING
module.exports.createRecurringPayment = async (req, res, next) => {
  const userId = req.user.id
  const { bankAccountId, amount, currency = 'USD' } = req.body
  try {
    let primaryBank
    if (bankAccountId) {
      primaryBank = await models.bankAccount.findById(bankAccountId, { raw: true })
    } else {
      primaryBank = await models.bankAccount.findPrimaryForUserId(userId, { raw: true })
    }
    if (!primaryBank || !primaryBank.primary) return next(error('NOT_FOUND', 'primary bank'))
    if (primaryBank.userId !== userId) return next(error('NOT_ALLOWED', 'This bank account belongs to different user!!!!!'))
    const existing = await models.recurring.findActiveForUserIdAndBankAccountId(userId, bankAccountId)
    if (existing) {
      await models.recurring.updateOne(existing, { amount })
      logger.info(req, 'Updated recurring', { userId, bankAccountId, amount })
      const result = existing.dataValues
      result.amount = amount
      res.json(result)
      notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.EDIT_RECURRING, amount)
    } else {
      const day = moment().date()
      const recurring = await models.recurring.createOne({ userId, bankAccountId, amount, currency, day })
      res.json(recurring)
      logger.info(req, 'Created recurring', { userId, bankAccountId, amount })
      notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.SIGNUP_RECURRING, amount)
    }
  } catch (err) {
    logger.error(req, err, 'ERROR creating recurring')
    next(err)
  }
}

module.exports.getRecurringPayments = async (req, res, next) => {
  const userId = req.user.id
  const { active } = req.query
  try {
    let recurrings
    if (active !== undefined) {
      recurrings = await models.recurring.findActiveUserId(active === 'true', userId)
    } else {
      recurrings = await models.recurring.findForUserId(userId)
    }

    res.json(recurrings)
  } catch (err) {
    logger.error(req, err, 'ERROR finding recurring')
    next(err)
  }
}

module.exports.stopRecurringPayments = async (req, res, next) => {
  const userId = req.user.id
  const { recurringId } = req.params
  try {
    const recurring = await models.recurring.findById(recurringId)
    if (!recurring) return next(error('NOT_FOUND'))
    if (recurring.dataValues.userId !== userId) return next(error('NOT_ALLOWED'))
    await models.recurring.deactivate(recurring)
    notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.CANCEL_RECURRING)
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR deactivating recurring')
    next(err)
  }
}

// SPARECHANGE
const _checkAccountsData = (accounts) => {
  const one = accounts.find(
    account => !account.code || !account.institution || !account.mask || !account.account_id || !account.name)

  if (one) throw error('BAD_REQUEST', 'accounts need to have institution, code, mask, name and account_id tags')
}

module.exports.createUpdateSparechange = async (req, res, next) => {
  const userId = req.user.id
  const { currency = 'USD', accounts, bankAccountId } = req.body
  const active = accounts && accounts.length > 0
  try {
    let primaryBank
    if (bankAccountId) {
      primaryBank = await models.bankAccount.findById(bankAccountId, { raw: true })
    } else {
      primaryBank = await models.bankAccount.findPrimaryForUserId(userId, { raw: true })
    }
    if (!primaryBank || !primaryBank.primary) return next(error('NOT_FOUND', 'primary bank'))
    if (primaryBank.userId !== userId) return next(error('NOT_ALLOWED', 'This bank account belongs to different user!!!!!'))
    _checkAccountsData(accounts)
    const existing = await models.sparechange.findForUserId(userId)

    if (!existing) {
      const sparechange = await models.sparechange.createOne({ active, userId, accounts, currency, bankAccountId })
      res.json(sparechange)
      logger.info(req, 'Created sparechange', { userId, accounts, currency })
    } else {
      if (existing.active && !active) {
        notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.CANCEL_SPARECHANGE)
      }
      await models.sparechange.updateOne(existing, { active, accounts, bankAccountId })
      existing.dataValues.active = active
      existing.dataValues.accounts = accounts
      existing.dataValues.bankAccountId = bankAccountId
      logger.info(req, 'Updated sparechange', { userId, accounts, currency })
      res.json(existing)
    }

    if (!existing || (!existing.dataValues.active && active)) {
      notificationManager.processEventForNotification(req, req.user, notificationManager.EVENTS.SIGNUP_SPARECHANGE, accounts)
    }
  } catch (err) {
    logger.error(req, err, 'ERROR creating sparechange')
    next(err)
  }
}

module.exports.getSparechanges = async (req, res, next) => {
  const userId = req.user.id
  try {
    let ongoingTransactions = []
    const investedTransaction = []
    const sparechange = await models.sparechange.findForUserId(userId, { raw: true })
    if (sparechange) {
      ongoingTransactions = await models.userCardTransaction.findOngoing(userId, sparechange.lastChargeDate)
      const invested = await models.userCardTransaction.findInvested(userId, sparechange.lastChargeDate)

      let lastMonth = ''
      let current = {}
      invested.forEach(transaction => {
        const date = moment(transaction.date)
        const currentMonth = date.format('MMMM')
        if (lastMonth !== currentMonth) {
          lastMonth = currentMonth
          current = { date: date.startOf('month').format('YYYY-MM-DD'), transactions: [] }
          investedTransaction.push(current)
        }
        current.transactions.push(transaction)
      })
    }

    res.json({ sparechange, ongoingTransactions, investedTransaction })
  } catch (err) {
    logger.error(req, err, 'ERROR finding sparechanges')
    next(err)
  }
}

module.exports.addAccountToSpearchange = async (req, res, next) => {
  const userId = req.user.id
  const sparechangeId = req.params.id
  const account = req.body
  try {
    _checkAccountsData([account])

    const sparechange = await models.sparechange.findById(sparechangeId)
    if (!sparechange) return next(error('NOT_FOUND'), 'sprechange')
    if (sparechange.dataValues.userId !== userId) return next(error('NOT_ALLOWED'))

    const accounts = sparechange.dataValues.accounts
    const existing = accounts.find(temp => temp.account_id === account.account_id)
    if (!existing) {
      accounts.push(account)
      const active = true
      await models.sparechange.updateOne(sparechange, { accounts, active })
      sparechange.dataValues.accounts = accounts
    }
    res.json(sparechange)
  } catch (err) {
    logger.error(req, err, 'ERROR adding account to sparechange accounts')
    next(err)
  }
}

module.exports.removeAccountFromSparechange = async (req, res, next) => {
  const userId = req.user.id
  const sparechangeId = req.params.id
  const accountId = req.params.accountId
  try {
    const sparechange = await models.sparechange.findById(sparechangeId)
    if (!sparechange) return next(error('NOT_FOUND'), 'sprechange')
    if (sparechange.dataValues.userId !== userId) return next(error('NOT_ALLOWED'))

    const accounts = sparechange.dataValues.accounts
    let targetIndex = -1
    accounts.find((temp, index) => {
      if (temp.account_id === accountId) {
        targetIndex = index
        return true
      }
      return false
    })
    if (targetIndex > -1) {
      accounts.splice(targetIndex, 1)
      const active = accounts && accounts.length > 0
      await models.sparechange.updateOne(sparechange, { accounts, active })
      sparechange.dataValues.accounts = accounts
    } else {
      return next(error('NOT_FOUND'), 'account')
    }
    res.json(sparechange)
  } catch (err) {
    logger.error(req, err, 'ERROR removing account to sparechange accounts')
    next(err)
  }
}

module.exports.testDailySparechange = async (req, res, next) => {
  const sparechange = require('../cron/tasks/boost/sparechange')
  const { start, end } = req.query
  sparechange.dailyPull(start, end)
  res.send('stared daily pull')
}

module.exports.testMonthlySparechange = async (req, res, next) => {
  const sparechange = require('../cron/tasks/boost/sparechange')
  sparechange.monthlyCharge()
  res.send('stared monthly charge')
}
