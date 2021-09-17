/**
 * Created by laslo on 18.1.19..
 */

const config = require('../../config')
const logger = require('../../lib/logger')

logger.system(null, 'DB confgiuration', config.mysql)
console.log('running in enviroment', config.env)

module.exports = config.mysql
