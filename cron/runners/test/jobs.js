/**
 * Here you can place your jobs which should be executed once in 5 minutes
 */
const recurring = require('../../tasks/boost/recurring')

module.exports = {
  test1: () => {
    recurring.test()
  }
  // test2:  () => {
  //   failedReCharge.run()
  // }
}
