const dwolla = require('dwolla-v2')
const logger = require('../../../lib/logger')
const config = require('../../../config')

logger.system(null, '****************** Dwolla configuration ******************')
logger.system(null, config.dwolla)
logger.system(null, '************************************')

const Client = new dwolla.Client({
  key: config.dwolla.KEY,
  secret: config.dwolla.SECRET,
  environment: config.dwolla.ENV // optional - defaults to production
})

const _getAppToken = async () => {
  try {
    return await Client.auth.client()
  } catch (err) {
    logger.error(null, err, 'ERROR getting Dwolla application access token')
    throw err
  }
}

const _getPostByUrl = async (appToken, getOrPost, url, errorMessage, successMessage, body, req) => {
  try {
    let func
    switch (getOrPost) {
      case 'get': func = appToken.get.bind(appToken)
        break
      case 'post': func = appToken.post.bind(appToken)
        break
      case 'delete': func = appToken.delete.bind(appToken)
        break
    }
    const response = await func(url, body)
    if (successMessage) logger.debug(req, successMessage)

    return response
  } catch (err) {
    if (errorMessage) logger.error(req, err, errorMessage)
    throw err
  }
}

// The “root” serves as an entry point to the API, providing your application with the ability to
// fetch and discover resources available based on the OAuth access_token provided in the request.
// Return links to resources that belong to the Dwolla application
const getLinksToResources = async () => {
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', '/', 'ERROR returnig  Dwolla master account links to resources', null, null)

  logger.system(null, 'dwolla master account info', response.body._links)
}

getLinksToResources()

// ********************ACCOUNT***************
// Account represents your Dwolla Master Account that was established on dwolla.com.
exports.getAccountDetails = async (accountId) => {
  var url = config.dwolla.API + '/accounts/' + accountId
  const appToken = await _getAppToken()
  const result = await _getPostByUrl(appToken, 'get', url, 'ERROR returnig Dwolla account details', null, null)
  return result
}

exports.getTransfersForAccount = async (accountId) => {
  var url = config.dwolla.API + '/accounts/' + accountId + '/transfers'
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', url, 'ERROR returnig transfers for Dwolla account', null, null)

  return response.body._embedded.transfers
}

exports.getListFundingSourcesForAccount = async (accountId) => {
  var url = config.dwolla.API + '/accounts/' + accountId + '/funding-sources'
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', url, 'ERROR returning list of funding sources for Dwolla account with id ' + accountId, null, null)

  return response.body
}

// ********************CUSTOMER***************
exports.createCustomer = async (customer, req) => {
  const appToken = await _getAppToken()
  let response
  try {
    response = await _getPostByUrl(appToken, 'post', 'customers', null, 'SUCCESSFULLY created Dwolla customer', customer, req)
  } catch (err) {
    if (err.body && err.body._embedded && err.body._embedded.errors[0].code === 'Duplicate') {
      return err.body._embedded.errors[0]._links.about.href
    } else {
      logger.error(req, err, 'ERROR creating dwolla customer with email ' + customer.email)
      throw err
    }
  }
  return response.headers.get('location')
}

exports.getCustomersById = async (customerId, req) => {
  var url = config.dwolla.API + '/customers/' + customerId
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', url, 'ERROR returning customer with id ' + customerId, null, null, req)

  return response.body
}
exports.getCustomers = async () => {
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', 'customers', 'ERROR returning customers for dwolla master account', null, null)

  return response.body._embedded.customers
}

exports.updateCustomer = async (customerId, customer, req) => {
  var url = config.dwolla.API + '/customers/' + customerId
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'post', url, 'ERROR updating customer with id ' + customerId, 'SUCCESSFULLY updated Dwolla customer with id ' + customerId, customer, req)

  return response.body
}

exports.getTransfersForCustomer = async (customerId, req) => {
  var url = config.dwolla.API + '/customers/' + customerId + '/transfers'
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', url, 'ERROR returning transfers for customer with id ' + customerId, null, null, req)

  return response.body._embedded.transfers
}

exports.getListFundingSourcesForCustomer = async (customerId) => {
  var url = config.dwolla.API + '/customers/' + customerId + '/funding-sources'
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', url, 'ERROR returning funding sources for customer with id ' + customerId, null, null)

  return response.body
}

