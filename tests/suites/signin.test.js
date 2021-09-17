/* global it, describe */
const request = require('supertest')

describe('Signin suite', () => {
  it('Signin - should fail to sign in to non existing account', async () => {
    const response = await request(global.server)
      .post('/login')
      .send({
        email: 'test1234@test.com',
        password: 'test1234'
      })
      .set('Accept', 'application/json')
    response.status.should.equal(404)
  })

  it('Signin - should fail to signin account valid invalid params', async () => {
    const response = await request(global.server)
      .post('/login')
      .send({
        email: global.user.email,
        password: 'test12345'
      })
      .set('Accept', 'application/json')
    response.status.should.equal(409)
  })

  it('Signin - valid params, no phone entered, it pass', async () => {
    const response = await request(global.server)
      .post('/login')
      .send({
        email: global.user.email,
        password: 'test1234'
      })
      .set('Accept', 'application/json')
    response.status.should.equal(200)
  })

  it('Signin - Sending phone number, success', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/phone')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        phone: '9495464646'
      })
      .set('Accept', 'application/json')
    response.status.should.equal(200)
  })

  it('Signin - verify phone number, bad code', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/verifyPhone')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        code: '5555'
      })
      .set('Accept', 'application/json')
    response.status.should.equal(414)
  })

  it('Signin - verify phone number, pass', async () => {
    const response = await request(global.server)
      .post('/user/' + global.user.id + '/verifyPhone')
      .set('Accept', 'application/json')
      .set('x-access-token', global.token)
      .send({
        code: '1111'
      })
      .set('Accept', 'application/json')
    response.status.should.equal(200)
  })

  it('Signin - valid params, should fail 2FA required', async () => {
    const response = await request(global.server)
      .post('/login')
      .send({
        email: global.user.email,
        password: 'test1234'
      })
      .set('Accept', 'application/json')
    response.status.should.equal(412)
    response.body.error.internalCode.should.equal(12)
  })

  it('Signin -  valid params, valid 2FA code sent', async () => {
    const response = await request(global.server)
      .post('/login')
      .send({
        email: global.user.email,
        password: 'test1234',
        code: '1111'
      })
      .set('Accept', 'application/json')
    response.status.should.equal(200)

    const user = response.body.user
    const token = response.body.token

    global.user = user
    global.token = token
  })
})
