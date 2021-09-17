const validator = require('request-validator')
const validatorSchema = require('./../lib/validator/validators')
const error = require('../lib/error')

/**
 * validate incoming request passed parameters
 *
 * @param req
 * @param res
 * @param next
 */
module.exports = (req, res, next) => {
  var schema = validatorSchema.getSchema(req.originalUrl, req.method)
  if (schema.required && !schema.required.length) {
    delete schema.required
  }

  var validate = validator(schema, (req, res, next) => {
    let e = false
    if (!req.validator.valid) {
      e = error('BAD_REQUEST', req.validator.error)
    }
    next(e)
  })
  validate(req, res, next)
}
