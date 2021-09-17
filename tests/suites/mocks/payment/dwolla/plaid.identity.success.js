/**
 * Created by laslo on 21.1.19..
 */

module.exports = {
  'accounts': [{}],
  'identity': {
    'addresses': [
      {
        'accounts': [
          'Plaid Checking 0000',
          'Plaid Saving 1111',
          'Plaid CD 2222'
        ],
        'data': {
          'city': 'Malakoff',
          'state': 'NY',
          'street': '2992 Cameron Road',
          'zip': '14236'
        },
        'primary': true
      },
      {
        'accounts': [
          'Plaid Credit Card 3333'
        ],
        'data': {
          'city': 'San Matias',
          'state': 'CA',
          'street': '2493 Leisure Lane',
          'zip': '93405-2255'
        },
        'primary': false
      }
    ],
    'emails': [
      {
        'data': 'accountholder0@example.com',
        'primary': true,
        'type': 'primary'
      }
    ],
    'names': [
      'Alberta Bobbeth Charleson'
    ],
    'phone_numbers': [{
      'primary': true,
      'type': 'home',
      'data': '4673956022'
    }]
  },
  'item': { },
  'request_id': 'm8MDnv9okwxFNBV'
}
