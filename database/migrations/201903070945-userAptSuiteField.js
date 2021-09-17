/**
 * Created by laslo on s7.2.19..
 */
'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'aptSuite', { type: Sequelize.STRING(250), after: 'address2' })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'aptSuite')
  }
}
