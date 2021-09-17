/**
 * Here you can place your jobs which should be executed once a day
 */

const logs = require('../../tasks/logs')
const config = require('../../../config')

module.exports = {
  logs: () => {
    if (config.log.logsToFile) {
      logs.backupLogs()
    }
  }
}
