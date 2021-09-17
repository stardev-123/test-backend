/**
 * Created by laslo on 24.1.19..
 */

const BigNumber = require('bignumber.js')

// console.log(22.329999999999998 + 33.0000013113021952 + 22.329999999999998 + 22.3399986886978048)
//
// const x = new BigNumber(22.329999999999998)
// const y = new BigNumber(33.0000013113021952)
// const z = new BigNumber(22.329999999999998)
// const c = new BigNumber(22.3399986886978048)
//
// const res = x.plus(y).plus(z).plus(c)
//
// console.log(res.toNumber())
console.log(new BigNumber('tt.erwrw').decimalPlaces(8).isNaN())
console.log(new BigNumber('22.3234564352425457658').toPrecision(8))
console.log(new BigNumber('22.3234564352425457658').toFixed(8))
