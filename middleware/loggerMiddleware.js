const uuidv1 = require('uuid/v1')
const _ = require('lodash')
const HIDDEN_FIELD = '*******'
const logger = require('../lib/logger')

const _handleLoggingHeadersData = (headers) => {
  const logHeaders = {}
  if (headers['x-access-token']) {
    logHeaders['access-token'] = '...' + headers['x-access-token'].substr(headers['x-access-token'].length - 15)
  }
  if (headers['refresh-token']) {
    logHeaders['refresh-token'] = '...' + headers['refresh-token'].substr(headers['refresh-token'].length - 15)
  }
  if (headers['authorization'] || headers['Authorization']) {
    const authorisation = headers['authorization'] || headers['Authorization']
    logHeaders['Authorization'] = '...' + authorisation.substr(authorisation.length - 15)
  }
  return logHeaders
}

const _handleLoggingBodyData = (url, body) => {
  switch (url) {
    case '/login':
      return _.defaults({ password: HIDDEN_FIELD }, body)
    case '/password/change':
      return _.defaults({
        old: HIDDEN_FIELD,
        password: HIDDEN_FIELD,
        confirm: HIDDEN_FIELD
      }, body)
  }
  if (body.ssn) return _.defaults({ ssn: HIDDEN_FIELD }, body)
  return body
}

exports.logRequest = (req, res, next) => {
  const url = req.originalUrl || ''
  req.api_id = uuidv1()
  if (url.indexOf('webhook') < 0 && url.indexOf('/assets') < 0 && url !== '/') {
    const logBody = _handleLoggingBodyData(url, req.body)
    const logHeaders = _handleLoggingHeadersData(req.headers)
    logger.info(req, `${req.method} ${url}; headers: ${JSON.stringify(logHeaders)}; body: ${JSON.stringify(logBody)}`)
  }
  next()
}

exports.logErrors = (err, req, res, next) => {
  const url = req.originalUrl || ''
  logger.error(req, err, `${req.method} ${url}`)
  next(err)
}
