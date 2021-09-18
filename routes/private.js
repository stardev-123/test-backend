/**
 * Created by laslo on 07/09/18.
 */

const router = require('express').Router()
const decimalFormatterMiddleware = require('../middleware/decimalFormatterMiddleware')
const userRoutes = require('./user')
const paymentRoutes = require('./payment')
// const deviceRoutes = require('./device')
// const boostRoutes = require('./boost')
const config = require('../config')

const _getAppConfig = (req, res, next) => {
  res.json({
    plaid: {
      key: config.plaid.PUBLIC_KEY,
      end: config.plaid.ENV,
      product: config.plaid.PRODUCT
    },
    precision: config.precision,
    firstInvestmentLimit: config.firstInvestmentLimit,
    allowedStates: config.allowedStates
  })
}

router.use(userRoutes)
router.use(paymentRoutes)
// router.use(deviceRoutes)
// router.use(boostRoutes)
router.get('/config', decimalFormatterMiddleware.formatOutputFields('/config'), _getAppConfig)

module.exports = router
