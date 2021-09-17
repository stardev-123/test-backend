const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const Sparechange = sequelize.define('sparechange', {
    currency: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    accounts: {
      type: DataTypes.JSON
    },
    invested: {
      type: DataTypes.DECIMAL(16, 8).UNSIGNED,
      defaultValue: 0
    },
    ongoing: {
      type: DataTypes.DECIMAL(16, 8).UNSIGNED,
      defaultValue: 0
    },
    charge: {
      type: DataTypes.DECIMAL(16, 8).UNSIGNED,
      defaultValue: 0
    },
    lastChargeDate: {
      type: DataTypes.DATEONLY,
      defaultValue: new Date()
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Sparechange.prototype.associate = function () {
    Sparechange.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
    Sparechange.belongsTo(sequelize.models.bankAccount, { foreignKeyConstraint: true, constraints: false })
  }

  Sparechange.prototype.findById = async (id, options) => {
    return Sparechange.findOne(_.defaults({ where: { id } }, options))
  }

  Sparechange.prototype.findForUserId = async (userId, options) => {
    return Sparechange.findOne(_.defaults({ where: { userId } }, options))
  }

  Sparechange.prototype.findForUserIdActive = async (userId, options) => {
    return Sparechange.findOne(_.defaults({ where: { userId, active: true } }, options))
  }

  Sparechange.prototype.findActive = async (options) => {
    return Sparechange.findAll(_.defaults({ where: { active: true } }, options))
  }

  Sparechange.prototype.findActiveForUserIdAndBankAccountId = async (userId, bankAccountId, options) => {
    return Sparechange.findOne(_.defaults({ where: { active: true, userId, bankAccountId } }, options))
  }

  Sparechange.prototype.incrementOngoingAmount = async (sparechange, inc, options) => {
    return sparechange.increment({ ongoing: inc }, options)
  }

  Sparechange.prototype.deactivate = async (sparechange, options) => {
    return sparechange.update({ active: false }, options)
  }

  Sparechange.prototype.findAll = async () => {
    return Sparechange.findAll({})
  }

  Sparechange.prototype.createOne = async (data, options) => {
    return Sparechange.create(data, options)
  }

  Sparechange.prototype.updateOne = async (sparechange, data, options) => {
    return sparechange.update(data, options)
  }

  Sparechange.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  return Sparechange
}
