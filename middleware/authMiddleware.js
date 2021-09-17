const error = require('../lib/error')
const logger = require('../lib/logger')
const config = require('../config')
const models = require('../database/models')
const jwt = require('jsonwebtoken')
const auth = require('basic-auth')

var encrypt = require('../lib/encrypt')

const notificationManager = require('../managers/notificationManager')
const sessionManager = require('../managers/sessionManager')

const _decryptUser = (user) => {
  if (user.address1) user.address1 = encrypt.decrypt(user.address1)
  if (user.address2) user.address2 = encrypt.decrypt(user.address2)
  if (user.aptSuite) user.aptSuite = encrypt.decrypt(user.aptSuite)
  if (user.city) user.city = encrypt.decrypt(user.city)
  if (user.zipcode) user.zipcode = encrypt.decrypt(user.zipcode)

  return user
}

var Auth = {
  checkUserToken: (req, res, next) => {
    // check header or url parameters or post parameters for token
    var token = req.headers['x-access-token']
    if (!token) return next(error('FORBIDDEN'))
    // verifies secret and checks exp
    jwt.verify(token, config.token.secret, (err, decoded) => {
      if (err) {
        if (err.message === 'jwt expired') {
          return next(error('EXPIRED'))
        } else {
          return next(error('FORBIDDEN'))
        }
      }
      if (!decoded && decoded.userId.toString() !== req.params.userId.toString()) {
        return next(error('FORBIDDEN'))
      }
      sessionManager.getKey(token).then((data) => {
        if (!data || (data.id.toString() !== req.params.userId.toString())) {
          return next(error('FORBIDDEN'))
        }
        
        models.user.findById(req.params.userId, { raw: true }).then(user => {
          if (!user) return next(error('NOT_FOUND', 'User'))
          if (user.email !== decoded.email) return next(error('FORBIDDEN'))
          // if (!user.verified) return next(error('NOT_VERIFIED'));

          if (decoded._2FAToken) {
            const url = req.originalUrl || ''
            if (url.indexOf('/verify') === -1 && req.method !== 'POST') {
              return next(error('FORBIDDEN'))
            }
          }

          req.user = _decryptUser(user)
          next()
        }, err => {
          next(err)
        })
      })
    })
  },

  checkAdminAuth: (req, res, next) => {
    var authorization = req.headers['authorization'] || req.headers['Authorization']
    if (!authorization) return next(error('FORBIDDEN'))
    var user = auth.parse(authorization)
    if (!user || user.name !== config.admin.username || user.pass !== config.admin.password) { return next(error('FORBIDDEN')) }
    next()
  },

  checkAPIToken: (req, res, next) => {
    var authorization = req.headers['authorization'] || req.headers['Authorization'];
    if (!authorization) return next(error('FORBIDDEN'));
    var user = auth.parse(authorization)
    if (!user || user.name != config.client.username || user.pass != config.client.password )
      return next(error('FORBIDDEN'));
    next();
  },

  checkUserRefreshToken: (req, res, next) => {
    var refresh = req.headers['refresh-token']
    if (!refresh) return next(error('FORBIDDEN'))
    jwt.verify(refresh, config.token.secretRefresh, (err, decoded) => {
      if (err) {
        if (err.message === 'jwt expired') {
          return next(error('EXPIRED_REFRESH_TOKEN'))
        } else {
          return next(error('FORBIDDEN'))
        }
      }

      if (!decoded && !decoded.user && decoded.user.id.toString() !== req.params.userId.toString()) {
        return next(error('FORBIDDEN'))
      }

      sessionManager.getKey(refresh).then((redisUserId) => {
        if (redisUserId.toString() !== req.params.userId.toString()) {
          return next(error('FORBIDDEN'))
        }

        models.user.findById(req.params.userId, { raw: true }).then(user => {
          if (!user) return next(error('NOT_FOUND'))
          if (user.email !== decoded.user.email) return next(error('FORBIDDEN'))
          req.user = _decryptUser(user)
          next()
        }, err => {
          next(err)
        })
      })
    })
  },

  checkForgothPasswordLink: (req, res, next) => {
    var code = req.query.code
    if (!code) return next(error('FORBIDDEN'))
    jwt.verify(code, config.token.forgothPassword, (err, decoded) => {
      if (err) {
        if (err.message === 'jwt expired') {
          return next(error('EXPIRED_REFRESH_TOKEN'))
        } else {
          return next(error('FORBIDDEN'))
        }
      }

      models.user.findById(decoded.userId, { raw: true }).then(user => {
        if (!user) return next(error('NOT_FOUND'))
        if (user.email !== decoded.email) return next(error('FORBIDDEN'))
        req.user = _decryptUser(user)
        next()
      }, err => {
        next(err)
      })
    })
  },

  checkEmailConfirmationLink: (req, res, next) => {
    try {
      var token = req.query.token
      if (!token) return next(error('FORBIDDEN'))
      jwt.verify(token, config.token.secret, (err, decoded) => {
        if (err) {
          if (err.message === 'jwt expired') {
            return next(error('EXPIRED_REFRESH_TOKEN'))
          } else {
            return next(error('FORBIDDEN'))
          }
        }

        if (!decoded.emailConfirmation) return next(error('FORBIDDEN'))

        models.user.findById(decoded.userId, { raw: true }).then(user => {
          if (!user) return next(error('NOT_FOUND'))
          if (user.email !== decoded.email) return next(error('FORBIDDEN'))

          // notificationManager.processEventForNotification(req, user, notificationManager.EVENTS.FIRST_EMAIL_REGISTRATION)
          res.set('Content-Type', 'text/html')
          res.send(notificationManager.getEmailConfirmationContent(user))
        }, err => {
          next(err)
        })
      })
    } catch (err) {
      logger.error(req, err, 'Error confirming email link')
      next(error('INTERNAL_ERROR'))
    }
  }

}

module.exports = Auth
