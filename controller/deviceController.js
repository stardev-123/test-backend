/**
 * Created by laslo on 13/09/18.
 */

const deviceManager = require('../managers/deviceManager')
const error = require('../lib/error')
const logger = require('../lib/logger')

module.exports.updateDevice = async (req, res, next) => {
  const deviceId = req.params.deviceId
  const userId = req.user.id
  const data = req.body

  try {
    await deviceManager.updateDevice(deviceId, userId, data)
    res.json({ success: true })
  } catch (err) {
    logger.error(req, err, 'ERROR updating device', { deviceId, userId, data })
    next(error('INTERNAL_ERROR'))
  }
}
