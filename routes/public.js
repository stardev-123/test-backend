/**
 * Created by laslo on 03/09/18.
 */
const router = require('express').Router()
const userController = require('../controller/userController')
// const webhookController = require('../controller/webhookController')
const emailMiddleware = require('../middleware/emailMiddleware')
// const auth = require('../middleware/authMiddleware')
const decimalFormatterMiddleware = require('../middleware/decimalFormatterMiddleware')

/**
 * Health check route
 */
router.get('/', (req, res, next) => { res.send() })

router.post('/email', emailMiddleware.checkEmail, emailMiddleware.checkIsWhitelisted, emailMiddleware.checkEmailAvailability)

/**
 * @api {post} /register
 * Register
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup User
 * @apiDescription Register new user
 *
 * @apiParam (body){String} email User email
 * @apiParam (body){String} password User password, must be at least 8 characters long and contain a number or an upper case letter
 * @apiParam (body){String} firstName User firstname
 * @apiParam (body){String} lastName User lastname
 *
 * @apiSuccess (200) {String} token User request token
 * @apiSuccess (200) {Object} user User base data
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQGdtYWlsLmNvbSIsInVzZXJJZCI6MSwiaWF0IjoxNTM1Mzc5MDUwLCJleHAiOjE1MzU0NjU0NTB9.HgCzGNTvoRW2-e2y3pwBNYyGYKQsOQQKRLjfWjS3aeU",
     "user": {
         "id": 1,
         "firstName": "test",
         "lastName": "test",
         "email": "test1@gmail.com",
         "phoneNumber": "+381611195992"
     }
 }
 *
 * @apiUse badRequest
 * @apiUse alreadyRegistered
 */
router.post('/register', decimalFormatterMiddleware.formatOutputFields('/register'), emailMiddleware.checkEmail, emailMiddleware.checkIsWhitelisted, userController.register)

/**
 * @api {post} /login
 * Login
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup User
 * @apiDescription If email and password are valid get user data and token
 *
 * @apiParam (body){String} email User email
 * @apiParam (body){String} password User password
 * @apiParam (body){String} deviceId Unique Id of the device
 *
 * @apiSuccess (200) {String} token User request token
 * @apiSuccess (200) {Object} user User base data
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQGdtYWlsLmNvbSIsInVzZXJJZCI6MSwiaWF0IjoxNTM1Mzc5MDUwLCJleHAiOjE1MzU0NjU0NTB9.HgCzGNTvoRW2-e2y3pwBNYyGYKQsOQQKRLjfWjS3aeU",
            "user": {
                "id": 1,
                "firstName": "test",
                "lastName": "test",
                "email": "test1@gmail.com",
                "phoneNumber": "+381611195992"
            }
        }
 *
 * @apiUse badRequest
 * @apiUse notFound
 * @apiUse invalidCredentials
 * @apiUse notVerified
 */
router.post('/login', decimalFormatterMiddleware.formatOutputFields('/login'), emailMiddleware.checkEmail, userController.login)

router.post('/forgot', emailMiddleware.checkEmail, userController.forgotPassword)

router.get('/forgot', 
// auth.checkForgothPasswordLink, 
userController.generatePassword)
// router.post('/password/reset', auth.checkForgothPasswordLink, userController.resetPassword)

// router.get('/confirm', auth.checkEmailConfirmationLink)

// Dwolla send data on this route
// router.post('/webhook', webhookController.processWebHook)

// router.get('/user/:userId/token', auth.checkUserRefreshToken, userController.refreshAccessTokens)
router.get('/user/:userId/token', userController.refreshAccessTokens)

router.get('/test', userController.test)

module.exports = router
