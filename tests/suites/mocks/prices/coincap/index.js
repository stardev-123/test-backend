const coincapPricesSuccess = require('./coincap.prices')

module.exports = (nock) => {
  nock('https://api.coincap.io/v2')
    .persist()
    .get('/assets?ids=bitcoin,ethereum,litecoin,bitcoin-cash')
    .reply(200, () => {
      return coincapPricesSuccess
    })
}
