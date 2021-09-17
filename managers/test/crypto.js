/**
 * Created by laslo on 18.2.19..
 */
const moment = require('moment')
const prices = require('../crypto/prices/coincap')

const test = async () => {
  const yesterday = moment().subtract(1, 'day').toDate()
  const result = await prices.getHistoryPriceOnDay('BTC', null, yesterday)
  console.log(result)
}

test()
