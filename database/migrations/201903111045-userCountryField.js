/**
 * Created by laslo on s7.2.19..
 */
'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'country', { type: Sequelize.STRING(250), after: 'state' })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'country')
  }
}
