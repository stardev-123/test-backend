/**
 * Created by laslo on 6.12.18..
 */
/**
 * Created by laslo on 16/11/18.
 */

// const models = require('../../database/models')
const util = require('../../lib/util')
const moment = require('moment')
const { processEventForNotification, EVENTS } = require('../notificationManager')
// const boostManager = require('../boostManager')

// const user = { id: 1, email: 'laslo.horvat@gmail.com', firstName: 'Laslo', lastName: 'Horvat' }
const user = { id: 1, email: 'rohan@interactivelabs.com', firstName: 'Rohan', lastName: 'Sardesai' }
// const link = config.serverUrl + 'confirm?token=tralaalalla'
const config = require('../../config')
config.serverUrl = 'https://api-staging.onrampinvest.com/'

const req = util.returnBatchRequest()
req.user = user

const _test = async () => {
  // await processEventForNotification(req, user, EVENTS.EMAIL_CONFIRMATION, link)
  // //
  // await processEventForNotification(req, user, EVENTS.FIRST_EMAIL_REGISTRATION)
  //
  // await processEventForNotification(req, user, EVENTS.FORGOT_PASSWORD, link)
  // //
  // const investmentTransactions = await models.investmentTransaction.findForInvestmentId(1, { raw: true })
  // await processEventForNotification(req, user, EVENTS.FIRST_INVESTMENT, { investments: investmentTransactions, amount: 4000 })

  // await processEventForNotification(req, user, EVENTS.SIGNUP_SPARECHANGE, [{name: 'First Card', mask: '2342'}, {name: 'Second Card', mask: '8868'}, {name: 'Third Card', mask: '4455'}])
  //
  // await processEventForNotification(req, user, EVENTS.SIGNUP_RECURRING, 1000)
  //
  // await processEventForNotification(req, user, EVENTS.CANCEL_SPARECHANGE)
  //
  // await processEventForNotification(req, user, EVENTS.CANCEL_RECURRING)
  // //
  // await processEventForNotification(req, user, EVENTS.ADD_FUNDS_COMPLETED, 1000)
  // // //
  // //
  // await processEventForNotification(req, user, EVENTS.CONFIRM_NEW_INVESTMENT, { investments: investmentTransactions, amount: 4000 })
  // // //
  // const sellTransactions = await models.investmentTransaction.findForInvestmentId(2, { raw: true })
  // await processEventForNotification(req, user, EVENTS.CONFIRM_SALE_OF_CRYPTO, { coins: sellTransactions, value: 3.96 })
  //
  // await processEventForNotification(req, user, EVENTS.WITHDRAWAL_OF_FUNDS)
  //
  // await processEventForNotification(req, user, EVENTS.INSUFFICIENT_FUND_FOR_SPARECHANGE)
  //
  // await processEventForNotification(req, user, EVENTS.INSUFFICIENT_FUND_FOR_RECURRING)
  // req.user = user
  // const recurrings = await models.recurring.findForUserId(1)
  // if (recurrings.length > 0) boostManager.notifyForRecurring(req, recurrings[0].dataValues)

  // const sparechange = await models.sparechange.findForUserId(1)
  // boostManager.notifyForSparechange(req, sparechange.dataValues)
  // const date = moment().add(2, 'days').format('MM/DD/YYYY')
  // await processEventForNotification(req, user, EVENTS.NOTIFY_FOR_SPARECHANGE, {
  //   amount: 54.26,
  //   date,
  //   masks: ['0001', '0002']
  // })
  // await processEventForNotification(req, user, EVENTS.CUSTOMER_CREATED)
  // await processEventForNotification(req, user, EVENTS.CUSTOMER_SUSPENDED)
  // await processEventForNotification(req, user, EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_NEEDED)
  // await processEventForNotification(req, user, EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_UPLOADED)
  // await processEventForNotification(req, user, EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_APPROVED)
  // await processEventForNotification(req, user, EVENTS.CUSTOMER_VERIFICATION_DOCUMENT_FAILED)
  // //
  // await processEventForNotification(req, user, EVENTS.CUSTOMER_FUNDING_SOURCE_ADDED, { institution: 'Chase', bankAccount: 'Saving', date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_FUNDING_SOURCE_REMOVED, { bankAccount: 'Chase', source: 'Saving', date: moment().format('MM/DD/YYYY') })
  // await processEventForNotification(req, user, EVENTS.CUSTOMER_FUNDING_SOURCE_VERIFIED, { bankAccount: 'Chase', source: 'Saving', date: moment().format('MM/DD/YYYY') })

  await processEventForNotification(req, user, EVENTS.CUSTOMER_INVESTMENT_CREATED, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_INVESTMENT_CANCELLED, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_INVESTMENT_FAILED, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_INVESTMENT_COMPLETED, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })

  await processEventForNotification(req, user, EVENTS.CUSTOMER_WITHDRAW_CREATED, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_WITHDRAW_CANCELLED, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_WITHDRAW_FAILED, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_WITHDRAW_COMPLETED, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })

  await processEventForNotification(req, user, EVENTS.CUSTOMER_INVESTMENT_CREATED_RS, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_INVESTMENT_CANCELLED_RS, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_INVESTMENT_FAILED_RS, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_INVESTMENT_COMPLETED_RS, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })

  await processEventForNotification(req, user, EVENTS.CUSTOMER_WITHDRAW_CREATED_RS, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_WITHDRAW_CANCELLED_RS, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_WITHDRAW_FAILED_RS, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
  await processEventForNotification(req, user, EVENTS.CUSTOMER_WITHDRAW_COMPLETED_RS, { transferType: 'ACH Transfer', source: 'Chase - Saving', amount: util.format(100, 2), date: moment().format('MM/DD/YYYY') })
}

try {
  setTimeout(() => {
    _test()
  }, 3000)
} catch (e) {
  console.log(e)
}
