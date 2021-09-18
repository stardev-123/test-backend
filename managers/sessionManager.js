/**
 * Created by laslo on 27.12.18..
 */

const redis = require('redis')
const { promisify } = require('util')
const logger = require('../lib/logger')
const config = require('../config')
const client = redis.createClient(config.redis.port, config.redis.host)
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)
const delAsync = promisify(client.del).bind(client)

client.select(config.redis.sessionStorage)
client.on('error', (err) => {
  // logger.error(null, err, 'Redis error')
})
client.on('connect', () => {
  // logger.debug(null, 'Redis connected')
})
/**
 * Finds user information based on passed key
 *
 * @param key - session token
 * @returns {Promise<null>}
 * @private
 */
const _getKey = async (key) => {
  const userInfo = await getAsync(key)
  return (userInfo ? JSON.parse(userInfo) : null)
}
/**
 * Write user information to redis
 * @param key - newly generated session token
 * @param user - user information
 * @returns {Promise<void>}
 * @private
 */
const _setKey = async (key, user, ...args) => {
  await setAsync(key, JSON.stringify(user), ...args)
}
/**
 * Remove authenticated user from redis by token
 *
 * @param key - authentication token
 * @returns {Promise<void>}
 * @private
 */
const _removeKey = async (key) => {
  await delAsync(key)
}
exports.getKey = _getKey
exports.setKey = _setKey
exports.removeKey = _removeKey
