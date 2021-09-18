/**
 * Created by laslo on 21/11/18.
 */

const Request = require('request')
// const models = require('../../../../database/models')

exports.getPrices = () => {
  return new Promise((resolve, reject) => {
    models.settings.findOne().then(setting => {
      const coinQuery = setting.portfolio.map(({ currency }) => currency).join(',')

      const uri = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + coinQuery + '&tsyms=USD'

      Request['get']({
        uri: uri,
        json: true
      }, function (error, response, body) {
        if (error) return reject(error)
        resolve(body)
      })
    }).catch(reject)
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
