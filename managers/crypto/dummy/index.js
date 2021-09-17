// /**
//  * Created by laslo on 07/09/18.
//  */
// const util = require('../../../lib/util')
//
// const DUMMY_PRICES = {
//   BTC: 64.5442,
//   ETH: 2.2203,
//   XRP: 0.00292,
//   LTC: 0.5652,
//   EOS: 0.0505,
//   BCH: 5.0667
//
// }
//
// const transactionId = 'DUMMY_TRANSACTION_ID'
//
// /**
//  * returns  - Array of currency, volume, transactionId
//  *
//  * @param ratio - Array of {value, currency} pairs
//  * @param totalAmount
//  * @param req
//  * @returns {{result: Array}}
//  */
// module.exports.buyCurrencies = async ({ id, amount, assets, userId }, req) => {
//   const result = []
//
//   assets.forEach(({ value, currency }) => {
//     const volume = util.round(value / DUMMY_PRICES[currency], 4)
//     result.push({ currency, volume, transactionId })
//   })
//
//   return { result }
// }
//
// module.exports.sellCurrencies = async (ratio, req) => {
//   const result = []
//
//   ratio.forEach(({ amount, currency }) => {
//     const value = util.round(amount * DUMMY_PRICES[currency], 4)
//     result.push({ currency, amount: -amount, value, transactionId })
//   })
//
//   return { result }
// }
//
// module.exports.getPrices = () => {
//   return new Promise((resolve, reject) => {
//     models.settings.findOne().then(setting => {
//       const uri = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + setting.coins.join(',') + '&tsyms=USD'
//
//       Request['get']({
//         uri: uri,
//         json: true
//       }, function (error, response, body) {
//         if (error) return reject(error)
//         resolve(body)
//       })
//     }).catch(reject)
//   })
// }
//
// module.exports.getHistoryMinutes = (coin, currency = 'USD', limit = 59) => {
//   return new Promise((resolve, reject) => {
//     const uri = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + coin + '&tsym=' + currency + '&limit=' + limit
//
//     Request['get']({
//       uri: uri,
//       json: true
//     }, function (error, response, body) {
//       if (error) return reject(error)
//       resolve(body)
//     })
//   })
// }
//
// module.exports.getHistoryHours = (coin, currency = 'USD', limit = 23) => {
//   return new Promise((resolve, reject) => {
//     const uri = 'https://min-api.cryptocompare.com/data/histohour?fsym=' + coin + '&tsym=' + currency + '&limit=' + limit
//
//     Request['get']({
//       uri: uri,
//       json: true
//     }, function (error, response, body) {
//       if (error) return reject(error)
//       resolve(body)
//     })
//   })
// }
//
// module.exports.getHistoryDays = (coin, currency = 'USD', limit = 364) => {
//   return new Promise((resolve, reject) => {
//     const uri = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + coin + '&tsym=' + currency + '&limit=' + limit
//
//     Request['get']({
//       uri: uri,
//       json: true
//     }, function (error, response, body) {
//       if (error) return reject(error)
//       resolve(body)
//     })
//   })
// }
