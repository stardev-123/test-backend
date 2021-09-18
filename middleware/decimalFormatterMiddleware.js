/**
 * Created by laslo on 21.2.19..
 */

const util = require('../lib/util')
const config = require('../config')

/**
 * Schema for Request body with defined route key and formatting object
 *
 * Formatting Object {
 *   field: Formatting Rule
 * }
 *
 * field - either the actuoal field name or put ARRAY if expecting initial object is Array
 *
 * Formatting Rule - either precision or Formatting object for deeper object format
 * @type Object
 */
const inputSchema = {
  '/investment/portfolio': {
    'amount': config.precision.AMOUNT_PRECISION,
    'prices': { 'buy_price': config.precision.COIN_PRICE_PRECISION, 'sell_price': config.precision.COIN_PRICE_PRECISION },
    'portfolio': { 'percent': config.precision.PERCENT_PRECISION }
  },
  '/investment/single': {
    'amount': config.precision.AMOUNT_PRECISION,
    'prices': { 'buy_price': config.precision.COIN_PRICE_PRECISION, 'sell_price': config.precision.COIN_PRICE_PRECISION }
  },
  '/investment': {
    'amount': config.precision.AMOUNT_PRECISION
  },
  '/payout': {
    'amount': config.precision.AMOUNT_PRECISION
  },
  '/sell': {
    'ratio': { 'amount': config.precision.COIN_AMOUNT_PRECISION },
    'prices': { 'buy_price': config.precision.COIN_PRICE_PRECISION, 'sell_price': config.precision.COIN_PRICE_PRECISION }
  },
  '/recurring': {
    'amount': config.precision.AMOUNT_PRECISION
  }
}

/**
 * Schema for json response with defined route key and formatting object
 *
 * Formatting Object {
 *   field: Formatting Rule
 * }
 *
 * field - either the actuoal field name or put ARRAY if expecting initial object is Array
 *
 * Formatting Rule - either precision or Formatting object for deeper object format
 * @type Object
 */
