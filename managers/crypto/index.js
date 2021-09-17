/**
 * Created by laslo on 07/09/18.
 */
const config = require('../../config')

const models = require('../../database/models')
const provider = require('./' + config.cryptoProvider)
const pricesProvider = require('./prices/' + config.cryptoPricesProvider)

const _getCoinHistoryPrices = async (coin, limit) => {
  const prices = await pricesProvider.getHistoryHours(coin, null, limit)
  return { coin, prices }
}

const _getSupportedCoins = async () => {
  const setting = await models.settings.findOne({ attributes: ['coins'] })
  return setting.coins.map(({ currency, name, icon, description }) => ({ currency, name, icon, description }))
}
module.exports.getSupportedCoins = _getSupportedCoins

module.exports.getAllHistoryHours = async (limit) => {
  const coins = await _getSupportedCoins()

  const promises = coins.map(coin => _getCoinHistoryPrices(coin.currency, limit))

  const prices = await Promise.all(promises)
  return prices
}

module.exports.buyCurrencies = provider.buyCurrencies
module.exports.sellCurrencies = provider.sellCurrencies
module.exports.getBalances = provider.getBalances
module.exports.getCurrentTradePrices = provider.getCurrentTradePrices
module.exports.tradeCryptoCurrency = provider.tradeCryptoCurrency

module.exports.getPrices = pricesProvider.getPrices
module.exports.getHistoryMinutes = pricesProvider.getHistoryMinutes
module.exports.getHistoryHours = pricesProvider.getHistoryHours
module.exports.getHistoryDays = pricesProvider.getHistoryDays
module.exports.getHistoryPriceOnDay = pricesProvider.getHistoryPriceOnDay