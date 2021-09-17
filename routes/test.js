/**
 * Created by laslo on 04/10/18.
 */
const router = require('express').Router()
const testController = require('../controller/testController')

router.get('/plaid/reset/:bankAccountId', testController.resetBankToken)
router.get('/prices/daily', testController.pullDailyPrices)

module.exports = router
