const plaid = require('plaid')
const dwolla = require('./dwolla')
const error = require('../../../lib/error')
const logger = require('../../../lib/logger')
const config = require('../../../config')

logger.system(null, '****************** Plaid configuration ******************')
logger.system(null, config.plaid)
logger.system(null, '************************************')

var Client = new plaid.Client(
  config.plaid.CLIENT_ID,
  config.plaid.SECRET,
  config.plaid.PUBLIC_KEY,
  plaid.environments[config.plaid.ENV]
)

const _processPlaidErrors = (err, cb, accessToken) => {
  if (err && err.error_code && err.error_code === 'ITEM_LOGIN_REQUIRED') {
    if (!accessToken) cb(error('PAYMENT_UPDATE_NEEDED'))
    Client.createPublicToken(accessToken, (err, res) => {
      if (err) {
        logger.error(null, err, 'ERROR retriving public token from access token ' + accessToken)
      }
      cb(error('PAYMENT_UPDATE_NEEDED', res.public_token))
    })
  } else {
    cb(err)
  }
}

// This public token, along with the account id must be exchanged
// for a Plaid access_token by your back-end server making a call
// to the Plaid API. Finally, you’ll send the access_token and account_id
// to the Plaid API in exchange for a Dwolla processor_token
// https://developers.dwolla.com/resources/dwolla-plaid-integration.html

// onSucces from Client:
// var metadata =
// {
//     institution: {
//         name: "Bank of America",
//         institution_id: "ins_1"
//     },
//     account: {
//         id: "Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKxxoK",
//         name: "Plaid Saving",
//         type: "depository",
//         subtype: "savings",
//         mask: "1111"
//     },
//     account_id: "Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKxxoK",//ovaj Id se stalno menja
//     accounts: [
//         {
//             id: "Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKxxoK",
//             name: "Plaid Saving",
//             mask: "1111",
//             type: "depository",
//             subtype: "savings"
//         }],
//     link_session_id: "67633b5b-14c8-4eae-ba15-0dc0edc9a089",
//     public_token: "public-sandbox-676b6ae1-4a97-47ae-a7f2-8640e0423fe3"
// }

exports.resetAccessToken = (accessToken) => {
  return new Promise((resolve, reject) => {
    Client.resetLogin(accessToken, function (err, res) {
      if (err != null) {
        logger.error(null, err, 'Error resetting access token from plaid')
        return reject(err)
      }
      logger.debug(null, 'Success resetting access token at plaid', res)
      resolve()
    })
  })
}

exports.getAccessTokenFromPublic = (publicToken) => {
  return new Promise((resolve, reject) => {
    Client.exchangePublicToken(publicToken, function (err, tokenResponse) {
      if (err != null) {
        logger.error(null, 'Error exchanging public token with plaid', err)
        return reject(error('INVALID_PAYMENT_DATA'))
      }
      resolve(tokenResponse.access_token)
    })
  })
}

