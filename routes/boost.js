/**
 * Created by laslo on 07/09/18.
 */
const router = require('express').Router()
const verifiedMiddleware = require('../middleware/verifiedMiddleware')
const boostController = require('../controller/boostController')
const decimalFormatterMiddleware = require('../middleware/decimalFormatterMiddleware')

/**
 * @api {post} /user/{userId}/recurring
 * Subscribe user to recurring payment
 * @apiVersion 1.0.0
 * @apiName Investment
 * @apiGroup Payment
 * @apiDescription Subscribe user to recurring payment
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiParam (body){Number} bankAccountId id of the bank account
 * @apiParam (body){Number} amount Amount of currency for subscription (USD)
 * @apiParam (body){String} [currency] Currency for subscription (USD)
 *
 * @apiUse apiSuccess
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notEnoughMoney
 * @apiUse badRequest
 * @apiUse notFound
 */
router.post('/recurring',
  decimalFormatterMiddleware.formatInputFields('/recurring'),
  decimalFormatterMiddleware.formatOutputFields('/recurring'),
  verifiedMiddleware.checkIsUserVerified,
  boostController.createRecurringPayment)

router.get('/recurrings', decimalFormatterMiddleware.formatOutputFields('/recurrings'), verifiedMiddleware.checkIsUserVerified, boostController.getRecurringPayments)

router.delete('/recurring/:recurringId', verifiedMiddleware.checkIsUserVerified, boostController.stopRecurringPayments)

/**
 * @api {post} /user/{userId}/sparechange
 * Subscribe user to sparechange payment
 * @apiVersion 1.0.0
 * @apiName Investment
 * @apiGroup Payment
 * @apiDescription Subscribe user to sparechange payment
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiParam (body){Number} bankAccountId id of the bank account
 * @apiParam (body){String} [currency] Currency for subscription (USD)
 *
 * @apiUse apiSuccess
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse badRequest
 * @apiUse notFound
 */
router.post('/sparechange', decimalFormatterMiddleware.formatOutputFields('/sparechange'), verifiedMiddleware.checkIsUserVerified, boostController.createUpdateSparechange)

router.get('/sparechange', decimalFormatterMiddleware.formatOutputFields('/sparechange'), verifiedMiddleware.checkIsUserVerified, boostController.getSparechanges)

router.put('/sparechange/:id', decimalFormatterMiddleware.formatOutputFields('/sparechange'), verifiedMiddleware.checkIsUserVerified, boostController.addAccountToSpearchange)
router.delete('/sparechange/:id/account/:accountId', decimalFormatterMiddleware.formatOutputFields('/sparechange'), verifiedMiddleware.checkIsUserVerified, boostController.removeAccountFromSparechange)

router.get('/sparechanges/test/daily', verifiedMiddleware.checkIsUserVerified, boostController.testDailySparechange)
router.get('/sparechanges/test/monthly', verifiedMiddleware.checkIsUserVerified, boostController.testMonthlySparechange)

module.exports = router
