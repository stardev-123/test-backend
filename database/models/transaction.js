const _ = require('lodash')
const moment = require('moment')
const { TRANSACTIONS } = require('../../lib/constants')

module.exports = function (sequelize, DataTypes) {
  const Transaction = sequelize.define('transaction', {
    amount: {
      type: DataTypes.DECIMAL(22, 12),
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    type: {
      type: DataTypes.SMALLINT
    },
    // payment provider transfer id
    providerTransactionId: {
      type: DataTypes.STRING(50)
    },
    providerTransactionTime: {
      type: DataTypes.DATE
    },
    cancelationDate: {
      type: DataTypes.DATE
    },
    cancelationReason: {
      type: DataTypes.STRING(50)
    },
    status: {
      type: DataTypes.SMALLINT
    },
    singleInvestment: {
      type: DataTypes.BOOLEAN
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Transaction.prototype.associate = function () {
    Transaction.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
    Transaction.belongsTo(sequelize.models.bankAccount, { foreignKeyConstraint: true, constraints: false })
    Transaction.belongsTo(sequelize.models.investment, { foreignKeyConstraint: true, constraints: false })
    Transaction.belongsTo(sequelize.models.transaction, { as: 'cancel', foreignKeyConstraint: true, constraints: false })
  }

  Transaction.prototype.findById = async (id, options) => {
    return Transaction.findOne(_.defaults({ where: { id } }, options))
  }
  Transaction.prototype.findByProviderTransactionId = async (providerTransactionId, options) => {
    return Transaction.findOne(_.defaults({ where: { providerTransactionId } }, options))
  }

  Transaction.prototype.findByUserId = async (userId, options) => {
    return Transaction.findAll(_.defaults({ where: { userId } }, options))
  }

  Transaction.prototype.findByInvestmentId = async (investmentId, options) => {
    return Transaction.findAll(_.defaults({ where: { investmentId } }, options))
  }

  Transaction.prototype.findByUserIdBankChargesForCurrentWeek = async (userId, options) => {
    const query = { where:
      {
        userId,
        type: TRANSACTIONS.TYPE.ADD_FUNDS,
        providerTransactionTime: { $gte: moment().isoWeekday(1).startOf('day').toDate() }
      }
    }
    return Transaction.findAll(_.defaults(query, options))
  }

  Transaction.prototype.findActivityByUserId = async (userId, options) => {
    const queryOptions = {
      where: { userId,
        $or: [
          { type: { $in: [0, 4] } },
          { $and: [{ singleInvestment: true }, { type: { $in: [2, 3] } }] },
          { $and: [{ singleInvestment: false }, { type: { $in: [1, 5] } }] }
        ] },
      raw: true,
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
      attributes: ['id', 'type', 'status', 'amount', 'currency', 'createdAt', 'singleInvestment']
    }
    return Transaction.findAll(_.defaults(queryOptions, options))
  }

  Transaction.prototype.findAll = async () => {
    return Transaction.findAll({})
  }

  Transaction.prototype.createOne = async (data, options) => {
    return Transaction.create(data, options)
  }

  Transaction.prototype.updateOne = async (transaction, data, options) => {
    return transaction.update(data, options)
  }

  Transaction.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  return Transaction
}
