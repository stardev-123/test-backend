/**
 * Here you can place your jobs which should be executed once a day
 */

const recurring = require('../../tasks/boost/recurring')
const sparechange = require('../../tasks/boost/sparechange')
const prices = require('../../tasks/market/prices')

module.exports = {
  sparechange: () => {
    sparechange.dailyPull()
  },
  prices: () => {
    prices.pullAndUpdateDailyPrices()
  },
  notify: () => {
    recurring.notify()
  }
}
