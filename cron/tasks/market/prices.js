/**
 * Created by laslo on 22/11/18.
 */

const moment = require('moment')
// const models = require('../../../database/models')
const util = require('../../../lib/util')
const cryptoManager = require('../../../managers/crypto')
const logger = require('../../../lib/logger')

const _updatePriceForDayBefore = async (req) => {
  try {
    const supportedCoins = await cryptoManager.getSupportedCoins()
    const coins = supportedCoins.map(data => data.currency)
    const date = moment().subtract(1, 'day')

    const promises = coins.map(coin => cryptoManager.getHistoryPriceOnDay(coin, null, date))

    const promiseResult = await Promise.all(promises)
    const result = promiseResult.map(result => result[0])
    const priceHistory = result.map(({ coin, price }) => ({ currency: coin, price, date }))
    await models.priceHistory.bulkCreate(priceHistory, { updateOnDuplicate: ['price'] })
    logger.debug(req, 'Successfully updated price for day before')
  } catch (err) {
    logger.error(req, err, 'Error updating price for day before')
  }
}

/**
 * Task entry point
 */
const _pullDailyPrices = async (req) => {
  try {
    logger.info(req, 'processing daily prices pull')
    const supportedCoins = await cryptoManager.getSupportedCoins()
    const coins = supportedCoins.map(data => data.currency)

    if (coins && coins.length > 0) {
      logger.info(req, 'Processing daily prices for supported coins')

      const today = new Date()
      const prices = await cryptoManager.getPrices()
      const priceHistory = prices.map(({ symbol, USD }) => {
        return {
          currency: symbol,
          price: USD,
          date: today
        }
      })
      await models.priceHistory.bulkCreate(priceHistory, { updateOnDuplicate: ['price'] })

      logger.info(req, 'finished processing daily prices for supported coins')
    } else {
      logger.info(req, 'No coins for processing')
    }
  } catch (err) {
    logger.error(req, err, 'Failed to do processing daily prices for supported coins')
  }
}

const _pullAndUpdateDailyPrices = async () => {
  const req = util.returnBatchRequest()
  await _pullDailyPrices(req)
  await _updatePriceForDayBefore(req)
}

/**
 * Task entry point
 */
const _pullHourlyPrices = async () => {
  const req = util.returnBatchRequest()
  try {
    logger.info(req, 'processing hourly prices pull')
    const hourlyPrices = await cryptoManager.getAllHistoryHours(24)

    if (hourlyPrices && hourlyPrices.length > 0) {
      logger.info(req, 'Processing hourly prices for supported coins')

      let earliestTime = new Date().getTime()
      const pricesHourlyHistory = []
      hourlyPrices.forEach(({ coin, prices }) => {
        prices.forEach(({ time, price }) => {
          if (time < earliestTime) earliestTime = time / 1000
          pricesHourlyHistory.push({ currency: coin, price, time: Number(time / 1000) })
        })
      })

      await models.priceHourlyHistory.bulkCreate(pricesHourlyHistory, { updateOnDuplicate: ['price'] })
      // keeping last 30 days hourly history
      const deleteTime = moment().startOf('hour').subtract(24 * 30, 'hours').unix()
      await models.priceHourlyHistory.deleteOlderThenTime(deleteTime)

      await _pullDailyPrices(req) // update todays daily price at every hour
      logger.info(req, 'finished processing hourly prices for supported coins')
    } else {
      logger.info(req, 'No coins for processing')
    }
  } catch (err) {
    logger.error(req, err, 'Failed to do processing hourly prices for supported coins')
  }
}

exports.pullAndUpdateDailyPrices = _pullAndUpdateDailyPrices
exports.pullHourlyPrices = _pullHourlyPrices
