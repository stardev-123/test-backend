/**
 * Created by laslo on 20/09/18.
 */
 const error = require('../../../lib/error')
 const config = require('../../../config')
 const util = require('../../../lib/util')
 const logger = require('../../../lib/logger')
 
 const { API_KEY, API_SECRET } = config.gemini
 
 import Gemini from 'gemini-api-node';
import { result } from 'lodash';
 const constants = require('../../../lib/constants')
 const investmentManager = require('../../investmentManager')

 const geminiAPI = new Gemini({key: API_KEY, secret: API_SECRET, sandbox: true})
 
 const { STATUS, TYPE } = constants.INVESTMENTS_TRANSACTIONS
 
 const _getTradeBlockSymbol = (symbol) => {
   if (symbol === 'BTC') return 'XBT'
   else return symbol
 }
 
 const _convertFromTradeBlockSymbol = (symbol) => {
   if (symbol === 'XBT') return 'BTC'
   else return symbol
 }
 
 const _acceptSellQuickTrade = async (userId, investmentId, asset, single, assetTrade, req) => {
   const { currency, value, settled = 0 } = asset // here value resporesent volume of crypto coin
   const { counterparty_id: counterpartyId, current_id: currentId } = assetTrade
   const result = await geminiAPI.acceptQuickTrade({
     users: counterpartyId,
     side: 'sell',
     quick: currentId,
     volume: value - settled,
     asset: assetTrade.asset
   })
   let transactionId; let volume = 0; let sellValue = 0
   if (result && result.trades && result.trades.length > 0) {
     // TODO add bank account data
     // TODO add support for multiple trades
     // const tradePromises = result.trades.map(trade => {
     //
     // })
     const trade = await geminiAPI.getTrade(result.trades[0].trade_id)
     transactionId = trade.id
     volume = Number(trade.volume)
     sellValue = Number(trade.value)
     await investmentManager.investmentTransactionCreate({
       userId,
       investmentId,
       providerTransactionId: transactionId,
       type: TYPE.SELL,
       currency,
       volume,
       amount: sellValue,
       status: STATUS.DONE,
       price: trade.price
     }, req)
   }
 
   return { currency, volume: -volume, value: sellValue, transactionId, investmentId, single }
 }
 
 const _acceptBuyQuickTrade = async (userId, investmentId, asset, single, assetTrade, req) => {
   const { currency, value, settled = 0 } = asset // here value represents the desired volume od USD to invest in crypto coins
   const { counterparty_id: counterpartyId, current_id: currentId } = assetTrade
   const result = await geminiAPI.acceptQuickTrade({
     users: counterpartyId,
     side: 'buy',
     quick: currentId,
     value: value - settled,
     asset: assetTrade.asset
   })
   let transactionId; let volume = 0
   if (result && result.trades && result.trades.length > 0) {
     // TODO add bitcoin address
     // TODO add support for multiple trades
     // const tradePromises = result.trades.map(trade => {
     //
     // })
     const trade = await geminiAPI.getTrade(result.trades[0].trade_id)
     transactionId = trade.id
     volume = Number(trade.volume)
     await investmentManager.investmentTransactionCreate({
       userId,
       investmentId,
       providerTransactionId: transactionId,
       type: TYPE.BUY,
       currency,
       volume,
       amount: value,
       status: STATUS.DONE,
       price: trade.price
     }, req)
   }
   return { currency, volume, transactionId, investmentId, single }
 }
 
 const _checkPricesChange = (quickTrades, coinPrices, priceField) => {
   if (!config.checkPriceDifference || !coinPrices || !Array.isArray(coinPrices) || coinPrices.length === 0) return
   const differences = []
   quickTrades.forEach(assetTrade => {
     const lastPrice = coinPrices.find(elem => elem.currency === _convertFromTradeBlockSymbol(assetTrade.asset))
     if (!lastPrice || Math.abs(lastPrice[priceField] - assetTrade[priceField]) > config.checkPriceDifference) {
       differences.push({
         currency: _convertFromTradeBlockSymbol(assetTrade.asset),
         lastPrice: util.format(lastPrice ? lastPrice[priceField] : 0, 2),
         newPrice: util.format(assetTrade[priceField], 2)
       })
     }
   })
   if (differences.length > 0) {
     throw error('CRYPTO_PRICE_CHANGED', differences)
   }
 }
 
 exports.buyCurrencies = async ({ id, assets, userId, single }, coinPrices, req) => {
   // pull not done currencies
   const currencies = assets.filter(elem => !elem.done && elem.value >= elem.settled).map(asset => asset.currency)
   const btcIndex = currencies.indexOf('BTC')
   if (btcIndex > -1) currencies.splice(btcIndex, 1, 'XBT')
   const quickTrades = await geminiAPI.getTradeHistory(currencies)
   if (!quickTrades || !Array.isArray(quickTrades)) {
     throw error('CRYPTO_SERVICE_IS_DOWN', quickTrades)
   }
   _checkPricesChange(quickTrades, coinPrices, 'buy_price')
   const promises = assets.map(asset => {
     if (!asset.done) {
       const assetTrade = quickTrades.find(elem => elem.asset === _getTradeBlockSymbol(asset.currency))
       if (assetTrade) {
         return _acceptBuyQuickTrade(userId, id, asset, single, assetTrade, req)
       } else return Promise.resolve()
     } else return Promise.resolve()
   })
   const result = await Promise.all(promises)
   return result
 }
 
 exports.sellCurrencies = async ({ id, assets, userId, single }, coinPrices, req) => {
   // pull not done currencies
   const currencies = assets.filter(elem => !elem.done && elem.value >= elem.settled).map(asset => asset.currency)
   const btcIndex = currencies.indexOf('BTC')
   if (btcIndex > -1) currencies.splice(btcIndex, 1, 'XBT')
 
   const quickTrades = await geminiAPI.getTradeHistory(currencies)
   if (!quickTrades || !Array.isArray(quickTrades)) {
     throw error('CRYPTO_SERVICE_IS_DOWN', quickTrades)
   }
   _checkPricesChange(quickTrades, coinPrices, 'sell_price')
   const promises = assets.map(asset => {
     if (!asset.done) {
       const assetTrade = quickTrades.find(elem => elem.asset === _getTradeBlockSymbol(asset.currency))
       if (assetTrade) {
         return _acceptSellQuickTrade(userId, id, asset, single, assetTrade, req)
       } else return Promise.resolve()
     } else return Promise.resolve()
   })
 
   const result = await Promise.all(promises)
   return result
 }
 
 exports.getCurrentTradePrices = async (coins, req) => {
  //  const btcIndex = coins.indexOf('BTC')
  //  if (btcIndex > -1) coins.splice(btcIndex, 1, 'XBT')
   const quickTrades = await geminiAPI.getTradeHistory(coins[0].toLowerCase() + 'usd', {})
   if (!quickTrades || !Array.isArray(quickTrades)) {
     throw error('CRYPTO_SERVICE_IS_DOWN', quickTrades)
   }
 
   return quickTrades.map(trade => ({
     currency: _convertFromTradeBlockSymbol(trade.symbol),
     buy_price: trade.price,
     sell_price: null
   }))
 }

 exports.getBalances = async () => {
   try {
    const myBalances = await geminiAPI.getMyAvailableBalances()
    return myBalances
   } catch(e) {
     logger.error("BALANCE: " + e)
     return null;
  }
 }


exports.tradeCryptoCurrency = async (amount, asset, type) => {
  var amount1
  const data = {}
  const transaction = []
  const item = {}
  const symbol = asset.toLowerCase() + 'usd'
  const quickTrades = await geminiAPI.getTradeHistory(symbol, {})

  if (type === 'buy') {
    amount1 = (amount / quickTrades[0]['price'])
  } else {
    amount1 = amount
  }

  const params = {
    'symbol': symbol,
    'amount': amount1.toFixed(5).toString(),
    'price': quickTrades[0]['price'],
    'side': type,
    // 'options': ["indication-of-interest"]
  }
  
  const result = await geminiAPI.newOrder(params)
  console.log(result)
  data.transactionId = result["id"]
  data.status = result["is_live"]
  data.currency = 'USD'
  data.amount = (result["original_amount"] * result["price"]).toFixed(2).toString()
  item.currency = 'USD'
  item.amount = data.amount
  item.price = result["price"].toString()
  item.volume = 0
  transaction.push(item)
  data.transactions = transaction
  return data
}

