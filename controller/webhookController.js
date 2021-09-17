const moment = require('moment')
const assetManager = require('../managers/assetManager')
const notificationManager = require('../managers/notificationManager')
const constants = require('../lib/constants')
const models = require('../database/models')
const logger = require('../lib/logger')
const util = require('../lib/util')

const ACH_TRANSFER_TYPE = 'ACH Transfer'

const _processTransactionCompleted = async (providerTransactionId, req) => {
  try {
    await models.webhook.updateStatus(providerTransactionId, constants.WEBHOOK.STATUSES.PROCESSED)
    const transaction = await models.transaction.findByProviderTransactionId(providerTransactionId)
    if (transaction) {
      transaction.update({ status: constants.TRANSACTIONS.STATUS.PROCESSED })

      if (constants.TRANSACTIONS.ACH_TYPES.indexOf(transaction.dataValues.type) > -1) {
        // if transaction is from types which increase pending amount
        await assetManager.fundsReceived(transaction, null, req)
      }
    }

    // const investment = await models.investment.findForProviderTransactionId(providerTransactionId)
    // if (investment) {
    //   const {id, status} = investment.dataValues;
    //   if (status === constants.INVESTMENTS.STATUS.INITIALIZED) {
    //     await models.investment.updateStatus(id, constants.INVESTMENTS.STATUS.PENDING)
    //   }
    //
    // }
  } catch (err) {
    logger.error(req, err, 'Error processing transaction completed webhook', { providerTransactionId })
    await models.webhook.updateStatus(providerTransactionId, constants.WEBHOOK.STATUSES.FAILED)
  }
}

const _processVerifiedCustomer = async (req, customerId) => {
  try {
    const user = await models.user.findByCustomerId(customerId)
    if (user) {
      await models.user.updateOne(user, { verifiedAtProvider: true })
      logger.debug(req, 'Successfully processed verified customer webhook', { customerId, userId: user.id })
    } else {
      logger.warn(req, 'Not found customer for verification webhook', { customerId })
    }
  } catch (err) {
    logger.error(req, err, 'Error processing verified customer webhook', { customerId })
  }
}

const _getCustomerEvent = (topic) => {
  if (topic === 'customer_created') {
    return notificationManager.EVENTS.CUSTOMER_CREATED
  } else if (topic === 'customer_suspended') {
    return notificationManager.EVENTS.CUSTOMER_SUSPENDED
  } else if (topic === 'customer_verified') {
    return notificationManager.EVENTS.CUSTOMER_FUNDING_SOURCE_REMOVED
  } else if (topic === 'customer_verification_document_needed') {
    return notificationManager.EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_NEEDED
  } else if (topic === 'customer_verification_document_uploaded') {
    return notificationManager.EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_UPLOADED
  } else if (topic === 'customer_verification_document_failed') {
    return notificationManager.EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_FAILED
  } else if (topic === 'customer_verification_document_approved') {
    return notificationManager.EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_APPROVED
  }
}

const _getFundingSourceEvent = (topic) => {
  if (topic === 'customer_funding_source_added') {
    return notificationManager.EVENTS.CUSTOMER_FUNDING_SOURCE_ADDED
  } else if (topic === 'customer_funding_source_verified') {
    return notificationManager.EVENTS.CUSTOMER_FUNDING_SOURCE_VERIFIED
  } else if (topic === 'customer_funding_source_removed') {
    return notificationManager.EVENTS.CUSTOMER_FUNDING_SOURCE_REMOVED
  }
}

const _sendFundingSourceEvent = async (req, topic, resourceId) => {
  const event = _getFundingSourceEvent(topic)
  if (!event) return
  logger.info(null, `${req.api_id} ${topic}; body: ${JSON.stringify(req.body)}`)
  const bankAccount = await models.bankAccount.findByFundingSourceId(resourceId, { raw: true })
  if (bankAccount != null) {
    const user = await models.user.findById(bankAccount.userId, { raw: true })
    if (user) {
      req.user = user
      const names = bankAccount.name.split(' - ')
      notificationManager.processEventForNotification(req, user, event, { bankAccount: names[0], source: names[1], date: moment().format(constants.DATE_FORMAT) })
    }
  }
}

const _getInvestmentTransactionEvent = (topic) => {
  if (topic === 'customer_transfer_failed') {
    return notificationManager.EVENTS.CUSTOMER_INVESTMENT_FAILED
  } else if (topic === 'customer_transfer_created') {
    return notificationManager.EVENTS.CUSTOMER_INVESTMENT_CREATED
  } else if (topic === 'customer_transfer_completed') {
    return notificationManager.EVENTS.CUSTOMER_INVESTMENT_COMPLETED
  } else if (topic === 'customer_transfer_cancelled') {
    return notificationManager.EVENTS.CUSTOMER_INVESTMENT_CANCELLED
  }
}

