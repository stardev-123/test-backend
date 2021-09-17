/**
 * Here you can place your jobs which should be executed once a year
 */

const sparechange = require('../../tasks/boost/sparechange')

module.exports = {
  sprachange: () => {
    sparechange.monthlyCharge()
  }
}
