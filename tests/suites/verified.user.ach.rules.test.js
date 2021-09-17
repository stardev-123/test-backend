/* global it, describe */
const request = require('supertest')
const config = require('../../config')
const prices = require('./data/prices')

describe('Bank Account suite', () => {
  it('Investment Request - verified user, add funds, should failed due breaking the max limit', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': config.dwolla.MAX_VERIFIED_AMOUNT + 1
      })

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(1)
  })

  it('Investment Request - verified user, investment, should failed due breaking the max limit', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': config.dwolla.MAX_VERIFIED_AMOUNT + 1000,
        prices
      })

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(1)
  })

  it('Investment Request - verified user, investment, should send max available investment', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': config.dwolla.MAX_VERIFIED_AMOUNT + 1,
        prices
      })

    global.maxVerifiedAvailable = response.body.error.data.available

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(1)
  })
})
