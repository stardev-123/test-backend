const _ = require('lodash')
const constants = require('../../lib/constants')

module.exports = function (sequelize, DataTypes) {
  const InvestmentTransaction = sequelize.define('investmentTransaction', {
    investmentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    type: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    providerTransactionId: {
      type: DataTypes.STRING(50)
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: constants.INVESTMENTS.STATUS.INITIALIZED
    },
    currency: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    volume: {
      type: DataTypes.DECIMAL(22, 12).UNSIGNED,
      defaultValue: 0
    },
    amount: {
      type: DataTypes.DECIMAL(22, 12).UNSIGNED,
      defaultValue: 0
    },
    price: {
      type: DataTypes.DECIMAL(22, 12).UNSIGNED,
      defaultValue: 0
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  InvestmentTransaction.prototype.associate = function () {
    InvestmentTransaction.belongsTo(sequelize.models.investment, { foreignKeyConstraint: true, constraints: false })
  }

  InvestmentTransaction.prototype.findForInvestmentId = async (investmentId, options) => {
    options = _.defaults({ where: { investmentId } }, options)
    return InvestmentTransaction.findAll(options)
  }

  InvestmentTransaction.prototype.findForDetailsForInvestmentId = async (investmentId) => {
    const queryOptions = {
      where: { investmentId },
      raw: true,
      order: [['currency', 'ASC']],
      attributes: ['currency', 'price', 'volume', 'amount']
    }
    return InvestmentTransaction.findAll(queryOptions)
  }

  InvestmentTransaction.prototype.findForProviderTransactionId = async (providerTransactionId, options) => {
    options = _.defaults({ where: { providerTransactionId: providerTransactionId } }, options)
    return InvestmentTransaction.findAll(options)
  }

  InvestmentTransaction.prototype.createOne = async (data, options) => {
    return InvestmentTransaction.create(data, options)
  }

  InvestmentTransaction.prototype.updateOne = async (instance, data, options) => {
    return instance.update(data, options)
  }

  return InvestmentTransaction
}
