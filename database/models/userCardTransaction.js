module.exports = function (sequelize, DataTypes) {
  const UserCardTransaction = sequelize.define('userCardTransaction', {
    amount: {
      type: DataTypes.DECIMAL(16, 8),
      defaultValue: 0
    },
    roundUp: {
      type: DataTypes.DECIMAL(16, 8),
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    // payment provider transfer id
    transaction_id: {
      type: DataTypes.STRING(100)
    },
    transaction_type: {
      type: DataTypes.STRING(32)
    },
    name: {
      type: DataTypes.STRING(250)
    },
    category: {
      type: DataTypes.JSON
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    account_id: {
      type: DataTypes.STRING(100)
    },
    accountName: {
      type: DataTypes.STRING(50)
    },
    accountMask: {
      type: DataTypes.STRING(4)
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  UserCardTransaction.prototype.associate = function () {
    UserCardTransaction.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
  }

  UserCardTransaction.prototype.findById = async (id) => {
    return UserCardTransaction.findOne({ where: { id } })
  }

  UserCardTransaction.prototype.findByUserId = async (userId) => {
    return UserCardTransaction.findAll({ where: { userId } })
  }

  UserCardTransaction.prototype.findOngoing = async (userId, lastChargeDate) => {
    return UserCardTransaction.findAll({ where: { userId, roundUp: { $gt: 0 }, date: { $gte: lastChargeDate } }, order: [['date', 'DESC']] })
  }

  UserCardTransaction.prototype.findInvested = async (userId, lastChargeDate) => {
    return UserCardTransaction.findAll({ where: { userId, roundUp: { $gt: 0 }, date: { $lt: lastChargeDate } }, order: [['date', 'DESC']] })
  }

  UserCardTransaction.prototype.createOne = async (data, options) => {
    return UserCardTransaction.create(data, options)
  }

  UserCardTransaction.prototype.updateOne = async (userCardTransaction, data, options) => {
    return userCardTransaction.update(data, options)
  }

  UserCardTransaction.prototype.bulkCreate = async (data, options) => {
    return UserCardTransaction.bulkCreate(data, options)
  }

  UserCardTransaction.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  return UserCardTransaction
}
