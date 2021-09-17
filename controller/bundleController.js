/**
 * Created by laslo on 04/10/18.
 */

const models = require('../database/models')
const error = require('../lib/error')
const logger = require('../lib/logger')

module.exports.getActiveBundles = async (req, res, next) => {
  try {
    const results = await models.bundles.findAllActive({ raw: true })
    res.json(results)
  } catch (err) {
    logger.error(req, err, 'Error pulling all bundles data')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.getBundles = async (req, res, next) => {
  try {
    const results = await models.bundles.findAll({ raw: true })
    res.json(results)
  } catch (err) {
    logger.error(req, err, 'Error pulling all bundles data')
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.getBundle = async (req, res, next) => {
  try {
    const bundle = await models.bundles.findById(req.params.bundleId, { raw: true })
    const coins = await models.bundleCoins.findByBundleId(req.params.bundleId, { raw: true })
    res.json({ bundle, coins })
  } catch (err) {
    logger.error(req, err, 'Error pulling bundle with id ' + req.params.bundleId)
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.addBundle = async (req, res, next) => {
  let t
  try {
    t = await models.sequelize.transaction()
    const bundle = await models.bundles.createOne(req.body.bundle, { transaction: t })
    await models.bundleCoins.bulkCreateForBundleId(bundle.dataValues.id, req.body.coins, { transaction: t })
    await t.commit()
    logger.info(req, 'Successfully created bundle with id' + bundle.id)
    res.json(bundle)
  } catch (err) {
    await t.rollback()
    logger.error(req, err, 'Error adding bundle', req.body)
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.updateBundle = async (req, res, next) => {
  const bundleId = req.params.bundleId
  let t
  try {
    t = await models.sequelize.transaction()
    const found = await models.bundles.findById(bundleId)
    if (!found) return next(error('NOT_FOUND'))
    await models.bundles.updateOne(found, req.body.bundle)
    await models.bundleCoins.deleteForBundleId(bundleId, { transaction: t })
    await models.bundleCoins.bulkCreateForBundleId(bundleId, req.body.coins, { transaction: t })
    await t.commit()
    res.json({ success: true })
  } catch (err) {
    await t.rollback()
    logger.error(req, err, 'Error updating bundle with id ' + bundleId, req.body)
    next(error('INTERNAL_ERROR'))
  }
}

module.exports.deleteBundle = async (req, res, next) => {
  try {
    const found = await models.bundles.findById(req.params.bundleId)
    if (!found) return next(error('NOT_FOUND'))
    await models.bundles.deactivate(found)
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'Error deleting bundle with id ' + req.params.bundleId)
    next(error('INTERNAL_ERROR'))
  }
}
