const router = require('express').Router()
const decimalFormatterMiddleware = require('../middleware/decimalFormatterMiddleware')
const userController = require('../controller/userController')
// const bundleController = require('../controller/bundleController')

router.put('/logout', userController.logout)

/**
 * @api {post} user/{userId}/sendCode
 * Send Verification Code
 * @apiVersion 1.0.0
 * @apiName Send Verification Code
 * @apiGroup User
 * @apiDescription Send verification code via sms to users entered phone
 *
 * @apiParam (body){String} phone User phone number
 *
 * @apiSuccess (200) {Boolean} success is the API successfully executed
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
     "success": true
 }
 *
 * @apiUse badRequest
 * @apiUse notFound
 */
router.post('/sendCode', userController.addPhone)

/**
 * @api {post} user/{userId}//verifyCode
 * Verify code
 * @apiVersion 1.0.0
 * @apiName Verify Code
 * @apiGroup User
 * @apiDescription Check if code entered is equal to code sent via sms
 *
 * @apiParam (body){Number} code Verification code
 *
 * @apiSuccess (200) {Boolean} success is the API successfully executed
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
     "success": true
 }
 *
 * @apiUse badRequest
 * @apiUse notFound
 * @apiUse verificationCodeExpired
 * @apiUse invalidVerificationCode
 */
router.post('/verifyCode', userController.verifyPhone)

/**
 * @api {post} user/{userId}//verifyPhone
 * Verify code
 * @apiVersion 1.0.0
 * @apiName Verify Code
 * @apiGroup User
 * @apiDescription Check if code entered is equal to code sent via sms
 *
 * @apiParam (body){Number} code Verification code
 *
 * @apiSuccess (200) {Boolean} success is the API successfully executed
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
     "success": true
 }
 *
 * @apiUse badRequest
 * @apiUse notFound
 * @apiUse verificationCodeExpired
 * @apiUse invalidVerificationCode
 */
router.post('/verifyPhone', userController.verifyPhone)

/**
 * @api {post} user/{userId}/phone
 * Add Phone to user account, it send verification code
 * @apiVersion 1.0.0
 * @apiName Add Phone to user account
 * @apiGroup User
 * @apiDescription Send verification code via sms to users entered phone
 *
 * @apiParam (body){String} phone User phone number
 *
 * @apiSuccess (200) {Boolean} success is the API successfully executed
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
     "success": true
 }
 *
 * @apiUse badRequest
 * @apiUse notFound
 */
router.post('/phone', userController.addPhone)

router.post('/verify', userController.resendVerificationCode)

router.post('/password/change', userController.changeUserPassword)

/**
 * Have user accepted or not Terms Of Services
 */
router.post('/tos', userController.tos)

/**
 * @api {get} /user/{userId}
 * User Basic Info
 * @apiVersion 1.0.0
 * @apiName User Basic Info
 * @apiGroup User
 * @apiDescription Get user basic info
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiSuccess (200) {String} firstName User first name
 * @apiSuccess (200) {String} lastName User last name
 * @apiSuccess (200) {String} email User email
 * @apiSuccess (200) {String} phoneNumber User phone number
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
     "firstName": "test",
     "lastName": "test",
     "email": "test1@gmail.com",
     "phoneNumber": "+381614495993"
 }
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notFound
 */
router.get('', decimalFormatterMiddleware.formatOutputFields('/basic'), userController.basicInfo)

/**
 * @api {put} /user/{userId}
 * Update User Basic Info
 * @apiVersion 1.0.0
 * @apiName Update User Basic Info
 * @apiGroup User
 * @apiDescription Update user basic info
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiSuccess (200) {String} firstName User first name
 * @apiSuccess (200) {String} lastName User last name
 * @apiSuccess (200) {String} email User email
 * @apiSuccess (200) {String} phoneNumber User phone number
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
    "id": 16,
    "firstName": "Laslo",
    "lastName": "Horvat",
    "email": "laslo.horvat26@gmail.com",
    "password": "$2a$08$BorsXqYrPtTLLPlAFFCqn.9T/RnL3gYh/4dTWqxG4.YT.y4YSoO9i",
    "phoneNumber": null,
    "birthdate": "1981-02-01",
    "address1": "221 Corrected Address St.",
    "address2": "Fl 8",
    "city": "Ridgewood",
    "state": "NY",
    "zipcode": "11385",
    "ssn": "1516",
    "verificationCode": "",
    "verificationCodeExpirationDate": null,
    "verified": true,
    "customerId": "a8d891e0-07c0-4501-837b-7134f891b496",
    "createdAt": "2018-10-17T09:54:35.000Z",
    "updatedAt": "2018-10-17T10:08:36.000Z"
 }
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notFound
 */
router.put('', userController.updateBasicInfo)

