/**
 * Here you can place your jobs which should be executed once a month
 */

const sparechange = require('../../tasks/boost/sparechange')
const recurring = require('../../tasks/boost/recurring')

module.exports = {
  recurring: () => {
    recurring.run()
  },
  sparechange: () => {
    sparechange.monthlyPreCharge()
  }
}
