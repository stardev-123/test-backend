// ERRORS
// ------------------------------------------------------------------------------------------
// Current Errors.
// ------------------------------------------------------------------------------------------

/**
 * @apiDefine apiSuccess
 * @apiVersion 1.0.0
 * @apiSuccess (200) {Boolean} success true
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200
 {
     "success": true
 }
 */

/**
 * @apiDefine notAuthorized
 * @apiVersion 1.0.0
 * @apiError (401) {String} error No Access Right
 * @apiErrorExample Not Authenticated:
 *     HTTP/1.1 401 Not Authenticated
     {
       "error": "No Access Right"
    }
 *
 */
/**
 * @apiDefine notEnoughMoney
 * @apiVersion 1.0.0
 * @apiError (401) {String} error Not enough money on your bank account
 * @apiErrorExample Not Enough Money:
 * HTTP/1.1 401 Not Enough Money
 {
   "error": {
     "code": "401",
     "message": "Not enough money on your bank account"
   }
 }
 *
 */
/**
 * @apiDefine notFound
 * @apiVersion 1.0.0
 * @apiError (404) {String} error Not Found
 * @apiErrorExample Not Found:
 *     HTTP/1.1 404 Not Found
    {
      "error": "Not Found"
    }
 *
 */
/**
 * @apiDefine badRequest
 * @apiVersion 1.0.0
 * @apiError (400) {String} error Bad Request
 * @apiErrorExample Bad request:
 * HTTP/1.1 400 Bad request
 {
   "error": {
     "code": "400",
     "message": "Bad request"
   }
 }
 *
 */
/**
 * @apiDefine forbidden
 * @apiVersion 1.0.0
 * @apiError (405) {String} error Forbidden
 * @apiErrorExample Forbidden:
 * HTTP/1.1 405 Forbidden
 {
   "error": {
     "code": "405",
     "message": "Forbidden"
   }
 }
 *
 */
/**
 * @apiDefine expired
 * @apiVersion 1.0.0
 * @apiError (403) {String} error Session expired
 * @apiErrorExample Expired:
 * HTTP/1.1 403 Expired
 {
   "error": {
     "code": "403",
     "message": "Session expired"
   }
 }
 *
 */
/**
 * @apiDefine internalError
 * @apiVersion 1.0.0
 * @apiError (500) {String} error Internal server error
 * @apiErrorExample Internal server error:
 * HTTP/1.1 500 Internal server error
 {
   "error": {
     "code": "500",
     "message": "Internal server error"
   }
 }
 *
 */
/**
 * @apiDefine notAllowed
 * @apiVersion 0.1.0
 * @apiError (405) {String} error Not allowed
 * @apiErrorExample Not allowed:
 * HTTP/1.1 405 Not allowed
 {
   "error": {
   "code": "405",
     "message": "Not allowed"
 }
 }
 *
 */
/**
 * @apiDefine alreadyRegistered
 * @apiVersion 1.0.0
 * @apiError (406) {String} error Email already registered
 * @apiErrorExample Already registered:
 * HTTP/1.1 406 You are already registered
 {
   "error": {
     "code": "406",
     "message": "Email already registered"
   }
 }
 *
 */
/**
 * @apiDefine invalidCredentials
 * @apiVersion 1.0.0
 * @apiError (409) {String} error Invalid username/password
 * @apiErrorExample Invalid username/password:
 * HTTP/1.1 409 Invalid username/password
 {
   "error": {
     "code": "409",
     "message": "Invalid username/password"
   }
 }
 *
 */
/**
 * @apiDefine bodyRequired
 * @apiVersion 1.0.0
 * @apiError (411) {String} error Request body is required
 * @apiErrorExample Request Body is required:
 * HTTP/1.1 411 Request Body required
 {
   "error": {
     "code": "411",
     "message": "Request body is required"
   }
 }
 *
 */
/**
 * @apiDefine notVerified
 * @apiVersion 1.0.0
 * @apiError (412) {String} error Phone is not verified
 * @apiErrorExample Not verified:
 * HTTP/1.1 412 Phone Not Verified
 {
   "error": {
     "code": "412",
     "message": "Phone is not verified"
   }
 }
 *
 */
/**
 * @apiDefine invalidVerificationCode
 * @apiVersion 1.0.0
 * @apiError (413) {String} error Invalid Verification Code
 * @apiErrorExample Invalid Verification Code:
 * HTTP/1.1 413 Invalid Verification Code
 {
   "error": {
     "code": "413",
     "message": "Invalid Verification Code"
   }
 }
 *
 */
/**
 * @apiDefine verificationCodeExpired
 * @apiVersion 1.0.0
 * @apiError (414) {String} error Verification Code Expired
 * @apiErrorExample Verification Code Expired:
 * HTTP/1.1 414 Verification Code Expired
 {
   "error": {
     "code": "414",
     "message": "Verification Code Expired"
   }
 }
 *
 */
/**
 * @apiDefine invalidPaymentData
 * @apiVersion 1.0.0
 * @apiError (400) {String} error Invalid Payment Data
 * @apiErrorExample Invalid Payment Data:
 * HTTP/1.1 400 Invalid Payment Data
 {
   "error": {
     "code": "400",
     "message": "Invalid Payment Data"
   }
 }
 *
 */
