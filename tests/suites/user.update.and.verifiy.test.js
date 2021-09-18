/* global it, describe */
const request = require('supertest')
const moment = require('moment')
// const models = require('../../database/models')

describe('User Update Suite', () => {
  it('Verifying user - successfully checked user is not verified', async () => {
    const response = await request(global.server)
      .get('/user/' + global.user.id)
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)

    response.status.should.equal(200)
    response.body.user.verifiedAtProvider.should.equal(false)
  })

  it('Updating SSN and Birthday - should reject SSN bad format to short', async () => {
    const response = await request(global.server)
      .put('/user/' + global.user.id)
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        ssn: '123'
      })

    response.status.should.equal(400)
    response.body.error.internalCode.should.equal(22)
  })

  it('Updating SSN and Birthday - should reject SSN bad format to long', async () => {
    const response = await request(global.server)
      .put('/user/' + global.user.id)
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        ssn: '1234567890'
      })

    response.status.should.equal(400)
    response.body.error.internalCode.should.equal(22)
  })

  it('Updating SSN and Birthday - should reject Birthday under 18', async () => {
    const response = await request(global.server)
      .put('/user/' + global.user.id)
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        birthdate: moment().subtract('1', 'year').format('YYYY-MM-DD')
      })

    response.status.should.equal(400)
    response.body.error.internalCode.should.equal(40001)
  })

  it('Updating SSN and Birthday - should success update', async () => {
    const response = await request(global.server)
      .put('/user/' + global.user.id)
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        ssn: '123456789',
        birthdate: moment().subtract('19', 'year').format('YYYY-MM-DD')
      })

    response.status.should.equal(200)
    response.body.user.ssn.should.equal('6789')
  })

  it('Verifying user - should success update', async () => {
    const response = await request(global.server)
      .put('/user/' + global.user.id)
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        firstName: 'Test',
        lastName: 'Test',
        ssn: '123456789',
        birthdate: moment().subtract('19', 'year').format('YYYY-MM-DD')
      })

    response.status.should.equal(200)
    response.body.user.ssn.should.equal('6789')
  })

  it('Verifying user - should successfully verify', async () => {
    const response = await request(global.server)
      .put('/user/' + global.user.id + '/verify')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({})

    response.status.should.equal(200)
  })

  it('Verifying user - should reject, verification in progress', async () => {
    const response = await request(global.server)
      .put('/user/' + global.user.id + '/verify')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({})

    response.status.should.equal(400)
    response.body.error.message.should.endWith('Already in verification process')
  })

  it('Verifying user - simulate verification webhook', async () => {
    models.user.findById(global.user.id, { raw: true }).then(async (user) => {
      const response = await request(global.server)
        .post('/webhook')
        .set('Accept', 'application/json')
        .set('x-access-token', global.token)
        .send({
          topic: 'customer_verified',
          resourceId: user.customerId
        })

      response.status.should.equal(200)
    })
  })

  it('Verifying user - successfully checked user is verified', async () => {
    const response = await request(global.server)
      .get('/user/' + global.user.id)
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)

    response.status.should.equal(200)
    response.body.user.verifiedAtProvider.should.equal(true)
  })
})
