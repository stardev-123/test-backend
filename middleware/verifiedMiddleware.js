const { USER } = require('../lib/constants')
const error = require('../lib/error')
const config = require('../config')

module.exports.checkIsUserVerified = (req, res, next) => {
  if (config.tosMandatory && req.user.tosStatus !== USER.TOS.ACCEPTED) {
    next(error('TOS_NOT_ACCEPTED'))
  }
  if (config.allowNotVerified || req.user.verified) next()
  else next(error('NOT_VERIFIED'))
}
