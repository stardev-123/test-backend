const _ = require('lodash')
const crypto = require('crypto')
const constants = require('../../lib/constants')

module.exports = function (sequelize, DataTypes) {
  const Investment = sequelize.define('investment', {
    type: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    tid: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(16, 8).UNSIGNED,
      defaultValue: 0
    },
    providerTransactionId: {
      type: DataTypes.STRING(50)
    },
    assets: {
      type: DataTypes.JSON,
      allowNull: false
    },
    single: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: constants.INVESTMENTS.STATUS.INITIALIZED
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Investment.prototype.associate = function () {
    Investment.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
    Investment.belongsTo(sequelize.models.bundles, { foreignKey: 'bundleId', as: 'bundles', foreignKeyConstraint: true, constraints: false })
  }

  Investment.prototype.findById = async (id) => {
    return Investment.find({ where: { id } })
  }

  Investment.prototype.findForProviderTransactionId = async (providerTransactionId, options) => {
    options = _.defaults({ where: { providerTransactionId: providerTransactionId } }, options)
    return Investment.findOne(options)
  }

  Investment.prototype.findInProgressBeforeDate = async (date, options) => {
    options = _.defaults({ where: {
      status: constants.INVESTMENTS.STATUS.PENDING,
      createdAt: { $lte: date }
    } }, options)
    return Investment.findAll(options)
  }

  Investment.prototype.updateStatus = async (id, status, options) => {
    options = _.defaults({ where: { id: id } }, options)
    return Investment.update({ status }, options)
  }

  Investment.prototype.createOne = async (data, options) => {
    data.tid = crypto.randomBytes(18).toString('hex')
    return Investment.create(data, options)
  }

  Investment.prototype.updateOne = async (instance, data, options) => {
    return instance.update(data, options)
  }

  Investment.prototype.markFailed = async (id, options) => {
    options = _.defaults({ where: { id } }, options)
    return Investment.update({ status: constants.INVESTMENTS.STATUS.FAILED }, options)
  }
  return Investment
}