const outputSchema = {
  '/register': {
    'balance': {
      'amount': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'pending': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'price': config.precision.COIN_PRICE_PRECISION,
      'value': config.precision.AMOUNT_PRECISION
    },
    'portfolio': { 'percent': config.precision.PERCENT_PRECISION }
  },
  '/login': {
    'balance': {
      'amount': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'pending': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'price': config.precision.COIN_PRICE_PRECISION,
      'value': config.precision.AMOUNT_PRECISION
    },
    'portfolio': {
      'percent': config.precision.PERCENT_PRECISION
    }
  },
  '/basic': {
    'balance': {
      'amount': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'pending': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'price': config.precision.COIN_PRICE_PRECISION,
      'value': config.precision.AMOUNT_PRECISION
    },
    'portfolio': {
      'percent': config.precision.PERCENT_PRECISION
    }
  },
  '/portfolio': {
    'ARRAY': { 'percent': config.precision.PERCENT_PRECISION }
  },
  '/portfolio/update': {
    'ARRAY': { 'percent': config.precision.PERCENT_PRECISION }
  },
  '/config': {
    'firstInvestmentLimit': config.precision.AMOUNT_PRECISION
  },
  '/balance': {
    'ARRAY': {
      'amount': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'pending': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'price': config.precision.COIN_PRICE_PRECISION,
      'value': config.precision.AMOUNT_PRECISION
    }
  },
  '/balance/history': {
    'history': { 'value': config.precision.AMOUNT_PRECISION },
    'periodChangeUSD': config.precision.AMOUNT_PRECISION,
    'periodChange': config.precision.PERCENT_PRECISION,
    'totalChangeUSD': config.precision.AMOUNT_PRECISION,
    'totalChange': config.precision.PERCENT_PRECISION,
    'startValue': config.precision.AMOUNT_PRECISION,
    'periodValue': config.precision.AMOUNT_PRECISION,
    'currentValue': config.precision.AMOUNT_PRECISION
  },
  '/bundle': {
    'coins': { 'percent': config.precision.PERCENT_PRECISION },
  },
  '/investment/portfolio': {
    'data': {
      'amount': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'transactions': {
        'price': config.precision.COIN_PRICE_PRECISION,
        'volume': config.precision.COIN_AMOUNT_PRECISION,
        'amount': config.precision.COIN_AMOUNT_PRECISION
      }
    }
  },
  '/investment/single': {
    'data': {
      'amount': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'transactions': {
        'price': config.precision.COIN_PRICE_PRECISION,
        'volume': config.precision.COIN_AMOUNT_PRECISION,
        'amount': config.precision.COIN_AMOUNT_PRECISION
      }
    }
  },
  '/payout': {
    'amount': config.precision.AMOUNT_PRECISION
  },
  '/sell': {
    'data': {
      'amount': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
      'transactions': {
        'price': config.precision.COIN_PRICE_PRECISION,
        'volume': config.precision.COIN_AMOUNT_PRECISION,
        'amount': config.precision.COIN_AMOUNT_PRECISION
      }
    }
  },
  'investment/prices': {
    'prices': {
      'buy_price': config.precision.COIN_PRICE_PRECISION,
      'sell_price': config.precision.COIN_PRICE_PRECISION
    }
  },
  '/prices': {
    'ARRAY': {
      'USD': config.precision.AMOUNT_PRECISION,
      'marketCap': config.precision.COIN_AMOUNT_PRECISION,
      'volume': config.precision.COIN_AMOUNT_PRECISION,
      'supply': config.precision.COIN_AMOUNT_PRECISION
    }
  },
  '/recurring': {
    'amount': config.precision.AMOUNT_PRECISION
  },
  '/recurrings': {
    'ARRAY': { 'amount': config.precision.AMOUNT_PRECISION }
  },
  '/sparechange': {
    'invested': config.precision.AMOUNT_PRECISION,
    'ongoing': config.precision.AMOUNT_PRECISION,
    'charge': config.precision.AMOUNT_PRECISION,
    'sparechange': {
      'invested': config.precision.AMOUNT_PRECISION,
      'ongoing': config.precision.AMOUNT_PRECISION,
      'charge': config.precision.AMOUNT_PRECISION
    },
    'ongoingTransactions': { 'amount': config.precision.AMOUNT_PRECISION, 'roundUp': config.precision.AMOUNT_PRECISION },
    'investedTransaction': { 'transactions': { 'amount': config.precision.AMOUNT_PRECISION, 'roundUp': config.precision.AMOUNT_PRECISION } }
  },
  '/histominute': {
    'change': config.precision.PERCENT_PRECISION,
    'prices': { 'price': config.precision.COIN_PRICE_PRECISION }
  },
  '/histohour': {
    'change': config.precision.PERCENT_PRECISION,
    'prices': { 'price': config.precision.COIN_PRICE_PRECISION }
  },
  '/histoday': {
    'change': config.precision.PERCENT_PRECISION,
    'prices': { 'price': config.precision.COIN_PRICE_PRECISION }
  },
  '/history/chart': {
    'ARRAY': {
      'change': config.precision.PERCENT_PRECISION,
      'prices': { 'price': config.precision.COIN_PRICE_PRECISION }
    }
  },
  '/transactions': {
    'ARRAY': {
      'amount': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION
    }
  },
  '/transaction': {
    'amount': (obj) => obj.currency === 'USD' ? config.precision.AMOUNT_PRECISION : config.precision.COIN_AMOUNT_PRECISION,
    'transactions': {
      'price': config.precision.COIN_PRICE_PRECISION,
      'volume': config.precision.COIN_AMOUNT_PRECISION,
      'amount': config.precision.COIN_AMOUNT_PRECISION
    }
  }
}

/**
 * Formats given object for schemawith formatter
 *
 * @param obj
 * @param schema
 * @param formatter
 * @private
 */
const _format = (obj, schema, formatter) => {
  if (!obj) return
  for (const key in schema) {
    const rule = schema[key]
    if (key === 'ARRAY') {
      obj.forEach(elem => _format(elem, rule, formatter))
    } else {
      const val = obj[key]
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          val.forEach(elem => _format(elem, rule, formatter))
        } else if (typeof val === 'object' || typeof rule === 'object') {
          _format(val, rule, formatter)
        } else {
          if (typeof rule === 'function') {
            obj[key] = formatter(val, rule(obj))
          } else {
            obj[key] = formatter(val, rule)
          }
        }
      }
    }
  }
}

exports.formatInputFields = (route) => {
  const schema = inputSchema[route]
  return (req, res, next) => {
    if (!schema) next()
    else {
      _format(req.body, schema, util.convertToNumber)
      next()
    }
  }
}

exports.formatOutputFields = (route) => {
  const schema = outputSchema[route]
  return (req, res, next) => {
    if (!schema) next()
    else {
      const json = res.json.bind(res)
      res.json = value => {
        // console.log(value)
        _format(value, schema, util.convertToString)
        json(value)
      }
      next()
    }
  }
}
