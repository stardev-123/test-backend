const FCM = require('fcm-push')
// const models = require('../database/models')
const emailManager = require('./emailManager')
const { NOTIFICATIONS, EVENTS } = require('../lib/notifications')
const BASE_TEMPLATE = require('../templates/email')
const logger = require('../lib/logger')
const config = require('../config')

const fcm = new FCM(config.push.common.serverKey)

const TRADE_EVENTS = [EVENTS.CONFIRM_NEW_INVESTMENT, EVENTS.FIRST_INVESTMENT, EVENTS.CONFIRM_SALE_OF_CRYPTO]

const _getCollapseKeyFromType = (event) => {
  // TODO
  return ''
}

const _checkEventPushCondition = (req, event) => {
  if (!req.disablePush && TRADE_EVENTS.indexOf(event) > -1) {
    return req.postponedTrading
  }
  return false
}

const _checkPushConditions = (req, event, pushData) => {
  return pushData && (!pushData.conditional || _checkEventPushCondition(req, event))
}

/**
 * Send push notification
 * @param pushToken
 * @param message
 * @param title
 * @param type
 */
const _sendPushNotification = async (pushToken, title, body, event, payload) => {
  const collapseKey = _getCollapseKeyFromType(event)

  var message = {
    to: pushToken,
    data: payload || { event },
    'android': {
      'priority': 'high',
      'ttl': config.push.common.timeToLive + 's'
    },
    'apns': {
      'headers': {
        'apns-priority': '10',
        'apns-expiration': Math.floor(Date.now() / 1000) + config.push.common.timeToLive
      }
    },
    'webpush': {
      'headers': {
        'Urgency': 'high',
        'TTL': '' + config.push.common.timeToLive
      }
    },
    notification: {
      title: title,
      body: body
    }
  }

  if (collapseKey) {
    message.android.collapseKey = collapseKey
    message.apns['apns-collapse-id'] = collapseKey
  }

  return new Promise((resolve) => {
    fcm.send(message, (err, response) => {
      if (err) {
        // something went wrong with server
        logger.error(null, err, 'Error Send Push Notification to token:' + pushToken +
            ' - With message ' + JSON.stringify(message) + ', failed because of error', response)
        resolve()
      } else {
        logger.debug(null, 'Successfully sent message to token ' + pushToken, message)
        resolve(response)
      }
    })
  })
}

module.exports.EVENTS = EVENTS

const _getEmailBody = (user, emailData, payload) => {
  const { subject, title, body, link = '' } = emailData
  let emailSubject = '' + subject
  let html = BASE_TEMPLATE.replace('#TITLE', title)
  if (typeof body === 'function') {
    html = html.replace('#BODY', body(payload))
  } else {
    html = html.replace('#BODY', body)
  }

  if (typeof link === 'function') {
    html = html.replace('#LINK', link(payload))
  } else {
    html = html.replace('#LINK', link)
  }
  html = html.replace(new RegExp('#FIRST_NAME', 'g'), user.firstName)
  html = html.replace(new RegExp('#LAST_NAME', 'g'), user.lastName)

  emailSubject = emailSubject.replace('#FIRST_NAME', user.firstName)
  emailSubject = emailSubject.replace('#LAST_NAME', user.lastName)

  return { html, emailSubject }
}

/**
 * Notify service owner that his investment is done
 * @param {*} userId
 */
module.exports.processEventForNotification = async (req, user, event, payload) => {
  if (config.disableAllNotifications) return
  if (!NOTIFICATIONS[event]) return
  const userId = user.id
  const { pushData, emailData } = NOTIFICATIONS[event]

  logger.debug(req, 'Notifying userId=' + userId + ' for event ' + event)
  try {
    const devices = await models.device.findByForUserIdWithToken(userId, { raw: true })
    const promises = []
    const pushEnabled = await _checkPushConditions(req, event, pushData)
    if (pushEnabled && devices && devices.length > 0) {
      const { title, body } = pushData
      // send push notification
      devices.forEach(device => {
        promises.push(_sendPushNotification(device.token, title, body, event))
      })
    }

    if (emailData) {
      const { html, emailSubject } = _getEmailBody(user, emailData, payload)

      promises.push(emailManager.sendEmail(req, user.email, emailSubject, html))
    }

    await Promise.all(promises)
  } catch (err) {
    logger.error(req, err, 'ERROR notifying userId=' + userId + ' for event ' + event)
  }
}

module.exports.getEmailConfirmationContent = (user) => {
  let html = 'You successfully confirmed your email'
  if (!NOTIFICATIONS[EVENTS.CONFIRMATION_PAGE]) return html
  const { emailData } = NOTIFICATIONS[EVENTS.CONFIRMATION_PAGE]

  if (emailData) {
    const { title, body, link } = emailData
    html = BASE_TEMPLATE.replace('#TITLE', title)
    html = html.replace('#BODY', body)
    html = html.replace('#LINK', link || '')
    html = html.replace('#FIRST_NAME', user.firstName)
    html = html.replace('#LAST_NAME', user.lastName)
  }

  return html
}

module.exports.getEmailBody = (user, event, payload) => {
  const { emailData } = NOTIFICATIONS[event]

  const { html } = _getEmailBody(user, emailData, payload)
  return html
}

module.exports.getPushData = (event, payload) => {
  const { pushData } = NOTIFICATIONS[event]
  return pushData
}

module.exports.notifyAdminForEvent = async (req, event, payload) => {
  try {
    const admins = await models.admins.findAll({ raw: true })
    const { emailData } = NOTIFICATIONS[EVENTS.ADMIN_EVENT]
    const html = emailData.body({ req, event, payload })
    const promises = admins.map(admin => {
      return emailManager.sendEmail(req, admin.email, emailData.subject, html)
    })
    await Promise.all(promises)
  } catch (err) {
    logger.error(req, err, 'ERROR sending error notification to admin')
  }
}

module.exports.testPush = _sendPushNotification
