const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const Admin = sequelize.define('admins', {
    firstName: {
      type: DataTypes.STRING(50)
    },
    lastName: {
      type: DataTypes.STRING(50)
    },
    email: {
      type: DataTypes.STRING(50),
      unique: true
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Admin.prototype.findById = async (id, options) => {
    options = _.defaults({ where: { id } }, options)
    return Admin.find(options)
  }

  Admin.prototype.findByEmail = async (email, options) => {
    return Admin.find(_.defaults({ where: { email } }, options))
  }

  Admin.prototype.findAll = async (options) => {
    return Admin.findAll(_.defaults({ where: {} }, options))
  }

  Admin.prototype.createOne = async (data, options) => {
    return Admin.create(data, options)
  }

  Admin.prototype.updateOne = async (record, data) => {
    return record.update(data)
  }

  Admin.prototype.deleteOne = async (record) => {
    return record.destroy()
  }

  return Admin
}
