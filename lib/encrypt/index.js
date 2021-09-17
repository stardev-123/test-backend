/**
 * Created by laslo on 05/11/18.
 */

const crypto = require('crypto')
const config = require('../../config')

const ALGORITHM = 'aes-256-ctr'
const key = Buffer.concat([Buffer.from(config.token.userData)], 32)
const IV = Buffer.concat([Buffer.from(config.token.userData)], 16)

module.exports.encrypt = (text) => {
  if (!text) return text
  if (!config.encryptSensitiveData) return text

  try {
    const cipher = crypto.createCipheriv(ALGORITHM, key, IV)
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  } catch (err) {
    return text
  }
}

module.exports.decrypt = (text) => {
  if (!text) return text
  if (!config.encryptSensitiveData) return text
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, IV)
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  } catch (err) {
    return text
  }
}
