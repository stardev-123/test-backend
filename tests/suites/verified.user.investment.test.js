/* global it, describe, should */
const request = require('supertest')
const prices = require('./data/prices')
const badPrices = require('./data/badPrices')

describe('Bank Account suite', () => {
  it('Investment Request - verified user, not prices send, success', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 1
      })

    response.status.should.equal(200)
  })

  it('Investment Request - verified user, prices changed over limit, failed', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 1,
        prices: badPrices
      })

    response.status.should.equal(412)
    response.body.error.internalCode.should.equal(41202)
  })

  it('Investment Request - verified user, invest, success', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': global.maxVerifiedAvailable - 20,
        prices
      })

    response.status.should.equal(200)
    should.equal(response.body.data.bundleId, null)
  })

  it('Investment Request - verified user, add funds, success', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 10
      })

    response.status.should.equal(200)
  })

  it('Withdraw Request - unverified user, failed enough settled money', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/payout')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 30,
        prices
      })

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(9)
  })

  it('Verifying user - simulate ACH settled webhook', async () => {
    const requests = global.dwollaTransactionsIds.map(async (transactionId) => {
      return request(global.server)
        .post('/webhook')
        .set('Accept', 'application/json')
        .set('x-access-token', global.token)
        .send({
          topic: 'customer_transfer_completed',
          resourceId: transactionId
        })
    })

    const responses = await Promise.all(requests)
    responses.forEach(response => {
      response.status.should.equal(200)
    })
  })

  it('Withdraw Request - unverified user, failed enough money', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/payout')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 30,
        prices
      })

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(8)
  })

  it('Withdraw Request - unverified user, success', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/payout')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 5,
        prices
      })

    response.status.should.equal(200)
  })
})
