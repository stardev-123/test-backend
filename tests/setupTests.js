/* global before, it, describe */

require('should')
const nock = require('nock')
// const models = require('../database/models')
const btoa = require('btoa')
const config = require('../config')

nock.disableNetConnect()
nock.enableNetConnect('127.0.0.1')

require('./suites/mocks')(nock)

const coins = [{ icon: 'Bitcoin.png', name: 'Bitcoin', currency: 'BTC', description: 'Bitcoin uses peer-to-peer technology to operate with no central authority or banks; managing transactions and the issuing of bitcoins is carried out collectively by the network.' }, { icon: 'Ethereum.png', name: 'Ethereum', currency: 'ETH', description: 'Ethereum Classic is a blockchain-based distributed computing platform featuring smart contract functionality.' }, { icon: 'Litecoin.png', name: 'Litecoin', currency: 'LTC', description: 'Litecoin is a cryptocurrency that enables instant payments to anyone in the world.' }, { icon: 'Bitcoin_cash.png', name: 'Bitcoin Cash', currency: 'BCH', description: "Bitcoin Cash is a peer-to-peer electronic cash system. It's a permissionless, decentralized cryptocurrency." }]

describe('Test suite ready', () => {
  before(function (done) {
    this.timeout(10000)
    const server = require('../index')
    server.on('appStarted', function () {
      console.log('server started...............')
      global.server = server
      global.dwollaTransactionsIds = []
      global.adminToken = 'Basic ' + btoa(config.admin.username + ':' + config.admin.password)
      models.settings.findOne({}).then(settings => {
        models.settings.updateOne(settings, { coins }).then(() => {
          done()
        })
      })
    })
  })

  it('Database prepared successfully', () => {
    require('./suites/registration.test')
    require('./suites/signin.test')
    require('./suites/bankAccount.test')
    require('./suites/unverified.user.ach.rules.test')
    require('./suites/unverified.user.investment.test')
    require('./suites/user.update.and.verifiy.test')
    require('./suites/verified.user.ach.rules.test')
    require('./suites/verified.user.investment.test')
    require('./suites/bundle.test')
    require('./suites/end.test')(() => { setTimeout(() => process.exit(0), 2000) })
  })
})
