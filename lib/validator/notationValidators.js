var apidoc = require('../../doc/api_data.json')
var _validators = {}

function _parseValidators (docs) {
  for (var key in docs) {
    var route = docs[key]
    var validator = {
      type: 'object',
      required: [],
      properties: {}
    }

    if (route.parameter) {
      for (var field in route.parameter.fields) {
        route.parameter.fields[field].forEach(function (param) {
          if (param.group === 'body') {
            if (!param.optional) {
              validator.required.push(param.field)
            }
            validator.properties[param.field] = {
              type: param.type.toLowerCase(),
              source: param.group === 'Parameter' ? 'body' : param.group
            }
          }
        })
      }
    }
    if (!_validators[route.url]) {
      _validators[route.url] = {}
    }
    _validators[route.url][route.type] = validator
  }
  return _validators
}

module.exports = {

  allValidators: Object.keys(_validators).length === 0 ? _parseValidators(apidoc) : _validators

}
