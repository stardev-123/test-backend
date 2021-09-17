/* global it, describe, should */
const request = require('supertest')
const prices = require('./data/prices')

describe('Bank Account suite', () => {
  it('Investment Request - unverified user, successfully invested', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': 25,
        allowBankCharge: true,
        prices
      })

    response.status.should.equal(200)
    should.equal(response.body.data.bundleId, null)
  })

  it('Investment Request - user selling, success', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/sell')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        ratio: [
          {
            currency: 'BTC',
            amount: 0.000092760000
          },
          {
            currency: 'BCH',
            amount: 0.000092760000
          }
        ],
        prices
      })

    response.status.should.equal(200)
  })

  it('Investment Request - unverified user, secondary bank, plaid login required', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.secondaryBankAccountId,
        'amount': 25,
        allowBankCharge: true,
        prices
      })
    response.status.should.equal(428)
    response.body.error.data.publicToken.should.equal('some_dummy_public_token')
  })
})
