/**
 * Created by laslo on 13/09/18.
 */
const router = require('express').Router();
const apiController = require('../controller/apiController')

/**
 * @api {post} /api/email
 * Sends Email template to send email
 * @apiVersion 1.0.0
 * @apiName Update device token
 * @apiGroup Device
 * @apiDescription Update device token

 * @apiParam (body) (String) email Email to send to
 * @apiParam (body) (String) template Template name
 * @apiParam (body) (Object) payload Payload needed for email template
 *
 * @apiHeader {String} authorization Authorization token
 *
 * @apiUse apiSuccess
 * @apiUse forbidden
 * @apiUse badRequest
 */
router.post('/email', apiController.sendEmail)

module.exports = router;