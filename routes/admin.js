/**
 * Created by laslo on 04/10/18.
 */
const router = require('express').Router()
const userMiddleware = require('../middleware/userMiddleware')
const emailMiddleware = require('../middleware/emailMiddleware')
const adminController = require('../controller/adminController')
const assetController = require('../controller/assetController')
const bundleController = require('../controller/bundleController')

router.get('/check', (req, res, next) => { res.send() })

// SETTINGS
router.get('/settings', adminController.getSettings)
router.post('/portfolio', adminController.updateDefaultPortfolio)
router.post('/coins', adminController.updateSupportedCoins)
router.put('/trading/toggle', adminController.enableDisableTrading)
router.put('/trading/postponed/toggle', adminController.enableDisablePostponedTrading)

// PRICES
router.get('/prices/pull/daily', adminController.pullDailyPrices)
router.get('/prices/pull/hourly', adminController.pullHourlyPrices)
router.get('/prices/history/days', adminController.pullHistory)

// TEST
router.get('/investments/process', adminController.processUnfinishedInvestments)
router.get('/emails/init', adminController.initEmailWhiteList)
router.get('/whitelist', adminController.getWhitelists)
router.post('/whitelist', adminController.whitelistEmail)

// USERS
router.get('/user', adminController.findUser)
router.put('/user/:userId/trading/toggle', adminController.enableDisableUserTrading)
router.put('/user/:userId', adminController.updateUser)
router.get('/user/:userId', adminController.userDetails)
router.put('/user/:userId/wallet/:currency', adminController.updateUserWallet)
router.get('/user/:userId/transactions', adminController.userTransactions)
router.get('/user/:userId/activity', userMiddleware.loadUser, assetController.getUserTransactions)
router.get('/user/:userId/activity/:id', userMiddleware.loadUser, assetController.getUserTransactionData)

// BUNDLES
router.get('/bundles', bundleController.getBundles)
router.post('/bundle', bundleController.addBundle)
router.get('/bundle/:bundleId', bundleController.getBundle)
router.put('/bundle/:bundleId', bundleController.updateBundle)
router.delete('/bundle/:bundleId', bundleController.deleteBundle)

// ADMINS
router.get('/admins', adminController.getAdmins)
router.post('/admin', emailMiddleware.checkEmail, adminController.addAdmin)
router.get('/admin/:adminId', adminController.getAdmin)
router.put('/admin/:adminId', emailMiddleware.checkEmail, adminController.updateAdmin)
router.delete('/admin/:adminId', adminController.deleteAdmin)

module.exports = router
