const models = require('../database/models')

module.exports.updateDevice = async (deviceId, userId, data = {}) => {
  data.deviceId = deviceId
  data.userId = userId

  await models.device.upsert(data)
}
