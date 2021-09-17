/**
 * Created by laslo on 21.1.19..
 */

module.exports = (nock) => {
  require('./payment')(nock)
  require('./prices')(nock)
  require('./crypto')(nock)
}
