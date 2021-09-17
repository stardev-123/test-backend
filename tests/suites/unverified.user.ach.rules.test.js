/* global it, describe */
const request = require('supertest')
const config = require('../../config')
const prices = require('./data/prices')

describe('Bank Account suite', () => {
  it('Withdraw Request - unverified user, failed no money', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/payout')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 1,
        prices
      })

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(0)
  })

  it('Investment Request - unverified user, should failed due breaking the limit', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': config.dwolla.MAX_UNVERIFIED_AMOUNT + 1,
        prices
      })

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(5)
  })

  it('Investment Request - unverified user, should ask for investment confirmation, no user holdings', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 25,
        allowBankCharge: false,
        prices
      })

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(6)
  })

  it('Investment Request - unverified user, add funds, success', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 15,
        allowBankCharge: true
      })

    response.status.should.equal(200)
  })

  it('Investment Request - unverified user, should ask for investment confirmation, with user existing holdings', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 25,
        allowBankCharge: false,
        prices
      })

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(3)
  })

  it('Investment Request - user selling more then in holdings', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/sell')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'ratio': [
          {
            'currency': 'BTC',
            'amount': 0.01
          },
          {
            'currency': 'BCH',
            'amount': 0.01
          }
        ],
        prices
      })

    response.status.should.equal(402)
    response.body.error.internalCode.should.equal(4021)
  })

  it('Investment Request - user selling , success', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/sell')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'ratio': [
          {
            'currency': 'BTC',
            'amount': 0.001
          },
          {
            'currency': 'BCH',
            'amount': 0.001
          }
        ],
        prices
      })

    response.status.should.equal(200)
  })
})
