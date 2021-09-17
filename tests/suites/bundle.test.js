/* global it, describe */
const request = require('supertest')
const { CRYPTOCURRENCIES } = require('../../lib/constants')
const prices = require('./data/prices')

describe('Bundle testing', () => {
  it('Bundle create - should success', async () => {
    const response = await request(global.server)
      .post('/admin/bundle')
      .set('Accept', 'application/json')
      .set('authorization', global.adminToken)
      .send({
        bundle: {
          name: 'bundle 1',
          description: 'description 1',
          icon: 'bundle1.png'
        },
        coins: CRYPTOCURRENCIES
      })

    response.status.should.equal(200)
    global.bundleId = response.body.id
  })

  it('Bundle get all - should return one bundle', async () => {
    const response = await request(global.server)
      .get('/admin/bundles')
      .set('Accept', 'application/json')
      .set('authorization', global.adminToken)

    response.status.should.equal(200)
    response.body.length.should.equal(1)
  })

  it('Bundle get one - should return requested bundle', async () => {
    const response = await request(global.server)
      .get('/admin/bundle/' + global.bundleId)
      .set('Accept', 'application/json')
      .set('authorization', global.adminToken)

    response.status.should.equal(200)
    response.body.bundle.id.should.equal(global.bundleId)
    response.body.coins.length.should.equal(CRYPTOCURRENCIES.length)
  })

  it('Bundle update - update shall return not found', async () => {
    const response = await request(global.server)
      .put('/admin/bundle/' + 2)
      .set('Accept', 'application/json')
      .set('authorization', global.adminToken)
      .send({
        bundle: {
          name: 'bundle 1 updated',
          description: 'description 1 updated',
          icon: 'bundle1Updated.png'
        },
        coins: CRYPTOCURRENCIES
      })

    response.status.should.equal(404)
  })

  it('Bundle update - should update', async () => {
    const response = await request(global.server)
      .put('/admin/bundle/' + global.bundleId)
      .set('Accept', 'application/json')
      .set('authorization', global.adminToken)
      .send({
        bundle: {
          name: 'bundle 1 updated',
          description: 'description 1 updated',
          icon: 'bundle1Updated.png'
        },
        coins: CRYPTOCURRENCIES
      })

    response.status.should.equal(200)
  })

  it('Bundle user get all - should return one bundle', async () => {
    const response = await request(global.server)
      .get('/user/' + global.user.id + '/bundles')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)

    response.status.should.equal(200)
    response.body.length.should.equal(1)
    response.body[0].name.should.equal('bundle 1 updated')
  })

  it('Bundle user get one - should return requested bundle', async () => {
    const response = await request(global.server)
      .get('/user/' + global.user.id + '/bundle/' + global.bundleId)
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)

    response.status.should.equal(200)
    response.body.bundle.id.should.equal(global.bundleId)
    response.body.coins.length.should.equal(CRYPTOCURRENCIES.length)
  })

  it('Bundle delete - deactivate bundle should return not found', async () => {
    const response = await request(global.server)
      .delete('/admin/bundle/' + 2)
      .set('Accept', 'application/json')
      .set('authorization', global.adminToken)

    response.status.should.equal(404)
  })

  it('Bundle delete - should deactivate bundle', async () => {
    const response = await request(global.server)
      .delete('/admin/bundle/' + global.bundleId)
      .set('Accept', 'application/json')
      .set('authorization', global.adminToken)

    response.status.should.equal(200)
  })

  it('Bundle get all - should return one bundle', async () => {
    const response = await request(global.server)
      .get('/admin/bundles')
      .set('Accept', 'application/json')
      .set('authorization', global.adminToken)

    response.status.should.equal(200)
    response.body.length.should.equal(1)
  })

  it('Bundle user get all - should return no bundle', async () => {
    const response = await request(global.server)
      .get('/user/' + global.user.id + '/bundles')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)

    response.status.should.equal(200)
    response.body.length.should.equal(0)
  })

  it('Bundle Investment Request - verified user, bundle, invest, success', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/investment/portfolio')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        'bankAccountId': global.bankAccountId,
        'amount': global.maxVerifiedAvailable - 20,
        'bundleId': global.bundleId,
        prices
      })

    response.status.should.equal(200)
    response.body.data.bundleId.should.equal(global.bundleId)
  })
})
