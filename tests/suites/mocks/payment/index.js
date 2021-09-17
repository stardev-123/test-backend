/**
 * Created by laslo on 22.1.19..
 */
/**
 * Created by laslo on 07/09/18.
 */
const config = require('../../../../config')

module.exports = (nock) => {
  require('./' + config.payment)(nock)
}
