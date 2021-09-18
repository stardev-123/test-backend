const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const logger = require('../lib/logger')
const config = require('../config')

let transporter

const oauth2Client = new OAuth2(
  config.email.settings.auth.clientId,
  config.email.settings.auth.clientSecret,
  'https://developers.google.com/oauthplayground'
)

oauth2Client.setCredentials({
  refresh_token: '1/74ne330Er7vCXikvig4hXv3pa1DtFUaqb_v4gRo5rZ7qWGvuLM3IPHV1W7Ai6Uft'
})

const _provisionCallback = async (user, renew, callback) => {
  const tokenData = await oauth2Client.getAccessToken()
  logger.debug(null, 'Refresh email access token')
  if (!tokenData.token) {
    return callback(new Error('Unknown user'))
  } else {
    return callback(null, tokenData.token, tokenData.expiry_date)
  }
}

const _createTransport = async (tokenData) => {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.email.settings.auth.user,
      accessToken: tokenData.token,
      expires: tokenData.expiry_date,
      provisionCallback: _provisionCallback
    }
  })
}

exports.sendEmail = async (req, to, subject, html) => {
  // setup e-mail data with unicode symbols
  const mailOptions = {
    from: '"Onramp" <' + config.email.settings.auth.user + '>', // sender address
    to: to, // list of receivers
    subject: subject // Subject line
  }

  mailOptions.html = html

  // send mail with defined transport object
  try {
    await transporter.sendMail(mailOptions)
    logger.debug(req, 'Successfully sent email with subject' + subject + ' to ' + to)
  } catch (err) {
    logger.error(req, err, 'Error sending email')
  }
}

const _init = async () => {
  try {
    const tokenData = await oauth2Client.getAccessToken()
    logger.debug(null, 'Initial email oAuth data received')
    await _createTransport(tokenData)
  } catch (err) {
    // logger.error(null, err, 'Error initating email transport')
  }
}

_init()
