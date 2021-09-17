const _ = require('lodash')

module.exports = function (sequelize, DataTypes) {
  const PortfolioInvestment = sequelize.define('portfolioInvestment', {
    name: {
      type: DataTypes.STRING(50)
    },
    percent: {
      type: DataTypes.DOUBLE
    },
    currency: {
      type: DataTypes.STRING(6),
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    underscored: false,
    freezeTableName: false
  })

  PortfolioInvestment.prototype.associate = function () {
    PortfolioInvestment.belongsTo(sequelize.models.user, { foreignKeyConstraint: true, constraints: false })
  }

  PortfolioInvestment.prototype.findById = async (id) => {
    return PortfolioInvestment.find(
      {
        where: {
          id: id
        }
      }
    )
  }

  PortfolioInvestment.prototype.findByUserId = async (userId, options) => {
    return PortfolioInvestment.findAll(_.defaults({ where: { userId }, order: [['percent', 'DESC']] }, options))
  }

  PortfolioInvestment.prototype.findByUserIdPretty = async (userId) => {
    return PortfolioInvestment.findAll(
      {
        attributes: ['name', 'percent', 'currency'],
        where: {
          userId: userId
        }
      }
    )
  }

  PortfolioInvestment.prototype.findAll = async () => {
    return PortfolioInvestment.findAll({})
  }

  PortfolioInvestment.prototype.createOne = async (data) => {
    return PortfolioInvestment.create(data)
  }

  PortfolioInvestment.prototype.bulkCreate = async (data, options) => {
    return PortfolioInvestment.bulkCreate(data, options)
  }

  PortfolioInvestment.prototype.updateOne = async (portfolioInvestment, data) => {
    return portfolioInvestment.update(data)
  }

  PortfolioInvestment.prototype.deleteOne = async (found) => {
    return found.destroy()
  }

  return PortfolioInvestment
}
