var allValidators = require('./notationValidators.js').allValidators

var _ = require('lodash')

module.exports = {
  allValidators: allValidators,
  getSchema: function (routeUrl, method) {
    method = method.toLowerCase()
    var baseUrl = routeUrl
    if (baseUrl.indexOf('?') !== -1) {
      baseUrl = baseUrl.substr(0, baseUrl.indexOf('?'))
    }
    var route = allValidators[baseUrl] ? allValidators[baseUrl] : {}
    if (_.isEmpty(route)) {
      for (var key in allValidators) {
        var keyRegExp = '^' + key.replace(/{[a-zA-Z0-9-$]*}/g, '[a-zA-Z0-9-$]+') + '$'
        var match = new RegExp(keyRegExp)
        if (match.exec(routeUrl)) {
          route = allValidators[key]
        }
      }
    }
    return route[method] ? route[method] : {}
  }
}
