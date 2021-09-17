const _ = require('lodash')
const moment = require('moment')

module.exports = function (sequelize, DataTypes) {
  const FailedBoost = sequelize.define('failedBoost', {
    count: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    success: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    currency: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(16, 8).UNSIGNED,
      defaultValue: 0
    },
    failDate: {
      type: DataTypes.DATEONLY,
      defaultValue: new Date()
    },
    nextProcessingDate: {
      type: DataTypes.DATEONLY,
      defaultValue: new Date()
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  FailedBoost.prototype.associate = function () {
    FailedBoost.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
    FailedBoost.belongsTo(sequelize.models.recurring, { foreignKeyConstraint: true, constraints: false })
    FailedBoost.belongsTo(sequelize.models.sparechange, { foreignKeyConstraint: true, constraints: false })
  }

  FailedBoost.prototype.findById = async (id, options) => {
    const query = _.defaults({ where: { id } }, options)
    return FailedBoost.findOne(query)
  }

  FailedBoost.prototype.findByRecurringId = async (recurringId, options) => {
    const query = _.defaults({ where: { active: true, recurringId } }, options)
    return FailedBoost.findOne(query)
  }

  FailedBoost.prototype.findBySparechangeId = async (sparechangeId, options) => {
    const query = _.defaults({ where: { active: true, sparechangeId } }, options)
    return FailedBoost.findOne(query)
  }

  FailedBoost.prototype.deactivate = async (recurring, options) => {
    return recurring.update({ active: false }, options)
  }

  FailedBoost.prototype.findAll = async () => {
    return FailedBoost.findAll({})
  }

  FailedBoost.prototype.findForRecharge = async (options) => {
    return FailedBoost.findAll({ where: { active: true, nextProcessingDate: moment().startOf('day').toDate() } }, options)
  }

  FailedBoost.prototype.createOne = async (data, options) => {
    return FailedBoost.create(data, options)
  }

  FailedBoost.prototype.updateOne = async (found, data, options) => {
    return found.update(data, options)
  }

  FailedBoost.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  return FailedBoost
}
