const _ = require('lodash')
const { USER } = require('../../lib/constants')

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('user', {
    firstName: {
      type: DataTypes.STRING(50)
    },
    lastName: {
      type: DataTypes.STRING(50)
    },
    email: {
      type: DataTypes.STRING(50),
      unique: true
    },
    password: {
      type: DataTypes.STRING(100)
    },
    phoneNumber: {
      type: DataTypes.STRING(30),
      unique: true
    },
    birthdate: {
      type: DataTypes.DATEONLY
    },
    address1: {
      type: DataTypes.STRING(250)
    },
    address2: {
      type: DataTypes.STRING(250)
    },
    aptSuite: {
      type: DataTypes.STRING(250)
    },
    city: {
      type: DataTypes.STRING(150)
    },
    state: {
      type: DataTypes.STRING(150)
    },
    country: {
      type: DataTypes.STRING(150)
    },
    zipcode: {
      type: DataTypes.STRING(32)
    },
    fullSSN: {
      type: DataTypes.STRING(64)
    },
    ssn: {
      type: DataTypes.STRING(4)
    },
    verificationCode: {
      type: DataTypes.STRING(1000)
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // payment provider customer id
    customerId: {
      type: DataTypes.STRING(100)
    },
    providerAddress: {
      type: DataTypes.JSON
    },
    providerVerificationDate: {
      type: DataTypes.DATEONLY
    },
    verifiedAtProvider: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    investmentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    firstInvestment: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    firstInvestmentDate: {
      type: DataTypes.DATEONLY
    },
    tradingForbidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    confirmedResidence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tosStatus: {
      type: DataTypes.SMALLINT,
      defaultValue: USER.TOS.NONE
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  User.prototype.findById = async (id, options) => {
    options = _.defaults({ where: { id } }, options)
    return User.find(options)
  }

  User.prototype.findByEmail = async (email, options) => {
    return User.find(_.defaults({ where: { email } }, options))
  }

  User.prototype.findByCustomerId = async (customerId, options) => {
    return User.find(_.defaults({ where: { customerId } }, options))
  }

  User.prototype.findByPhoneNotUser = async (id, phoneNumber) => {
    return User.find({ where: { phoneNumber, id: { $ne: id } } })
  }

  User.prototype.findByPhone = async (phoneNumber) => {
    return User.find({ where: { phoneNumber } })
  }

  User.prototype.findAll = async (options) => {
    return User.findAll(options)
  }

  User.prototype.createOne = async (data, options) => {
    return User.create(data, options)
  }

  User.prototype.updateOne = async (user, data) => {
    return user.update(data)
  }

  User.prototype.updateById = async (id, data, options) => {
    options = _.defaults({ where: { id } }, options)
    return User.update(data, options)
  }

  User.prototype.updateInvestmentsCountById = async (id, options) => {
    options = _.defaults({ where: { id } }, options)
    return User.increment({ investmentsCount: 1 }, options)
  }

  User.prototype.deleteOne = async (found) => {
    return found.destroy()
  }

  return User
}
