/* global it, describe */
const request = require('supertest')

const bankAccountMock = {
  'institution': {
    'name': 'Bank of America',
    'institution_id': 'ins_1'
  },
  'account': {
    'id': 'Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKxxoK',
    'name': 'Plaid Saving',
    'type': 'depository',
    'subtype': 'savings',
    'mask': '1111'
  },
  'account_id': 'Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKxxoK',
  'public_token': 'public-sandbox-676b6ae1-4a97-47ae-a7f2-8640e0423fe3'
}

const bankSecondaryAccountMock = {
  'institution': {
    'name': 'Bank of America',
    'institution_id': 'ins_1'
  },
  'account': {
    'id': 'Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKTTTK',
    'name': 'Plaid Checking',
    'type': 'depository',
    'subtype': 'checking',
    'mask': '0000'
  },
  'account_id': 'Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKTTTK',
  'public_token': 'public-sandbox-676b6ae1-4a97-47ae-a7f2-8640e0423fe3'
}

describe('Bank Account suite', () => {
  it('Bank Account - should successfully create users Bank Account', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/bank')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send(bankAccountMock)

    response.status.should.equal(200)
    response.body.id.should.not.equal(null)
    response.body.primary.should.equal(true)

    global.bankAccountId = response.body.id
  })

  it('Bank Account - should successfully create users Secondary Bank Account', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/bank')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send(bankSecondaryAccountMock)

    response.status.should.equal(200)
    response.body.id.should.not.equal(null)
    response.body.primary.should.equal(false)

    global.secondaryBankAccountId = response.body.id
  })

  it('Bank Account - should successfully set Secondary Bank Account to primary', async () => {
    const response = await request(global.server)
      .put('/user/' + global.user.id + '/bank/' + global.secondaryBankAccountId + '/primary')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({})

    response.status.should.equal(200)
  })
})
