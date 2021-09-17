module.exports = function (sequelize, DataTypes) {
  const PriceHourlyHistory = sequelize.define('priceHourlyHistory', {
    currency: {
      type: DataTypes.STRING(6),
      primaryKey: true
    },
    price: {
      type: DataTypes.DECIMAL(22, 12).UNSIGNED,
      defaultValue: 0
    },
    time: {
      type: DataTypes.INTEGER(11),
      primaryKey: true
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  PriceHourlyHistory.prototype.createOne = async (data, options) => {
    return PriceHourlyHistory.create(data, options)
  }

  PriceHourlyHistory.prototype.bulkCreate = async (data, options) => {
    return PriceHourlyHistory.bulkCreate(data, options)
  }

  PriceHourlyHistory.prototype.deleteOlderThenTime = async (time) => {
    return PriceHourlyHistory.destroy({ where: { time: { $lt: time } } })
  }

  PriceHourlyHistory.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  return PriceHourlyHistory
}
