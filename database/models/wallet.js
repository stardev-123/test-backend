const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const Wallet = sequelize.define('wallet', {
    currency: {
      type: DataTypes.STRING(6),
      primaryKey: true
    },
    amount: {
      type: DataTypes.DECIMAL(22, 12).UNSIGNED,
      defaultValue: 0
    },
    pending: {
      type: DataTypes.DECIMAL(22, 12).UNSIGNED,
      defaultValue: 0
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Wallet.prototype.associate = function () {
    Wallet.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
  }

  Wallet.prototype.findById = async (id) => {
    return Wallet.find({ where: { id: id } })
  }

  Wallet.prototype.findByForUser = async (userId, options) => {
    return Wallet.findAll(_.defaults({ where: { userId } }, options))
  }

  Wallet.prototype.findByForUserAndCurrency = async (userId, currency, options) => {
    options = _.defaults({ where: { userId, currency } }, options)
    return Wallet.findOne(options)
  }

  Wallet.prototype.findAll = async () => {
    return Wallet.findAll({})
  }

  Wallet.prototype.createOne = async (data, options) => {
    return Wallet.create(data, options)
  }

  Wallet.prototype.updateOne = async (wallet, data, options) => {
    return wallet.update(data, options)
  }

  Wallet.prototype.updateAmount = async (wallet, inc, options) => {
    return wallet.increment({ amount: inc }, options)
  }

  Wallet.prototype.updatePendingAmount = async (wallet, inc, options) => {
    return wallet.increment({ pending: inc }, options)
  }

  Wallet.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  return Wallet
}
