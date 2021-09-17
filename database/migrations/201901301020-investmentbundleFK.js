/**
 * Created by laslo on 29.1.19..
 */
'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('investments', 'bundleId', { type: Sequelize.INTEGER(11),
      references: {
        model: 'bundles',
        key: 'id'
      } })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('investments', 'bundleId')
  }
}
