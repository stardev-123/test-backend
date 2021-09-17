/* global it, describe */
const request = require('supertest')
const config = require('../../config')
const jwt = require('jsonwebtoken')

const nonExistUserConfirmationLinkToken = jwt.sign({
  email: 'bad@email.com',
  userId: 5555,
  emailConfirmation: true
}, config.token.secret, {
  expiresIn: 172800 // expires in 2 days/
})

const confirmationLinkToken = jwt.sign({
  email: 'test_regist@test.com',
  userId: 1,
  emailConfirmation: true
}, config.token.secret, {
  expiresIn: 172800 // expires in 2 days/
})

const badConfirmationLinkToken = '@#$@#$@#$@#$@#$@#$@#$@#$@#$'

describe('Registration suite', () => {
  it('Register - should fail to register account invalid email', async () => {
    const response = await request(global.server)
      .post('/register')
      .send({ 'email': 'test_regist', 'password': 'test1234' })
      .set('Accept', 'application/json')
    response.status.should.equal(400)
  })

  it('Register - should successfully register account valid params', async () => {
    const response = await request(global.server)
      .post('/register')
      .send({
        'email': 'test_regist@test.com',
        'password': 'test1234'
      })
      .set('Accept', 'application/json')

    response.status.should.equal(200)

    const user = response.body.user
    const token = response.body.token

    global.user = user
    global.token = token
  })

  it('Register - should fail to register already registered user', async () => {
    const response = await request(global.server)
      .post('/register')
      .send({
        'email': 'test_regist@test.com',
        'password': 'test1234'
      })
      .set('Accept', 'application/json')

    response.status.should.equal(406)
    response.body.error.message.should.equal('Email already registered')
  })

  it('Register - should fail on bad token registration email confirmation link', async () => {
    const response = await request(global.server)
      .get('/confirm?token=' + badConfirmationLinkToken)

    response.status.should.equal(405)
    response.body.error.code.should.equal(405)
    response.body.error.message.should.equal('You are not authorized to access this URI')
  })

  it('Register - should fail on wrong user token registration email confirmation link', async () => {
    const response = await request(global.server)
      .get('/confirm?token=' + nonExistUserConfirmationLinkToken)

    response.status.should.equal(404)
    response.body.error.code.should.equal(404)
    response.body.error.message.should.equal('Not found')
  })

  it('Register - success registration email confirmation link', async () => {
    const response = await request(global.server)
      .get('/confirm?token=' + confirmationLinkToken)

    response.status.should.equal(200)
  })
})
