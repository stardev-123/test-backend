/**
 * Created by laslo on 07/09/18.
 */
const config = require('../../../../config')

module.exports = (nock) => {
  require('./' + config.cryptoProvider)(nock)
}
