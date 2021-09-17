/**
 * Here you can place your jobs which should be executed once per hour
 */

const checkUnfinishedTrades = require('../../tasks/transactions/checkUnfinishedTrades')
const prices = require('../../tasks/market/prices')

module.exports = {
  // investments: () => {
  //   checkUnfinishedTrades.run()
  // },
  // prices: () => {
  //   prices.pullHourlyPrices()
  // }
}
