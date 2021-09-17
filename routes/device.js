/**
 * Created by laslo on 13/09/18.
 */
const router = require('express').Router()
const deviceController = require('../controller/deviceController')

/**
 * @api {put} /user/{userId}/device/{deviceId}
 * Update device token
 * @apiVersion 1.0.0
 * @apiName Update device token
 * @apiGroup Device
 * @apiDescription Update device token
 *
 * @apiParam (path){String} userId User id
 * @apiParam (path){String} deviceId Unique Id of the device
 *
 * @apiParam (body) (String) token Device push token
 *
 * @apiHeader {String} x-access-token User token for api authentication
 *
 * @apiUse apiSuccess
 * @apiUse expired
 * @apiUse forbidden
 * @apiUse badRequest
 * @apiUse notFound
 */
router.put('/device/:deviceId', deviceController.updateDevice)

module.exports = router
