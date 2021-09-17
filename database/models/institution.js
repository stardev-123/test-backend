const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const Institution = sequelize.define('institution', {
    name: {
      type: DataTypes.STRING(150)
    },
    code: {
      type: DataTypes.STRING(32)
    },
    // for plaid, for accessing everything (gets generated after login in account)
    accessToken: {
      type: DataTypes.STRING(100)
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  Institution.prototype.associate = function () {
    Institution.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
  }

  Institution.prototype.findById = async (id, options) => {
    return Institution.find(_.defaults({ where: { id } }, options))
  }

  Institution.prototype.findByUserId = async (userId, options) => {
    return Institution.findAll(_.defaults({ where: { userId } }, options))
  }

  Institution.prototype.findByUserIdAndCode = async (userId, code, options) => {
    return Institution.findOne(_.defaults({ where: { userId, code } }, options))
  }

  Institution.prototype.findAll = async () => {
    return Institution.findAll({})
  }

  Institution.prototype.createOne = async (data) => {
    return Institution.create(data)
  }

  Institution.prototype.updateOne = async (institution, data) => {
    return institution.update(data)
  }

  Institution.prototype.deleteOne = async (found) => {
    return found.destroy()
  }

  return Institution
}
