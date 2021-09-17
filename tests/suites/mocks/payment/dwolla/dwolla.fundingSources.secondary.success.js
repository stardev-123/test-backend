module.exports = {
  _embedded: {
    'funding-sources': [{
      '_links': {
        'self': {
          'href': 'https://api-sandbox.dwolla.com/funding-sources/fc84223a-609f-42c9-866e-2c98f17ab4fc',
          'type': 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'funding-source'
        },
        'customer': {
          'href': 'https://api-sandbox.dwolla.com/customers/241ec287-8d7a-4b69-911e-ffbea98d75ce',
          'type': 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'customer'
        }
      },
      'id': 'fc84223a-609f-42c9-866e-2c98f17ab4fb',
      'status': 'verified',
      'type': 'bank',
      'bankAccountType': 'saving',
      'name': 'Your Account #1 - SAVING',
      'created': '2017-08-16T20:06:34.000Z',
      'removed': false,
      'channels': [
        'ach'
      ],
      'bankName': 'SANDBOX TEST BANK',
      'iavAccountHolders': {
        'selected': 'account holder',
        'other': [
          'Jane Doe',
          'GeneriCompany LLC'
        ]
      },
      'fingerprint': '4cf31392f678cb26c62b75096e1a09d4465a801798b3d5c3729de44a4f54c794'
    }]
  }
}
