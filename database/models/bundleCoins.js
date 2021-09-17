const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const BundleCoins = sequelize.define('bundleCoins', {
    bundleId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    currency: {
      type: DataTypes.STRING(6),
      primaryKey: true
    },
    percent: {
      type: DataTypes.DECIMAL(22, 12).UNSIGNED,
      defaultValue: 0
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  BundleCoins.prototype.associate = function () {
    BundleCoins.belongsTo(sequelize.models.bundles, { foreignKey: 'bundleId', as: 'bundles', foreignKeyConstraint: true, constraints: false })
  }

  BundleCoins.prototype.findByBundleId = async (bundleId, options) => {
    const query = _.defaults({ where: { bundleId } }, options)
    return BundleCoins.findAll(query)
  }

  BundleCoins.prototype.bulkCreateForBundleId = async (bundleId, data, options) => {
    data.forEach(one => { one.bundleId = bundleId })
    return BundleCoins.bulkCreate(data, options)
  }

  BundleCoins.prototype.createOne = async (data, options) => {
    return BundleCoins.create(data, options)
  }

  BundleCoins.prototype.updateOne = async (element, data, options) => {
    return element.update(data, options)
  }

  BundleCoins.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  BundleCoins.prototype.deleteForBundleId = async (bundleId, options) => {
    return BundleCoins.destroy(_.defaults({ where: { bundleId } }, options))
  }

  return BundleCoins
}
