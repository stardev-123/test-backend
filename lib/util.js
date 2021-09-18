/**
 * Created by laslo on 10/09/18.
 */

const uuidv1 = require('uuid/v1')
const _ = require('lodash')
const BigNumber = require('bignumber.js')
const error = require('./error')

const CHARACTERS = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', '0123456789', 'abcdefghijklmnopqrstuvwxyz', '!_']

exports.generatePassword = () => {
  return [3, 3, 3, 1].map((len, i) => { return Array(len).fill(CHARACTERS[i]).map(x => { return x[Math.floor(Math.random() * x.length)] }).join('') }).concat().join('').split('').sort(() => { return 0.5 - Math.random() }).join('')
}

const _repeatCharacters = (count, ch) => {
  if (count === 0) {
    return ''
  }
  const count2 = count / 2
  let result = ch

  // double the input until it is long enough.
  while (result.length <= count2) {
    result += result
  }
  // use substring to hit the precise length target without
  // using extra memory
  return result + result.substring(0, count - result.length)
}
exports.repeatCharacters = _repeatCharacters

exports.round = (value, places) => {
  const number = Number(value + ('e+' + places))
  return +(Math.round(number) + ('e-' + places))
}

exports.format = (amount, decimalCount = 2, decimal = '.', thousands = ',') => {
  try {
    decimalCount = Math.abs(decimalCount)
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount

    const negativeSign = amount < 0 ? '-' : ''

    const i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString()
    const j = (i.length > 3) ? i.length % 3 : 0
    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : '')
  } catch (e) {
    return amount
  }
}

exports.maskString = (string, lastN, symbol = '*') => {
  if (!string) return ''
  if (!lastN) return string
  if (string.length < lastN) return string

  return _repeatCharacters(string.length - lastN, symbol) + string.substr(string.length - lastN)
}

exports.returnBatchRequest = () => {
  return { api_id: uuidv1(), headers: { 'x-forwarded-for': ':LOCAL_BATCH' } }
}

exports.cloneBatchRequest = (req, initData) => {
  return _.defaults(initData || {}, req)
}

exports.getRequestIP = (req) => {
  let ipData = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  ipData = ipData ? ipData.replace('::1', ':127.0.0.1').replace('::ffff', '') : 'UNKNOWN'
  return ipData
}

/**
 * Converts value to number
 * @param value
 * @param decimals - number of decimal places
 * @returns {*}
 * @private
 */
exports.convertToNumber = (value, decimals) => {
  if (!value) return ''
  let converted
  try {
    converted = new BigNumber(value).decimalPlaces(decimals)
    if (converted.isNaN()) throw error('BAD_NUMBER_FORMAT', value)
  } catch (e) {
    throw error('BAD_NUMBER_FORMAT', value)
  }
  return converted.toNumber()
}

/**
 * Converts number value to string
 * @param value
 * @param decimals - number of decimal places
 * @returns {*}
 * @private
 */
exports.convertToString = (value, decimals) => {
  let converted
  try {
    converted = new BigNumber(value)
    if (converted.isNaN()) converted = '' + value
    else converted = converted.toFixed(decimals)
  } catch (e) {
    converted = '' + value
  }
  return converted
}
