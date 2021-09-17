const tradeblockQuicktradeSuccess = require('./tradeblock.quicktrades.sucess')
const tradeblockTradeAcceptedSuccess = require('./tradeblock.trade.accepted.sucess.js')
const tradeblockTradeDetailsSuccess = require('./tradeblock.trade.details.sucess.js')

module.exports = (nock) => {
  nock('https://demo.tradeblock.com/api/v1.1')
    .persist()
    .post('/open_trades')
    .reply(200, () => {
      return tradeblockQuicktradeSuccess
    })

  nock('https://demo.tradeblock.com/api/v1.1')
    .persist()
    .post('/trade')
    .reply(200, () => {
      return tradeblockTradeAcceptedSuccess
    })

  nock('https://demo.tradeblock.com/api/v1.1')
    .persist()
    .get('/trade/yFx8VUJXN4tQLnT8DoVPuJ')
    .reply(200, () => {
      return tradeblockTradeDetailsSuccess
    })
}
