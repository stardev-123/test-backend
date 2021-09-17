const config = require('./../config')
const util = require('../lib/util')
const safeStringify = require('fast-safe-stringify')
const { createLogger, format, transports } = require('winston')
require('winston-daily-rotate-file')

const LEVELS = {
  debug: 30,
  info: 20,
  system: 20,
  warn: 10,
  error: 0
}

let folder = config.log.fileLogParams.folder || 'log/'
if (folder.lastIndexOf('/') !== folder.length - 1) {
  folder = folder + '/'
}

const externalLevel = config.log.external && config.log.external.level ? LEVELS[config.log.external.level] : -1

const Rollbar = require('rollbar')
const rollbar = new Rollbar({
  accessToken: config.rollbar.accessToken,
  captureUncaught: true,
  captureUnhandledRejections: true
})

const _replaceErrors = (key, value) => {
  if (value instanceof Error) {
    const error = {}

    Object.getOwnPropertyNames(value).forEach(key => {
      error[key] = value[key]
    })

    return error
  }
  return value
}

const logFormat = format.printf(info => {
  const splat = info[Symbol.for('splat')]
  let base = `${info.timestamp} ${info.level}: ${safeStringify(info.message)}`
  if (splat && splat.length > 0) base += ', ' + safeStringify(splat, _replaceErrors)
  return base
})

const onrampLogger = createLogger({ level: config.log.level })

onrampLogger.add(new transports.Console({
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    format.prettyPrint(),
    logFormat
  ),
  timestamp: true,
  json: false,
  datePattern: config.log.fileLogParams.datePattern + '.' + config.log.fileLogParams.extension
}))

try {
  const dailyRotateTransport = new (transports.DailyRotateFile)({
    format: format.combine(
      format.timestamp(),
      format.prettyPrint(),
      logFormat
    ),
    filename: folder + config.log.fileLogParams.prefix + '%DATE%' + '.' + config.log.fileLogParams.extension,
    timestamp: true,
    json: false,
    maxSize: '20m',
    maxFiles: config.log.fileLogParams.keepLogsDays + 'd',
    datePattern: config.log.fileLogParams.datePattern
  })

  onrampLogger.add(dailyRotateTransport)
} catch (err) {
  console.log(err)
}

const _bindRequestData = (req, msg) => {
  msg = msg || ''
  if (req) {
    req.user_ip = util.getRequestIP(req)
  }
  return req && req.api_id ? req.api_id + '; IP' + req.user_ip + ' - ' + msg : msg
}

const _externalLoging = (level, request, error, msg, payload) => {
  if (LEVELS[level] <= externalLevel) {
    if (level === 'error') {
      rollbar[level](msg, error, payload, request)
    } else {
      rollbar[level](msg, payload, request)
    }
  }
}

module.exports = {
  system: (req, msg, ...data) => {
    onrampLogger.info(_bindRequestData(req, msg), ...data)
  },
  info: (req, msg, ...data) => {
    const fullMsg = _bindRequestData(req, msg)
    onrampLogger.info(fullMsg, ...data)
    _externalLoging('info', req, null, fullMsg, ...data)
  },
  error: (req, err, msg, ...data) => {
    const fullMsg = _bindRequestData(req, msg)
    onrampLogger.error(fullMsg, ...data, err)
    _externalLoging('error', req, err, fullMsg, ...data)
  },
  warn: (req, msg, ...data) => {
    const fullMsg = _bindRequestData(req, msg)
    onrampLogger.warn(fullMsg, ...data)
    _externalLoging('warn', req, null, fullMsg, ...data)
  },
  debug: (req, msg, ...data) => {
    const fullMsg = _bindRequestData(req, msg)
    onrampLogger.debug(fullMsg, ...data)
    _externalLoging('debug', req, null, fullMsg, ...data)
  },
  verbose: (req, msg, ...data) => {
    const fullMsg = _bindRequestData(req, msg)
    onrampLogger.verbose(fullMsg, ...data)
    _externalLoging('verbose', req, null, fullMsg, ...data)
  }
}