exports.bindBankAccountToDwolla = (accessToken, plaidData, customerId) => {
  return new Promise((resolve, reject) => {
    const accountId = plaidData.account_id

    const accountInfo = {
      name: plaidData.account.name,
      mask: plaidData.account.mask,
      type: plaidData.account.type,
      subtype: plaidData.account.subtype,
      accountId: plaidData.account_id
    }

    const accountName = plaidData.institution.name + ' - ' + accountInfo.name

    Client.createProcessorToken(accessToken, accountId, 'dwolla', async (err, tokenResponse) => {
      if (err != null) {
        reject(err)
      }
      var requestBody = {
        'plaidToken': tokenResponse.processor_token,
        'name': accountName
      }

      const fundingSourceString = 'funding-sources/'

      const result = {
        accountName: accountName,
        accountType: accountInfo.type,
        accountSubType: accountInfo.subtype,
        accountMask: accountInfo.mask,
        accountId: accountInfo.accountId
      }

      try {
        const createdFundingSource = await dwolla.dwollaPlaidVerification(requestBody, customerId)
        const fundingSourceId = createdFundingSource.slice(createdFundingSource.indexOf(fundingSourceString) + fundingSourceString.length)
        logger.debug(null, 'SUCCESSFULLY created funding source for Dwolla customer with id ' + fundingSourceId + ' by Plaid verification')

        result.fundingSourceId = fundingSourceId
        result.createNew = true

        return resolve(result)
      } catch (err) {
        // if funding source already exists
        if (err.body && err.body.code === 'DuplicateResource') {
          const link = err.body._links.about.href
          const fundingSourceId = link.slice(link.indexOf(fundingSourceString) + fundingSourceString.length)

          logger.info(null, 'Bank account already binded for fundingSourceId', fundingSourceId)

          result.fundingSourceId = fundingSourceId
          result.createNew = false

          return resolve(result)
        } else {
          logger.error(null, 'ERROR creating Dwolla funding source for customer with id ' + customerId + ', err is ' + err)
          _processPlaidErrors(err, reject, accessToken)
        }
      }
    })
  })
}

exports.getBalance = async (req, accessToken, accountId) => {
  return new Promise((resolve, reject) => {
    // Pull real-time balance information for each account associated with the Item
    Client.getBalance(accessToken, {
      account_ids: [accountId]
    }, (err, result) => {
      if (err) {
        logger.error(req, err, 'ERROR getting balance for accountId ' + accountId)
        return _processPlaidErrors(err, reject, accessToken)
      }
      logger.debug(req, 'Successfully get balance for accountId ' + accountId)
      resolve(result.accounts[0])
    })
  })
}

exports.getAccounts = async (accessToken) => {
  return new Promise((resolve, reject) => {
    // Use Auth and pull account numbers for an Item
    // Retrieve high-level account information and account and routing numbers
    Client.getAccounts(accessToken, function (err, response) {
      if (err) return _processPlaidErrors(err, reject, accessToken)
      resolve(response.accounts)
    })
  })
}

exports.getItem = async (accessToken) => {
  return new Promise((resolve, reject) => {
    // Pull the Item - this includes information about available products,
    // billed products, webhook information, and more.
    Client.getItem(accessToken, function (err, result) {
      if (err) {
        // Handle err
        _processPlaidErrors(err, reject, accessToken)
      }
      // The Item has a list of available products, billed products, error status,
      // webhook information, and more.
      resolve(result.item)
    })
  })
}

exports.getIdentity = async (accessToken) => {
  return new Promise((resolve, reject) => {
    Client.getIdentity(accessToken, function (err, result) {
      if (err) {
        // Handle err
        return _processPlaidErrors(err, reject, accessToken)
      }
      resolve(result)
    })
  })
}

exports.getTransactions = async (accessToken, accountId, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    Client.getTransactions(accessToken, startDate, endDate, {
      count: 250,
      offset: 0,
      account_ids: [accountId]
    }, function (err, result) {
      if (err) {
        // Handle err
        return _processPlaidErrors(err, reject, accessToken)
      }
      resolve(result)
    })
  })
}

exports.rotateAccessToken = async (accessToken) => {
  return new Promise((resolve, reject) => {
    Client.invalidateAccessToken(accessToken, (err, result) => {
      if (err) {
        return _processPlaidErrors(err, reject, accessToken)
      }
      resolve(result.new_acccess_token)
    })
  })
}

exports.getInstitutions = async () => {
  return new Promise((resolve, reject) => {
    // Pull institution by ID
    Client.getInstitutions(20, 0, (err, result) => {
      if (err) {
        return _processPlaidErrors(err, reject)
      }
      resolve(result)
    })
  })
}
exports.getInstitutionById = async (institutionId) => {
  return new Promise((resolve, reject) => {
    Client.getInstitutionById(institutionId, (err, result) => {
      if (err) {
        return _processPlaidErrors(err, reject)
      }
      resolve(result)
    })
  })
}
