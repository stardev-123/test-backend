/**
 * Created by laslo on 24.12.18..
 */

const path = require('path')
const moment = require('moment')
const util = require('../../../lib/util')
const os = require('os')
const awsManager = require('../../../managers/awsManager')
const logger = require('../../../lib/logger')
const config = require('../../../config')

const LOGS_FOLDER = path.join(__dirname, '..', '..', '..', config.log.fileLogParams.folder || 'log')

module.exports.backupLogs = async () => {
  if (config.log.fileLogParams.backupToS3) {
    const req = util.returnBatchRequest()
    try {
      const date = moment().subtract(1, 'day').format(config.log.fileLogParams.datePattern)
      const logFileName = config.log.fileLogParams.prefix + date + '.' + config.log.fileLogParams.extension
      const uploadFileName = os.hostname() + '_' + logFileName
      logger.info(req, 'logFileName', { logFileName, uploadFileName })

      awsManager.uploadFile(req, path.join(LOGS_FOLDER, logFileName), uploadFileName)
    } catch (err) {
      logger.error(req, err, 'Error in logs backup')
    }
  }
}
