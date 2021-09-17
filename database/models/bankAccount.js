const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const BankAccount = sequelize.define('bankAccount', {
    name: {
      type: DataTypes.STRING(50)
    },
    mask: {
      type: DataTypes.STRING(4)
    },
    type: {
      type: DataTypes.STRING(50)
    },
    subtype: {
      type: DataTypes.STRING(50)
    },
    // for payment provider
    fundingSourceId: {
      type: DataTypes.STRING(100),
      unique: true
    },
    primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // for plaid, for accessing everything (gets generated after login in account)
    accessToken: {
      type: DataTypes.STRING(100)
    },
    // from plaid frontend response
    accountId: {
      type: DataTypes.STRING(100)
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  BankAccount.prototype.associate = function () {
    BankAccount.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
    BankAccount.belongsTo(sequelize.models.institution, { foreignKeyConstraint: true, constraints: false })
  }

  BankAccount.prototype.findById = async (id, options) => {
    return BankAccount.find(_.defaults({ where: { id } }, options))
  }

  BankAccount.prototype.findByFundingSourceId = async (fundingSourceId, options) => {
    return BankAccount.findOne(_.defaults({ where: { fundingSourceId } }, options))
  }

  BankAccount.prototype.findByUserId = async (userId) => {
    return BankAccount.findAll(
      {
        where: {
          userId: userId
        }
      }
    )
  }

  BankAccount.prototype.findPrimaryForUserId = async (userId, options) => {
    return BankAccount.findOne(_.defaults({ where: { userId: userId, primary: true } }, options))
  }

  BankAccount.prototype.findAll = async () => {
    return BankAccount.findAll({})
  }

  BankAccount.prototype.createOne = async (data) => {
    return BankAccount.create(data)
  }

  BankAccount.prototype.updateOne = async (bankAccount, data, options) => {
    return bankAccount.update(data, options)
  }

  BankAccount.prototype.deleteOne = async (found) => {
    return found.destroy()
  }

  return BankAccount
}
