const env = process.env.NODE_ENV || 'local'
const cfg = require('./config.' + env + '.js')

module.exports = cfg
