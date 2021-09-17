/**
 * Created by laslo on 21/11/18.
 */

const Request = require('request')
const moment = require('moment')
const models = require('../../../../database/models')

const SYMBOL_TO_ID = {
  'BTC': 'bitcoin',
  'XRP': 'ripple',
  'ETH': 'ethereum',
  'BCH': 'bitcoin-cash',
  'XLM': 'stellar',
  'EOS': 'eos',
  'LTC': 'litecoin',
  'ETC': 'ethereum-classic',
  'ZEC': 'zcash',
  'BTG': 'bitcoin-gold',
  'XZC': 'zcoin'
}

module.exports.getPrices = () => {
  return new Promise((resolve, reject) => {
    models.settings.findOne({ attributes: ['portfolio'], raw: true }).then(setting => {
      const coinQuery = setting.portfolio.map(({ currency }) => SYMBOL_TO_ID[currency]).join(',')
      const uri = 'https://api.coincap.io/v2/assets?ids=' + coinQuery
      Request['get']({
        uri: uri,
        json: true
      }, function (error, response, body) {
        if (error) return reject(error)
        const returnData = []
        if (body && body.data) {
          body.data.forEach(({ symbol, priceUsd, marketCapUsd, volumeUsd24Hr, supply }) => {
            returnData.push({
              symbol,
              USD: Number(priceUsd),
              marketCap: Number(marketCapUsd),
              volume: Number(volumeUsd24Hr),
              supply: Number(supply)
            })
          })
        }
        resolve(returnData)
      })
    }).catch(reject)
  })
}

module.exports.getHistoryMinutes = (coin, currency = 'USD', limit = 59) => {
  const end = moment().valueOf()
  const start = moment().subtract(limit, 'minutes').valueOf()
  return new Promise((resolve, reject) => {
    const uri = `https://api.coincap.io/v2/assets/${SYMBOL_TO_ID[coin]}/history?interval=m1&start=${start}&end=${end}`

    Request['get']({
      uri: uri,
      json: true
    }, function (error, response, body) {
      if (error) return reject(error)
      if (body && body.data) {
        resolve(body.data.map(({ time, priceUsd }) => ({ time, price: Number(priceUsd) })))
      } else {
        resolve([])
      }
    })
  })
}

module.exports.getHistoryHours = (coin, currency = 'USD', limit = 23) => {
  const end = moment().valueOf()
  const start = moment().subtract(limit, 'hour').valueOf()
  return new Promise((resolve, reject) => {
    const uri = `https://api.coincap.io/v2/assets/${SYMBOL_TO_ID[coin]}/history?interval=h1&start=${start}&end=${end}`

    Request['get']({
      uri: uri,
      json: true
    }, function (error, response, body) {
      if (error) return reject(error)
      if (body && body.data) {
        resolve(body.data.map(({ time, priceUsd }) => ({ time, price: Number(priceUsd) })))
      } else {
        resolve([])
      }
    })
  })
}

module.exports.getHistoryDays = (coin, currency = 'USD', limit = 364) => {
  const end = moment().valueOf()
  const start = moment().subtract(Number(limit) + 1, 'days').valueOf()
  return new Promise((resolve, reject) => {
    const uri = `https://api.coincap.io/v2/assets/${SYMBOL_TO_ID[coin]}/history?interval=d1&start=${start}&end=${end}`

    Request['get']({
      uri: uri,
      json: true
    }, function (error, response, body) {
      if (error) return reject(error)
      if (body && body.data) {
        resolve(body.data.map(({ time, priceUsd }) => ({ time, price: Number(priceUsd) })))
      } else {
        resolve([])
      }
    })
  })
}

module.exports.getHistoryPriceOnDay = (coin, currency = 'USD', date) => {
  const end = moment(date).endOf('day').valueOf()
  const start = moment(date).startOf('day').valueOf()
  return new Promise((resolve, reject) => {
    const uri = `https://api.coincap.io/v2/assets/${SYMBOL_TO_ID[coin]}/history?interval=d1&start=${start}&end=${end}`
    Request['get']({
      uri: uri,
      json: true
    }, function (error, response, body) {
      if (error) return reject(error)
      if (body && body.data) {
        resolve(body.data.map(({ time, priceUsd }) => ({ time, coin, price: Number(priceUsd) })))
      } else {
        resolve([])
      }
    })
  })
}
