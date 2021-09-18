/**
 * Created by laslo on 07/09/18.
 */
const config = require('../../config')

// const models = require('../../database/models')
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
exports.getSupportedCoins = _getSupportedCoins

exports.getAllHistoryHours = async (limit) => {
  const coins = await _getSupportedCoins()

  const promises = coins.map(coin => _getCoinHistoryPrices(coin.currency, limit))

  const prices = await Promise.all(promises)
  return prices
}

exports.buyCurrencies = provider.buyCurrencies
exports.sellCurrencies = provider.sellCurrencies
exports.getBalances = provider.getBalances
exports.getCurrentTradePrices = provider.getCurrentTradePrices
exports.tradeCryptoCurrency = provider.tradeCryptoCurrency

exports.getPrices = pricesProvider.getPrices
exports.getHistoryMinutes = pricesProvider.getHistoryMinutes
exports.getHistoryHours = pricesProvider.getHistoryHours
exports.getHistoryDays = pricesProvider.getHistoryDays
exports.getHistoryPriceOnDay = pricesProvider.getHistoryPriceOnDay