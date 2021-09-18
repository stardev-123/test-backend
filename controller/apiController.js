/**
 * Created by laslo on 28.2.19..
 */

const { processEventForNotification, EVENTS } = require('../managers/notificationManager')
const error = require('../lib/error')

exports.sendEmail = async (req, res, next) => {
  const { email, firstName, lastName, template, payload } = req.body
  try {
    const user = { id: email, email, firstName, lastName }
    const eventTemplate = EVENTS[template]
    if (!eventTemplate) return next(error('NOT_FOUND', 'Template ' + template))

    await processEventForNotification(req, user, eventTemplate, payload)
    res.json({ success: true })
  } catch (e) {
    return next(e)
  }
}
