module.exports = {
  'code': 'ValidationError',
  'message': 'Validation error(s) present. See embedded errors list for more details.',
  '_embedded': {
    'errors': [{
      'code': 'Invalid',
      'message': 'State must be 2-letter abbreviation.',
      'path': '/state',
      '_links': {}
    }]
  }
}