/**
 * @api {get} /user/{userId}/portfolio
 * Get User Portfolio
 * @apiVersion 1.0.0
 * @apiName Get User Portfolio
 * @apiGroup User
 * @apiDescription Get user portfolio
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 [
     {
         "id": 1,
         "name": "Bitcoin",
         "code": "BTC",
         "percent": 66.86
     },
     {
         "id": 2,
         "name": "Ethereum",
         "code": "ETH",
         "percent": 22.28
     },
     {
         "id": 3,
         "name": "Ripple",
         "code": "XRP",
         "percent": 1.21
     },
     {
         "id": 4,
         "name": "Litecoin",
         "code": "LTC",
         "percent": 2.22,
     },
     {
         "id": 5,
         "name": "EOS",
         "code": "EOS",
         "percent": 1.2
     },
     {
         "id": 6,
         "name": "Bitcoin Cash",
         "code": "BCH",
         "percent": 6.23
     }
 ]
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notFound
 * @apiUse notAllowed
 */
router.get('/portfolio', decimalFormatterMiddleware.formatOutputFields('/portfolio'), userController.getPortfolio)

/**
 * @api {put} /user/{userId}/portfolio
 * Update User Portfolio
 * @apiVersion 1.0.0
 * @apiName Update User Portfolio
 * @apiGroup User
 * @apiDescription Update user portfolio,
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiParam (body){Array} portfolio User's updated portfolio investments
 * @apiParamExample {json} portfolio Example:
 {
    "portfolio": [
     {
         "id": 1,
         "name": "Bitcoin",
         "code": "BTC",
         "percent": 66.86
     },
     {
         "id": 2,
         "name": "Ethereum",
         "code": "ETH",
         "percent": 22.28
     },
     {
         "id": 3,
         "name": "Ripple",
         "code": "XRP",
         "percent": 1.21
     },
     {
         "id": 4,
         "name": "Litecoin",
         "code": "LTC",
         "percent": 2.22,
     },
     {
         "id": 5,
         "name": "EOS",
         "code": "EOS",
         "percent": 1.2
     },
     {
         "id": 6,
         "name": "Bitcoin Cash",
         "code": "BCH",
         "percent": 6.23
     }
    ]
 }
 * @apiSuccess (200) {Boolean} success true
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
     "success": true
 }
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse notFound
 */
router.put('/portfolio', decimalFormatterMiddleware.formatOutputFields('/portfolio/update'), userController.updatePortfolio)

/**
 * @api {get} /user/{userId}/balance
 * Account Balance
 * @apiVersion 1.0.0
 * @apiName Account Balance
 * @apiGroup User
 * @apiDescription Get account balance
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 [
   {
       "currency": "BTC",
       "amount": 3.0986,
       "userId": 1,
       "createdAt": "2018-09-10T06:50:09.000Z",
       "updatedAt": "2018-09-10T06:58:57.000Z"
   },
   {
       "currency": "USD",
       "amount": 0,
       "userId": 1,
       "createdAt": "2018-09-07T14:26:21.000Z",
       "updatedAt": "2018-09-10T06:58:57.000Z"
   }
 ]
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse badRequest
 * @apiUse notFound
 */
router.get('/balance', decimalFormatterMiddleware.formatOutputFields('/balance'), userController.getBalance)

router.get('/balance/history', decimalFormatterMiddleware.formatOutputFields('/balance/history'), userController.getBalanceHistory)

/**
 * @api {get} /user/{userId}/coins
 * Supported coins
 * @apiVersion 1.0.0
 * @apiName Supported coins
 * @apiGroup User
 * @apiDescription Get Supported crypto coins
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 ["BTC","BCH","XBT","ETH","XRP","LTC"]
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse badRequest
 * @apiUse notFound
 */
router.get('/coins', userController.getSupportedCoins)

/**
 * @api {get} /user/{userId}/bundles
 * Get Investment bundles
 * @apiVersion 1.0.0
 * @apiName Get Investment bundles
 * @apiGroup User
 * @apiDescription Get Active Investment bundles
 *
 * @apiParam (path){String} userId User id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse badRequest
 */
// router.get('/bundles', bundleController.getActiveBundles)

/**
 * @api {get} /user/{userId}/bundle/{bundleId}
 * Get bundle data
 * @apiVersion 1.0.0
 * @apiName Get bundle data
 * @apiGroup User
 * @apiDescription Get bundle data
 *
 * @apiParam (path){String} userId User id
 * @apiParam (path){String} bundleId Bundle id
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 *
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse badRequest
 * @apiUse notFound
 */
// router.get('/bundle/:bundleId', decimalFormatterMiddleware.formatOutputFields('/bundle'), bundleController.getBundle)

router.put('/verify', userController.verifyUser)

router.put('/investment/skip', userController.skippedFirstInvestment)
router.put('/residence/confirm', userController.confirmedResidence)

module.exports = router
