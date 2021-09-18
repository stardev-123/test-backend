/**
 * Created by laslo on 07/09/18.
 */

// const models = require('../database/models')
const error = require('../lib/error')

exports.loadUser = async (req, res, next) => {
  const user = await models.user.findById(req.params.userId)
  if (!user) return next(error('NOT_FOUND'))
  req.user = user
  next()
}
