module.exports = function (sequelize, DataTypes) {
  const Settings = sequelize.define('settings', {
    webhookId: {
      type: DataTypes.STRING(100)
    },
    portfolio: {
      type: DataTypes.JSON
    },
    coins: {
      type: DataTypes.JSON
    },
    tradingEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    postponedTrading: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Settings.prototype.findByIdWebhookId = async (id) => {
    return Settings.find(
      {
        where: {
          webhookId: id
        }
      }
    )
  }

  Settings.prototype.findOne = async (options) => {
    return Settings.find(options || {})
  }

  Settings.prototype.getTradingData = async () => {
    return Settings.find({ attributes: ['tradingEnabled', 'postponedTrading'], raw: true })
  }

  Settings.prototype.findAll = async (options) => {
    return Settings.findAll(options)
  }

  Settings.prototype.createOne = async (data) => {
    return Settings.create(data)
  }

  Settings.prototype.updateOne = async (settings, data) => {
    return settings.update(data)
  }

  Settings.prototype.deleteOne = async (found) => {
    return found.destroy()
  }
  return Settings
}
