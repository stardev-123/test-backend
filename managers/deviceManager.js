// const models = require('../database/models')

exports.updateDevice = async (deviceId, userId, data = {}) => {
  data.deviceId = deviceId
  data.userId = userId

  await models.device.upsert(data)
}