// ********************Funding Sources***************
exports.getFundingSourcesByid = async (fundingId) => {
  var url = config.dwolla.API + '/funding-sources/' + fundingId
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', url, 'ERROR returning funding source by id for funding source id ' + fundingId, null, null)

  return response.body
}

// Creating and verify funding source for customer by Plaid processor_token
exports.dwollaPlaidVerification = async (body, customerId, req) => {
  var url = config.dwolla.API + '/customers/' + customerId + '/funding-sources'
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'post', url, 'ERROR verifing dwolla with plaid for customer with id ' + customerId, null, body, req)

  return response.headers.get('location')
}

exports.chargeUser = async (fundingSourceId, amount, currency, req) => {
  var requestBody = {
    _links: {
      source: {
        href: config.dwolla.API + '/funding-sources/' + fundingSourceId
      },
      destination: {
        href: config.dwolla.API + '/accounts/' + config.dwolla.MASTER_ACCOUNT_ID
      }
    },
    amount: {
      currency: currency,
      value: amount
    },
    metadata: {
      paymentId: '12345678',
      note: 'Some description'
    },
    clearing: {
      destination: 'next-available'
    },
    correlationId: 'dwolaVSapp8a2cdc8d-629d-4a24-98ac-40b735229fe2'
  }
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'post', 'transfers', 'ERROR initiating Dwolla transfer for funding source id ' + fundingSourceId, 'SUCCESSFULLY initiated transfer for funding source id ' + fundingSourceId, requestBody, req)

  const locationLink = response.headers.get('location')

  const transactionId = locationLink.substr(locationLink.indexOf('transfers/') + 10)

  return { transactionId }
}

exports.payOutToUser = async (fundingSourceId, amount, currency, req) => {
  var requestBody = {
    _links: {
      source: {
        href: config.dwolla.API + '/funding-sources/' + config.dwolla.MASTER_ACCOUNT_FUNDING_SOURCE
      },
      destination: {
        href: config.dwolla.API + '/funding-sources/' + fundingSourceId
      }
    },
    amount: {
      currency: currency,
      value: amount
    },
    metadata: {
      paymentId: '12345678',
      note: 'Onramp pay out'
    },
    clearing: {
      destination: 'next-available'
    },
    correlationId: 'dwolaVSapp8a2cdc8d-629d-4a24-98ac-40b735229fe2'
  }
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'post', 'transfers', 'ERROR initiating Dwolla transfer for funding source id ' + fundingSourceId, 'SUCCESSFULLY initiated transfer for funding source id ' + fundingSourceId, requestBody, req)

  const locationLink = response.headers.get('location')

  const transactionId = locationLink.substr(locationLink.indexOf('transfers/') + 10)

  return { transactionId }
}

exports.getTransactionById = async (transactionId, req) => {
  var url = config.dwolla.API + '/transfers/' + transactionId
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', url, 'ERROR returning transaction by id for transaction id ' + transactionId, null, null, req)

  return response.body
}

exports.deleteAllWebHooks = async () => {
  var requestBody = {
    url: config.dwolla.webhook_url,
    secret: config.dwolla.webhook_secret
  }
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'get', 'webhook-subscriptions', 'ERROR listing webhooks on Dwolla ', 'SUCCESSFULLY listed webhooks on Dwolla ', requestBody)
  const promises = response.body._embedded['webhook-subscriptions'].map((one) => {
    const hookURL = one._links.self.href
    return _getPostByUrl(appToken, 'delete', hookURL, 'ERROR listing webhooks on Dwolla ', 'SUCCESSFULLY listed webhooks on Dwolla ')
  })

  await Promise.all(promises)
  logger.info(null, 'all hooks deleted')

  // return response.headers.get('location');
}

exports.createWebHook = async () => {
  var requestBody = {
    url: config.dwolla.webhook_url,
    secret: config.dwolla.webhook_secret
  }
  const appToken = await _getAppToken()
  const response = await _getPostByUrl(appToken, 'post', 'webhook-subscriptions', 'ERROR creating webhook on Dwolla ', 'SUCCESSFULLY created webhook on Dwolla ', requestBody)

  return response.headers.get('location')
}
