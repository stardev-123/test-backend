const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const Bundle = sequelize.define('bundles', {
    name: {
      type: DataTypes.STRING(50)
    },
    description: {
      type: DataTypes.STRING
    },
    icon: {
      type: DataTypes.STRING(250)
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Bundle.prototype.findById = async (id, options) => {
    const query = _.defaults({ where: { id } }, options)
    return Bundle.findOne(query)
  }

  Bundle.prototype.findAll = async (options) => {
    return Bundle.findAll(options)
  }

  Bundle.prototype.findAllActive = async (options) => {
    return Bundle.findAll(_.defaults({ where: { active: true } }, options))
  }

  Bundle.prototype.createOne = async (data, options) => {
    return Bundle.create(data, options)
  }

  Bundle.prototype.deactivate = async (element, options) => {
    return element.update({ active: false }, options)
  }

  Bundle.prototype.updateOne = async (element, data, options) => {
    return element.update(data, options)
  }

  Bundle.prototype.deleteOne = async (found, options) => {
    return found.destroy(options)
  }

  return Bundle
}
