const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const Device = sequelize.define('device', {
    deviceId: {
      type: DataTypes.STRING(100),
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING(250)
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Device.prototype.associate = function () {
    Device.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
  }

  Device.prototype.findByDeviceId = async (deviceId, options) => {
    options = _.defaults(options)
    return Device.find(options)
  }

  Device.prototype.findByForUserId = async (userId, options) => {
    options = _.defaults({ where: { userId: userId } }, options)
    return Device.findAll(options)
  }

  Device.prototype.findByForUserIdWithToken = async (userId, options) => {
    options = _.defaults({ where: { userId: userId, token: { $ne: null } } }, options)
    return Device.findAll(options)
  }

  Device.prototype.upsert = async (data, options) => {
    return Device.upsert(data, options)
  }

  Device.prototype.createOne = async (data, options) => {
    return Device.create(data, options)
  }

  Device.prototype.updateOne = async (instance, data, options) => {
    return instance.update(data, options)
  }

  Device.prototype.deleteOne = async (instance, options) => {
    return instance.destroy(options)
  }

  return Device
}
