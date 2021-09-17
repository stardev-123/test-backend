module.exports = function (sequelize, DataTypes) {
  const PriceHistory = sequelize.define('priceHistory', {
    currency: {
      type: DataTypes.STRING(6),
      primaryKey: true
    },
    price: {
      type: DataTypes.DECIMAL(22, 12).UNSIGNED,
      defaultValue: 0
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: new Date(),
      primaryKey: true
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  PriceHistory.prototype.createOne = async (data, options) => {
    return PriceHistory.create(data, options)
  }

  PriceHistory.prototype.bulkCreate = async (data, options) => {
    return PriceHistory.bulkCreate(data, options)
  }

  PriceHistory.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  return PriceHistory
}