const _getWithdrawTransactionEvent = (topic) => {
  if (topic === 'customer_transfer_failed') {
    return notificationManager.EVENTS.CUSTOMER_WITHDRAW_FAILED
  } else if (topic === 'customer_transfer_created') {
    return notificationManager.EVENTS.CUSTOMER_WITHDRAW_CREATED
  } else if (topic === 'customer_transfer_completed') {
    return notificationManager.EVENTS.CUSTOMER_WITHDRAW_COMPLETED
  } else if (topic === 'customer_transfer_cancelled') {
    return notificationManager.EVENTS.CUSTOMER_WITHDRAW_CANCELLED
  }
}

const _sendTrasactionEvent = async (req, topic, resourceId) => {
  logger.info(null, `${req.api_id} ${topic}; body: ${JSON.stringify(req.body)}`)
  const transaction = await models.transaction.findByProviderTransactionId(resourceId, { raw: true })
  if (!transaction) return
  let event, transferType
  if (transaction.type === constants.TRANSACTIONS.TYPE.ADD_FUNDS) {
    event = _getInvestmentTransactionEvent(topic)
    transferType = ACH_TRANSFER_TYPE
  } else if (transaction.type === constants.TRANSACTIONS.TYPE.PAY_OUT) {
    event = _getWithdrawTransactionEvent(topic)
    transferType = ACH_TRANSFER_TYPE
  }
  if (!event) return
  const bankAccount = await models.bankAccount.findById(transaction.bankAccountId, { raw: true })
  if (bankAccount != null) {
    const user = await models.user.findById(transaction.userId, { raw: true })
    if (user) {
      req.user = user
      const source = bankAccount.name
      const date = moment().format(constants.DATE_FORMAT)
      const amount = Math.abs(util.format(transaction.amount, 2))
      notificationManager.processEventForNotification(req, user, event, { transferType, source, amount, date })
    }
  }
}

const _sendCustomerEvent = async (req, topic, resourceId) => {
  logger.info(null, `${req.api_id} ${topic}; body: ${JSON.stringify(req.body)}`)
  const event = _getCustomerEvent(topic)
  if (!event) return
  const user = await models.user.findByCustomerId(resourceId, { raw: true })
  if (!user) return logger.warn(req, 'Uset not found for webhook event' + topic, resourceId)
  req.user = user
  notificationManager.processEventForNotification(req, user, event)
}

const _checkNotifEvents = async (req, topic, resourceId) => {
  if (topic === 'customer_created' ||
    topic === 'customer_suspended' ||
    topic === 'customer_verified' ||
    topic === 'customer_verification_document_needed' ||
    topic === 'customer_verification_document_uploaded' ||
    topic === 'customer_verification_document_failed' ||
    topic === 'customer_verification_document_approved') {
    _sendCustomerEvent(req, topic, resourceId)
  } else if (topic === 'customer_funding_source_added' ||
    topic === 'customer_funding_source_verified' ||
    topic === 'customer_funding_source_removed') {
    _sendFundingSourceEvent(req, topic, resourceId)
  } else if (topic === 'customer_transfer_failed' ||
    topic === 'customer_transfer_created' ||
    topic === 'customer_transfer_completed' ||
    topic === 'customer_transfer_cancelled') {
    _sendTrasactionEvent(req, topic, resourceId)
  }
}

const _processWebHook = async (req, topic, resourceId) => {
  if (topic === 'customer_transfer_completed') {
    logger.info(null, `${req.api_id} ${topic}; body: ${JSON.stringify(req.body)}`)
    try {
      await models.webhook.createOne(resourceId)
      _processTransactionCompleted(resourceId, req)
    } catch (err) {
      if (err.name !== 'SequelizeUniqueConstraintError') {
        logger.error(req, err, 'CRITICAL Webhook creation error', { data: req.body })
        notificationManager.notifyAdminForEvent(req, constants.CRITICAL_EVENTS.TRANSFER_WEBHOOK_FAILED, req.body)
      }
    }
  } else if (topic === 'customer_transfer_failed') {
    logger.info(null, `${req.api_id} ${topic}; body: ${JSON.stringify(req.body)}`)
    notificationManager.notifyAdminForEvent(req, constants.CRITICAL_EVENTS.TRANSFER_FAILED, req.body)
  } else if (topic === 'customer_transfer_cancelled') {
    logger.info(null, `${req.api_id} ${topic}; body: ${JSON.stringify(req.body)}`)
    notificationManager.notifyAdminForEvent(req, constants.CRITICAL_EVENTS.TRANSFER_CANCELLED, req.body)
  } else if (topic === 'customer_verified') {
    logger.info(null, `${req.api_id} ${topic}; body: ${JSON.stringify(req.body)}`)
    _processVerifiedCustomer(req, resourceId)
  }
}

exports.processWebHook = async (req, res, next) => {
  const { topic, resourceId } = req.body

  _processWebHook(req, topic, resourceId)
  _checkNotifEvents(req, topic, resourceId)
  res.send()
}
