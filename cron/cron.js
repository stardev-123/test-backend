var schedule = require('node-schedule')
var async = require('async')
var fs = require('fs')
var path = require('path')
const logger = require('../lib/logger')
const config = require('../config')

const init = (jobs) => {
  if ((config.cron && config.cron.active) || process.env.CRON_ACTIVE) {
    // Hourly jobs
    schedule.scheduleJob('1 * * * *', () => {
      async.parallel(jobs.hourly, () => {
        // handle error
        logger.info(null, 'DONE HOURLY')
      })
    })

    // Daily jobs
    schedule.scheduleJob('1 0 * * *', () => {
      async.parallel(jobs.daily, () => {
        // handle error
        logger.info(null, 'DONE DAILY')
      })
    })

    // Monthly jobs
    schedule.scheduleJob('10 0 1 * *', () => {
      async.parallel(jobs.monthly, () => {
        // handle error
        logger.info(null, 'DONE MONTHLY')
      })
    })

    // Annually
    schedule.scheduleJob('20 0 1 1 *', () => {
      async.parallel(jobs.annually, () => {
        // handle error
        logger.info(null, 'DONE ANNUALLY')
      })
    })

    // Sparhechange Charge
    schedule.scheduleJob('5 0 3 * *', () => {
      async.parallel(jobs.custom.sprachange, () => {
        // handle error
        logger.info(null, 'DONE CUSTOM')
      })
    })

    if (config.cron && config.cron.testInterval) {
      schedule.scheduleJob(config.cron.testInterval, () => {
        logger.info(null, 'RUNNING TEST JOBS')
        async.parallel(jobs.test, () => {
          // handle error
          logger.info(null, 'DONE TEST JOBS')
        })
      })
    }
  }

  // System jobs
  schedule.scheduleJob('1 0 * * *', () => {
    async.parallel(jobs.system, () => {
      // handle error
      logger.info(null, 'DONE DAILY')
    })
  })
}

((callback) => {
  var jobs = {}
  fs.readdir(path.join(__dirname, 'runners'), (err, dirs) => {
    if (err) logger.error(null, err, 'Error initiating cron job')
    dirs.forEach(function (dir) {
      jobs[dir] = require(path.join(__dirname, 'runners', dir, 'jobs'))
    })
    return callback(jobs)
  })
})(init)
