exports.errorHandlerMiddleware = function (err, req, res, next) {
  res.status(err.code || 500)
  res.send({ error: err })
}
