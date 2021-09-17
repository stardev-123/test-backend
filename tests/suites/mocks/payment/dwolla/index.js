const uuidv1 = require('uuid/v1')

const dwollaApptokenSuccessResponse = require('./dwolla.apptoken.success')
const dwollaPrimaryFundingSourcesSuccessResponse = require('./dwolla.fundingSources.primary.success')
const dwollaSecondaryFundingSourcesSuccessResponse = require('./dwolla.fundingSources.secondary.success')
const dwollaTransactionDataSuccessResponse = require('./dwolla.transactionData.success')
const plaidIdentitySuccessResponse = require('./plaid.identity.success')
const plaidBalanceSuccessResponse = require('./plaid.balance.success')
const plaidBalanceInvalidResponse = require('./plaid.balance.invalid.error')

module.exports = (nock) => {
  // DWOLLA
  nock('https://api-sandbox.dwolla.com')
    .defaultReplyHeaders({
      'location': 'https://api-sandbox.dwolla.com/subscriptions/b1e8cef3-b07b-4cfe-b3df-16f9854873df'
    })
    .persist()
    .post('/webhook-subscriptions')
    .reply(200, () => {
      return { success: true }
    })

  nock('https://accounts-sandbox.dwolla.com')
    .persist()
    .post('/token')
    .reply(200, () => {
      return dwollaApptokenSuccessResponse
    })

  nock('https://api-sandbox.dwolla.com')
    .defaultReplyHeaders({
      'location': 'https://api-sandbox.dwolla.com/customers/b1e8cef3-b07b-4cfe-b3df-16f9854873df'
    })
    .persist()
    .post('/customers/b1e8cef3-b07b-4cfe-b3df-16f9854873df')
    .reply(200, () => {
      return { success: true }
    })

  nock('https://api-sandbox.dwolla.com')
    .defaultReplyHeaders({
      'location': 'https://api-sandbox.dwolla.com/customers/b1e8cef3-b07b-4cfe-b3df-16f9854873df'
    })
    .persist()
    .post('/customers')
    .reply(200, () => {
      return { success: true }
    })

  nock('https://api-sandbox.dwolla.com')
    .persist()
    .get('/')
    .reply(200, () => {
      return { success: true }
    })

  nock('https://api-sandbox.dwolla.com')
    .defaultReplyHeaders({
      'location': 'https://api-sandbox.dwolla.com/funding-sources/f1e8cef3-b07b-4cfe-b3df-16f9854873ds'
    })
    .persist()
    .post('/customers/b1e8cef3-b07b-4cfe-b3df-16f9854873df/funding-sources', {
      'plaidToken': 'some_dummy_token',
      'name': 'Bank of America - Plaid Saving'
    })
    .reply(200, () => {
      return dwollaPrimaryFundingSourcesSuccessResponse
    })

  nock('https://api-sandbox.dwolla.com')
    .defaultReplyHeaders({
      'location': 'https://api-sandbox.dwolla.com/funding-sources/f1e8cef3-b07b-4cfe-b3df-16f9854873dt'
    })
    .persist()
    .post('/customers/b1e8cef3-b07b-4cfe-b3df-16f9854873df/funding-sources', {
      'plaidToken': 'some_dummy_token',
      'name': 'Bank of America - Plaid Checking'
    })
    .reply(200, () => {
      return dwollaSecondaryFundingSourcesSuccessResponse
    })

  nock('https://api-sandbox.dwolla.com')
    .defaultReplyHeaders({
      'location': () => {
        const transactionId = uuidv1()
        global.dwollaTransactionsIds.push(transactionId)
        return `https://api-sandbox.dwolla.com/transfers/${transactionId}`
      }
    })
    .persist()
    .post('/transfers')
    .reply(200, () => {
      return { success: true }
    })

  const pathRegex = /\/(transfer.+)/
  nock('https://api-sandbox.dwolla.com')
    .persist()
    .get(pathRegex)
    .reply(200, () => {
      return { dwollaTransactionDataSuccessResponse }
    })

  // PLAID
  nock('https://sandbox.plaid.com')
    .persist()
    .post('/processor/dwolla/processor_token/create')
    .reply(200, () => {
      return { 'processor_token': 'some_dummy_token' }
    })

  nock('https://sandbox.plaid.com')
    .persist()
    .post('/item/public_token/exchange')
    .reply(200, () => {
      return { 'access_token': 'some_dummy_token', 'itemId': 'some_dummy_id' }
    })

  nock('https://sandbox.plaid.com')
    .persist()
    .post('/identity/get')
    .reply(200, () => {
      return plaidIdentitySuccessResponse
    })

  nock('https://sandbox.plaid.com')
    .persist()
    .post('/accounts/balance/get', {
      'client_id': '5b7bd678cb33d90012e9f37b',
      'secret': 'e08015307373b0431f57d3d78280e2',
      'access_token': 'some_dummy_token',
      'options': {
        'account_ids': ['Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKxxoK']
      }
    })
    .reply(200, () => {
      return plaidBalanceSuccessResponse
    })

  nock('https://sandbox.plaid.com')
    .persist()
    .post('/accounts/balance/get', {
      'client_id': '5b7bd678cb33d90012e9f37b',
      'secret': 'e08015307373b0431f57d3d78280e2',
      'access_token': 'some_dummy_token',
      'options': {
        'account_ids': ['Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKTTTK']
      }
    })
    .reply(400, () => {
      return plaidBalanceInvalidResponse
    })

  nock('https://sandbox.plaid.com')
    .persist()
    .post('/item/public_token/create')
    .reply(200, () => {
      return { public_token: 'some_dummy_public_token' }
    })
}
