// Imports
const {
  Sequelize
} = require('sequelize')
const logger = require('../lib/logger')
const config = require('../config')

// Load database config
const databaseConfig = config.mysql
const pool = databaseConfig.pool || { max: 20, min: 2 }

const host = process.env.NODE_DB_HOST || databaseConfig.host || 'localhost'
const dbName = process.env.NODE_DB_NAME || databaseConfig.database
const dbUsername = process.env.NODE_DB_USER || databaseConfig.username
const dbPassword = process.env.NODE_DB_PASS || databaseConfig.password

const dialectOptions = databaseConfig.dialectOptions || { decimalNumbers: true }

logger.system(null, 'Connecting to DB with params', config.mysql)
// Create new database connection
const sequelizeConnection = new Sequelize(dbName, dbUsername, dbPassword, {
  host,
  dialect: databaseConfig.dialect,
  dialectOptions,
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },
  pool,
  logging: false
})

// test sequelize db connection
const initConnection = async () => {
  try {
    await sequelizeConnection.authenticate()
    logger.system(null, 'Mysql sequelize - connection OK to: ' + host + '/' + dbName)
  } catch (err) {
    logger.error(null, err, 'Unable to connect to the database, err is ')
  }
}

initConnection()

module.exports = sequelizeConnection
