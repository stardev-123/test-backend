/**
 * Created by laslo on 07/09/18.
 */
const router = require('express').Router()
const verifiedMiddleware = require('../middleware/verifiedMiddleware')
const tradingMiddleware = require('../middleware/tradingMiddleware')
const assetController = require('../controller/assetController')
const decimalFormatterMiddleware = require('../middleware/decimalFormatterMiddleware')

/**
 * @api {post} /user/{userId}/bank
 * Verify Bank Account
 * @apiVersion 1.0.0
 * @apiName Verify Bank Account
 * @apiGroup Payment
 * @apiDescription Verify bank account to connect to your bank account
 *
 * @apiParam (path){String} userId User id
 * @apiParam (body){Object} institution Institution
 * @apiParam (institution){String} name Name of the Institution
 * @apiParam (institution){String} institution_id Id of the Institution
 * @apiParam (body){Object} account Account
 * @apiParam (account){String} id Id of the account
 * @apiParam (account){String} name name of the account
 * @apiParam (account){String} type account type
 * @apiParam (account){String} subtype account sub type
 * @apiParam (account){String} mask account mask
 * @apiParam (body){String} account_id Id of the account
 * @apiParam (body){String} public_token public token
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiParamExample {json} onSuccessResponse Example:
 {
     institution: {
         name: "Bank of America",
         institution_id: "ins_1"
     },
     account: {
         id: "Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKxxoK",
         name: "Plaid Saving",
         type: "depository",
         subtype: "savings",
         mask: "1111"
     },
     account_id: "Rz7GlwB6ZXsZx5zQDPy1C9kygAbL6RfRKxxoK",
     public_token: "public-sandbox-676b6ae1-4a97-47ae-a7f2-8640e0423fe3"
 }
 *
 * @apiSuccess(200) {Number} id Id of the created Bank Account
 * @apiSuccess(200) {String} name Name of the Bank Account
 * @apiSuccess(200) {String} type Type of the Bank Account
 * @apiSuccess(200) {String} subtype of the Bank Account (checking, savings)
 * @apiSuccess(200) {String} mask of the account number
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
     "id": 4,
     "name": "Bank of America - Plaid Saving",
     "type": "depository",
     "subtype": "checking",
     "mask": "0000"
 }
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse badRequest
 * @apiUse notFound
 * @apiUse invalidPaymentData
 */
router.post('/bank', verifiedMiddleware.checkIsUserVerified, assetController.verifyBankAccount)

router.get('/bank', verifiedMiddleware.checkIsUserVerified, assetController.getBankAccounts)

router.get('/bank/:id', verifiedMiddleware.checkIsUserVerified, assetController.getBankAccounts)

router.delete('/bank/:id', verifiedMiddleware.checkIsUserVerified, assetController.removeUserBankAccount)

router.put('/bank/:id/primary', verifiedMiddleware.checkIsUserVerified, assetController.setPrimaryBank)

router.get('/cards', verifiedMiddleware.checkIsUserVerified, assetController.getBankCardAccounts)

router.get('/investment', verifiedMiddleware.checkIsUserVerified, assetController.checkInvestmentAvailability)

/**
 * @api {post} /user/{userId}/investment/portfolio
 * Portfolio investment, it buy crypto currencies in ratio entered in Portfolio
 * @apiVersion 1.0.0
 * @apiName Portfolio Investment
 * @apiGroup Payment
 * @apiDescription Portfolio investment, it buy crypto currencies in ratio entered in Portfolio
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiParam (body){Number} [bankAccountId] id of the bank account
 * @apiParam (body){Number} amount Amount of currency to transfer (USD)
 *
 * @apiUse apiSuccess
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notEnoughMoney
 * @apiUse badRequest
 * @apiUse notFound
 */
router.post('/investment/portfolio',
  decimalFormatterMiddleware.formatInputFields('/investment/portfolio'),
  decimalFormatterMiddleware.formatOutputFields('/investment/portfolio'),
  verifiedMiddleware.checkIsUserVerified,
  tradingMiddleware.checkIsTradingRules,
  assetController.makePortfolioInvestment)

