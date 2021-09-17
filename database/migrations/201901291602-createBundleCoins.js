/**
 * Created by laslo on 29.1.19..
 */
'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('bundleCoins', {
      bundleId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'bundles',
          key: 'id'
        }
      },
      currency: {
        type: Sequelize.STRING(6),
        primaryKey: true
      },
      percent: {
        type: Sequelize.DECIMAL(22, 12).UNSIGNED,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('bundleCoins')
  }
}
