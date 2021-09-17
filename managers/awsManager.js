const AWS = require('aws-sdk')
const fs = require('fs')
const logger = require('../lib/logger')
const config = require('../config')

const s3 = new AWS.S3({
  accessKeyId: config.S3.accessKey,
  secretAccessKey: config.S3.secretKey,
  signatureVersion: 'v4',
  region: config.S3.region
})

exports.uploadFile = async (req, fullPath, fileName) => {
  logger.debug(req, 'Uploading file ', fullPath)
  fs.readFile(fullPath, (err, data) => {
    if (err) throw err // Something went wrong!
    const params = {
      Bucket: config.S3.bucket,
      Key: fileName,
      Body: data
    }
    s3.upload(params, (err) => {
      if (err) throw err // Something went wrong!
      fs.unlink(fullPath, (err) => {
        if (err) {
          logger.error(req, err, 'Error uploading file ', { fullPath, fileName })
        }
        logger.debug(req, 'Uploaded file ', { fullPath, fileName })
      })
    })
  })
}
