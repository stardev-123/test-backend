/**
 * Created by laslo on 07/09/18.
 */

const plaidManager = require('./plaid')
const dwollaManager = require('./dwolla')

exports.getAccessTokenFromPublic = plaidManager.getAccessTokenFromPublic
exports.bindBankAccountToDwolla = plaidManager.bindBankAccountToDwolla
exports.getBalance = plaidManager.getBalance
exports.getBankTransactions = plaidManager.getTransactions
exports.getBankAccounts = plaidManager.getAccounts
exports.getIdentity = plaidManager.getIdentity

exports.chargeUser = dwollaManager.chargeUser
exports.payOutToUser = dwollaManager.payOutToUser
exports.getTransactionById = dwollaManager.getTransactionById
exports.createWebHook = dwollaManager.createWebHook
exports.deleteAllWebHooks = dwollaManager.deleteAllWebHooks
exports.createCustomer = dwollaManager.createCustomer
exports.updateCustomer = dwollaManager.updateCustomer
