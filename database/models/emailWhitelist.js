const _ = require('lodash')
const constants = require('../../lib/constants')

module.exports = function (sequelize, DataTypes) {
  const EmailWhitelist = sequelize.define('emailWhitelist', {
    // payment provider transfer id
    email: {
      type: DataTypes.STRING(150),
      primaryKey: true
    },
    status: {
      type: DataTypes.SMALLINT,
      defaultValue: constants.USER.EMAIL_STATUSES.VALID
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  EmailWhitelist.prototype.findByEmail = async (email, options) => {
    options = _.defaults({ where: { email } }, options)
    return EmailWhitelist.findOne(options)
  }

  EmailWhitelist.prototype.findWhitelistedEmail = async (email, domain, options) => {
    options = _.defaults({ where: { $or: [ { email }, { email: '*@' + domain } ] } }, options)
    return EmailWhitelist.findOne(options)
  }

  EmailWhitelist.prototype.findByStatus = async (status, options) => {
    const query = { where: {} }
    if (status) query.where.status = status
    options = _.defaults(query, options)
    return EmailWhitelist.findAll(options)
  }

  EmailWhitelist.prototype.findAll = async (options) => {
    return EmailWhitelist.findAll(options)
  }

  EmailWhitelist.prototype.createOne = async (data) => {
    return EmailWhitelist.create(data)
  }

  EmailWhitelist.prototype.updateStatus = async (email, status) => {
    return EmailWhitelist.update({ status }, { where: { email } })
  }

  EmailWhitelist.prototype.updateOne = async (instance, data, options) => {
    return instance.update(data, options)
  }

  EmailWhitelist.prototype.deleteOne = async (found) => {
    return found.destroy()
  }

  EmailWhitelist.prototype.deleteAll = async (found) => {
    return EmailWhitelist.destroy({ where: {} })
  }

  EmailWhitelist.prototype.bulkCreate = async (data, options) => {
    return EmailWhitelist.bulkCreate(data, options)
  }

  return EmailWhitelist
}
