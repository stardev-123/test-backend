/**
 * Created by laslo on 21/11/18.
 */

const Request = require('request')
// const models = require('../../../../database/models')

exports.getPrices = () => {
  return new Promise((resolve, reject) => {
    // models.settings.findOne().then(setting => {
      const setting = {
        'portfolio': [{"percent": "69.18", "currency": "BTC"}, {"percent": "17.05", "currency": "ETH"}, {"percent": "8.16", "currency": "LTC"}, {"percent": "2.21", "currency": "BCH"}, {"percent": "3.41", "currency": "ZEC"}],
        'coins': [{"icon": "Bitcoin.png", "name": "Bitcoin", "currency": "BTC", "description": "Bitcoin uses peer-to-peer technology to operate with no central authority or banks; managing transactions and the issuing of bitcoins is carried out collectively by the network."}, {"icon": "Ethereum.png", "name": "Ethereum", "currency": "ETH", "description": "Ethereum Classic is a blockchain-based distributed computing platform featuring smart contract functionality."}, {"icon": "Litecoin.png", "name": "Litecoin", "currency": "LTC", "description": "Litecoin is a cryptocurrency that enables instant payments to anyone in the world."}, {"icon": "Bitcoin_cash.png", "name": "Bitcoin Cash", "currency": "BCH", "description": "Bitcoin Cash is a peer-to-peer electronic cash system. It's a permissionless, decentralized cryptocurrency."}, {"icon": "Zcash.png", "name": "Zcash", "currency": "ZEC", "description": "Zcash is a peer-to-peer electronic cash system. It's a permissionless, decentralized cryptocurrency."}]
      }
      const coinQuery = setting['portfolio'].map(({ currency }) => currency).join(',')

      const uri = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + coinQuery + '&tsyms=USD'

      Request['get']({
        uri: uri,
        json: true
      }, function (error, response, body) {
        if (error) return reject(error)
        resolve(body)
      })
    // }).catch(reject)
  })
}

exports.getHistoryMinutes = (coin, currency = 'USD', limit = 59) => {
  return new Promise((resolve, reject) => {
    const uri = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + coin + '&tsym=' + currency + '&limit=' + limit

    Request['get']({
      uri: uri,
      json: true
    }, function (error, response, body) {
      if (error) return reject(error)
      resolve(body)
    })
  })
}

exports.getHistoryHours = (coin, currency = 'USD', limit = 23) => {
  return new Promise((resolve, reject) => {
    const uri = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + coin + '&tsym=' + currency + '&limit=' + limit

    Request['get']({
      uri: uri,
      json: true
    }, function (error, response, body) {
      if (error) return reject(error)
      resolve(body)
    })
  })
}

exports.getHistoryDays = (coin, currency = 'USD', limit = 364) => {
  return new Promise((resolve, reject) => {
    const uri = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + coin + '&tsym=' + currency + '&limit=' + limit

    Request['get']({
      uri: uri,
      json: true
    }, function (error, response, body) {
      if (error) return reject(error)
      resolve(body)
    })
  })
}
