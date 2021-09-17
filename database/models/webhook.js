const constants = require('../../lib/constants')

module.exports = function (sequelize, DataTypes) {
  const Webhook = sequelize.define('webhook', {
    // payment provider transfer id
    providerTransactionId: {
      type: DataTypes.STRING(50),
      primaryKey: true
    },
    status: {
      type: DataTypes.SMALLINT,
      defaultValue: constants.WEBHOOK.DEFAULT_STATUS
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Webhook.prototype.findByProviderTransactionId = async (providerTransactionId) => {
    return Webhook.find(
      {
        where: {
          providerTransactionId
        }
      }
    )
  }

  Webhook.prototype.findAll = async () => {
    return Webhook.findAll({})
  }

  Webhook.prototype.createOne = async (providerTransactionId) => {
    return Webhook.create({ providerTransactionId })
  }

  Webhook.prototype.updateStatus = async (providerTransactionId, status) => {
    return Webhook.update({ status }, { where: { providerTransactionId } })
  }

  Webhook.prototype.deleteOne = async (found) => {
    return found.destroy()
  }

  return Webhook
}