/**
 * @api {post} /user/{userId}/investment/single
 * It buy crypto currency for sent amount
 * @apiVersion 1.0.0
 * @apiName Portfolio Investment
 * @apiGroup Payment
 * @apiDescription It buys crypto currency for sent amount
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiParam (body){Number} [bankAccountId] id of the bank account
 * @apiParam (body){Number} amount Amount of currency to transfer (USD)
 * @apiParam (body){String} crypto Code of the currency to buy, example BTC
 *
 * @apiUse apiSuccess
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notEnoughMoney
 * @apiUse badRequest
 * @apiUse notFound
 */
router.post('/investment/single',
  decimalFormatterMiddleware.formatInputFields('/investment/single'),
  decimalFormatterMiddleware.formatOutputFields('/investment/single'),
  // verifiedMiddleware.checkIsUserVerified,
  // tradingMiddleware.checkIsTradingRules,
  // assetController.makeSingleInvestment
  assetController.buyCryptoCurrency)

/**
 * @api {post} /user/{userId}/payout
 * Withdraw from Onramp wallet, it moves funds to user bank account and reduce the money from user Onramp account
 * @apiVersion 1.0.0
 * @apiName Payout
 * @apiGroup Payment
 * @apiDescription Withdraw from Onramp wallet, it moves funds to user bank account and reduce the money from user Onramp account
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiParam (body){Number} bankAccountId id of the bank account
 * @apiParam (body){Number} amount Amount of currency to transfer (USD)
 *
 * @apiUse apiSuccess
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notEnoughMoney
 * @apiUse badRequest
 * @apiUse notFound
 */
router.post('/payout',
  decimalFormatterMiddleware.formatInputFields('/payout'),
  decimalFormatterMiddleware.formatOutputFields('/payout'),
  verifiedMiddleware.checkIsUserVerified,
  assetController.payOutToUserBank)

/**
 * @api {post} /user/{userId}/sell
 * It sells crypto currency amount
 * @apiVersion 1.0.0
 * @apiName Sell
 * @apiGroup Payment
 * @apiDescription It sells crypto currency amount
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiParam (body){Array} ratio Array of object containing currency and amount of that currency
 *
 * @apiUse apiSuccess
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notEnoughMoney
 * @apiUse badRequest
 * @apiUse notFound
 */
router.post('/sell',
  decimalFormatterMiddleware.formatInputFields('/sell'),
  decimalFormatterMiddleware.formatOutputFields('/sell'),
  // verifiedMiddleware.checkIsUserVerified,
  // tradingMiddleware.checkIsTradingRules,
  // assetController.sellCryptoCurrencies)
  assetController.sellCryptoCurrency)

/**
 * @api {post} /user/{userId}/investment
 * Investment in Onramp wallet, it charges user bank account and put the money to user Onramp account
 * @apiVersion 1.0.0
 * @apiName Investment
 * @apiGroup Payment
 * @apiDescription Investment in Onramp wallet, it charges user bank account and put the money to user Onramp account
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiParam (body){Number} bankAccountId id of the bank account
 * @apiParam (body){Number} amount Amount of currency to transfer (USD)
 *
 * @apiUse apiSuccess
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notEnoughMoney
 * @apiUse badRequest
 * @apiUse notFound
 */
router.post('/investment',
  decimalFormatterMiddleware.formatInputFields('/investment'),
  decimalFormatterMiddleware.formatOutputFields('/investment'),
  verifiedMiddleware.checkIsUserVerified,
  assetController.addFunds)

router.get('/investment/prices',
  decimalFormatterMiddleware.formatOutputFields('/investment/prices'),
  // verifiedMiddleware.checkIsUserVerified,
  assetController.checkTradePrices)

router.get('/prices', decimalFormatterMiddleware.formatOutputFields('/prices'), assetController.getCryptoPrices)

router.get('/histominute', decimalFormatterMiddleware.formatOutputFields('/histominute'), assetController.getHistoryMinutes)
router.get('/histohour', decimalFormatterMiddleware.formatOutputFields('/histohour'), assetController.getHistoryHours)
router.get('/histoday', decimalFormatterMiddleware.formatOutputFields('/histoday'), assetController.getHistoryDays)

router.get('/history/chart', decimalFormatterMiddleware.formatOutputFields('/history/chart'), assetController.getHistoryChart)

router.get('/transactions', decimalFormatterMiddleware.formatOutputFields('/transactions'), verifiedMiddleware.checkIsUserVerified, assetController.getUserTransactions)
router.get('/transaction/:id', decimalFormatterMiddleware.formatOutputFields('/transaction'), verifiedMiddleware.checkIsUserVerified, assetController.getUserTransactionData)

module.exports = router
