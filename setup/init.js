/**
 * Created by laslo on 04/10/18.
 */

const constants = require('./../lib/constants')
const paymentManager = require('../managers/payment')
const models = require('../database/models')
const logger = require('../lib/logger')

module.exports.initializeData = async () => {
  let setting = await models.settings.findOne()
  if (!setting) setting = await models.settings.createOne({})
  if (!setting.webhookId) {
    const createdHook = await paymentManager.createWebHook()
    const subscriptionsString = 'subscriptions/'
    const webhookId = createdHook.slice(createdHook.indexOf(subscriptionsString) + subscriptionsString.length)
    await models.settings.updateOne(setting, { webhookId: webhookId })
  } else {
    logger.system(null, 'WebHook is already created')
  }
  if (!setting.portfolio) {
    logger.info(null, 'No portfolio in settings, creating')
    await models.settings.updateOne(setting, { portfolio: constants.CRYPTOCURRENCIES })
  } else {
    logger.system(null, 'Portfolio is already in settings')
  }
  if (!setting.coins) {
    logger.info(null, 'No supported coins in settings, creating')
    await models.settings.updateOne(setting, { coins: constants.CRYPTOCURRENCIES.map((data) => data.currency) })
  } else {
    logger.system(null, 'Suppored coins is already in settings')
  }
  logger.system(null, 'Initialization finished')
}
