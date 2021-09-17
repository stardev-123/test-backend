const _ = require('lodash')
const errorCodes = require('../config/errorCodes')

module.exports = (err, message, stack) => {
  var e = {}
  if (typeof err === 'string') {
    let error
    if (typeof errorCodes.codes[err] === 'function') {
      error = errorCodes.codes[err](message)
    } else {
      error = errorCodes.codes[err]
      if (message !== undefined) {
        error = _.clone(error)
        error.message += ' ' + message
      }
    }
    if (!error.data) error.data = {}
    if (!error.internalCode) error.internalCode = 0
    e = error
  } else {
    e.code = err.code
    e.internalCode = 0
    e.data = {}
    e.message = err.message
    e.stack = err.stack
  }

  return e
}
