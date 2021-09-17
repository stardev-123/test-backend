const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const Recurring = sequelize.define('recurring', {
    currency: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    amount: {
      type: DataTypes.DECIMAL(16, 8).UNSIGNED,
      defaultValue: 0
    },
    day: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Recurring.prototype.associate = function () {
    Recurring.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
    Recurring.belongsTo(sequelize.models.bankAccount, { foreignKeyConstraint: true, constraints: false })
  }

  Recurring.prototype.findById = async (id, options) => {
    const query = _.defaults({ where: { id } }, options)
    return Recurring.findOne(query)
  }

  Recurring.prototype.findForUserId = async (userId, options) => {
    const query = _.defaults({ where: { userId } }, options)
    return Recurring.findAll(query)
  }

  Recurring.prototype.findActiveUserId = async (active, userId, options) => {
    const query = _.defaults({ where: { active, userId } }, options)
    return Recurring.findAll(query)
  }

  Recurring.prototype.findActiveForUserIdAndBankAccountId = async (userId, bankAccountId, options) => {
    const query = _.defaults({ where: { userId, bankAccountId, active: true } }, options)
    return Recurring.findOne(query)
  }

  Recurring.prototype.findActiveForDay = async (day, options) => {
    const query = _.defaults({ where: { day, active: true } }, options)
    return Recurring.findAll(query)
  }

  Recurring.prototype.findActive = async (options) => {
    const query = _.defaults({ where: { active: true } }, options)
    return Recurring.findAll(query)
  }

  Recurring.prototype.deactivate = async (recurring, options) => {
    return recurring.update({ active: false }, options)
  }

  Recurring.prototype.findAll = async () => {
    return Recurring.findAll({})
  }

  Recurring.prototype.createOne = async (data, options) => {
    return Recurring.create(data, options)
  }

  Recurring.prototype.updateOne = async (recurring, data, options) => {
    return recurring.update(data, options)
  }

  Recurring.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  return Recurring
}
