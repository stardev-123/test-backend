'use strict'

var Sequelize = require('sequelize')

/**
 * Actions summary:
 *
 * createTable "priceHourlyHistories", deps: []
 * createTable "webhooks", deps: []
 * createTable "emailWhitelists", deps: []
 * createTable "users", deps: []
 * createTable "settings", deps: []
 * createTable "priceHistories", deps: []
 * createTable "institutions", deps: [users]
 * createTable "investments", deps: [users]
 * createTable "investmentTransactions", deps: [investments]
 * createTable "devices", deps: [users]
 * createTable "bankAccounts", deps: [users, institutions]
 * createTable "sparechanges", deps: [users, bankAccounts]
 * createTable "PortfolioInvestments", deps: [users]
 * createTable "recurrings", deps: [users, bankAccounts]
 * createTable "failedBoosts", deps: [users, recurrings, sparechanges]
 * createTable "userCardTransactions", deps: [users]
 * createTable "wallets", deps: [users]
 * createTable "transactions", deps: [users, bankAccounts, investments, transactions]
 *
 **/

var info = {
  'revision': 1,
  'name': 'initial_migration',
  'created': '2019-01-18T12:45:50.649Z',
  'comment': ''
}

var migrationCommands = [{
  fn: 'createTable',
  params: [
    'priceHourlyHistories',
    {
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'primaryKey': true
      },
      'price': {
        'type': Sequelize.DECIMAL(22, 12).UNSIGNED,
        'field': 'price',
        'defaultValue': 0
      },
      'time': {
        'type': Sequelize.INTEGER(11),
        'field': 'time',
        'primaryKey': true
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'webhooks',
    {
      'providerTransactionId': {
        'type': Sequelize.STRING(50),
        'field': 'providerTransactionId',
        'primaryKey': true
      },
      'status': {
        'type': Sequelize.SMALLINT,
        'field': 'status',
        'defaultValue': 0
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'emailWhitelists',
    {
      'email': {
        'type': Sequelize.STRING(150),
        'field': 'email',
        'primaryKey': true
      },
      'status': {
        'type': Sequelize.SMALLINT,
        'field': 'status',
        'defaultValue': 1
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'users',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'firstName': {
        'type': Sequelize.STRING(50),
        'field': 'firstName'
      },
      'lastName': {
        'type': Sequelize.STRING(50),
        'field': 'lastName'
      },
      'email': {
        'type': Sequelize.STRING(50),
        'field': 'email',
        'unique': true
      },
      'password': {
        'type': Sequelize.STRING(100),
        'field': 'password'
      },
      'phoneNumber': {
        'type': Sequelize.STRING(30),
        'field': 'phoneNumber',
        'unique': true
      },
      'birthdate': {
        'type': Sequelize.DATEONLY,
        'field': 'birthdate'
      },
      'address1': {
        'type': Sequelize.STRING(250),
        'field': 'address1'
      },
      'address2': {
        'type': Sequelize.STRING(250),
        'field': 'address2'
      },
      'city': {
        'type': Sequelize.STRING(150),
        'field': 'city'
      },
      'state': {
        'type': Sequelize.STRING(150),
        'field': 'state'
      },
      'zipcode': {
        'type': Sequelize.STRING(32),
        'field': 'zipcode'
      },
      'fullSSN': {
        'type': Sequelize.STRING(64),
        'field': 'fullSSN'
      },
      'ssn': {
        'type': Sequelize.STRING(4),
        'field': 'ssn'
      },
      'verificationCode': {
        'type': Sequelize.STRING(1000),
        'field': 'verificationCode'
      },
      'verified': {
        'type': Sequelize.BOOLEAN,
        'field': 'verified',
        'defaultValue': false
      },
      'customerId': {
        'type': Sequelize.STRING(100),
        'field': 'customerId'
      },
      'providerAddress': {
        'type': Sequelize.JSON,
        'field': 'providerAddress'
      },
      'providerVerificationDate': {
        'type': Sequelize.DATEONLY,
        'field': 'providerVerificationDate'
      },
      'verifiedAtProvider': {
        'type': Sequelize.BOOLEAN,
        'field': 'verifiedAtProvider',
        'defaultValue': false
      },
      'investmentsCount': {
        'type': Sequelize.INTEGER,
        'field': 'investmentsCount',
        'defaultValue': 0
      },
      'firstInvestment': {
        'type': Sequelize.BOOLEAN,
        'field': 'firstInvestment',
        'defaultValue': true
      },
      'firstInvestmentDate': {
        'type': Sequelize.DATEONLY,
        'field': 'firstInvestmentDate'
      },
      'tradingForbidden': {
        'type': Sequelize.BOOLEAN,
        'field': 'tradingForbidden',
        'defaultValue': false
      },
      'confirmedResidence': {
        'type': Sequelize.BOOLEAN,
        'field': 'confirmedResidence',
        'defaultValue': false
      },
      'tosStatus': {
        'type': Sequelize.SMALLINT,
        'field': 'tosStatus',
        'defaultValue': 0
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'settings',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'webhookId': {
        'type': Sequelize.STRING(100),
        'field': 'webhookId'
      },
      'portfolio': {
        'type': Sequelize.JSON,
        'field': 'portfolio'
      },
      'coins': {
        'type': Sequelize.JSON,
        'field': 'coins'
      },
      'tradingEnabled': {
        'type': Sequelize.BOOLEAN,
        'field': 'tradingEnabled',
        'defaultValue': true
      },
      'postponedTrading': {
        'type': Sequelize.BOOLEAN,
        'field': 'postponedTrading',
        'defaultValue': false
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'priceHistories',
    {
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'primaryKey': true
      },
      'price': {
        'type': Sequelize.DECIMAL(22, 12).UNSIGNED,
        'field': 'price',
        'defaultValue': 0
      },
      'date': {
        'type': Sequelize.DATEONLY,
        'field': 'date',
        'primaryKey': true,
        'defaultValue': Sequelize.Date
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'institutions',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'name': {
        'type': Sequelize.STRING(150),
        'field': 'name'
      },
      'code': {
        'type': Sequelize.STRING(32),
        'field': 'code'
      },
      'accessToken': {
        'type': Sequelize.STRING(100),
        'field': 'accessToken'
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'field': 'userId',
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'investments',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'type': {
        'type': Sequelize.SMALLINT,
        'field': 'type',
        'allowNull': false
      },
      'tid': {
        'type': Sequelize.STRING(50),
        'field': 'tid',
        'allowNull': false,
        'unique': true
      },
      'amount': {
        'type': Sequelize.DECIMAL(16, 8).UNSIGNED,
        'field': 'amount',
        'defaultValue': 0
      },
      'providerTransactionId': {
        'type': Sequelize.STRING(50),
        'field': 'providerTransactionId'
      },
      'assets': {
        'type': Sequelize.JSON,
        'field': 'assets',
        'allowNull': false
      },
      'single': {
        'type': Sequelize.BOOLEAN,
        'field': 'single',
        'allowNull': false
      },
      'status': {
        'type': Sequelize.SMALLINT,
        'field': 'status',
        'defaultValue': 1,
        'allowNull': false
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'field': 'userId',
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'investmentTransactions',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'investmentId': {
        'type': Sequelize.INTEGER(11),
        'references': {
          'model': 'investments',
          'key': 'id'
        },
        'field': 'investmentId',
        'allowNull': false
      },
      'type': {
        'type': Sequelize.SMALLINT,
        'field': 'type',
        'allowNull': false
      },
      'providerTransactionId': {
        'type': Sequelize.STRING(50),
        'field': 'providerTransactionId'
      },
      'status': {
        'type': Sequelize.SMALLINT,
        'field': 'status',
        'defaultValue': 1,
        'allowNull': false
      },
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'allowNull': false
      },
      'volume': {
        'type': Sequelize.DECIMAL(22, 12).UNSIGNED,
        'field': 'volume',
        'defaultValue': 0
      },
      'amount': {
        'type': Sequelize.DECIMAL(22, 12).UNSIGNED,
        'field': 'amount',
        'defaultValue': 0
      },
      'price': {
        'type': Sequelize.DECIMAL(22, 12).UNSIGNED,
        'field': 'price',
        'defaultValue': 0
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'devices',
    {
      'deviceId': {
        'type': Sequelize.STRING(100),
        'field': 'deviceId',
        'primaryKey': true
      },
      'token': {
        'type': Sequelize.STRING(250),
        'field': 'token'
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'field': 'userId',
        'allowNull': false
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'bankAccounts',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'name': {
        'type': Sequelize.STRING(50),
        'field': 'name'
      },
      'mask': {
        'type': Sequelize.STRING(4),
        'field': 'mask'
      },
      'type': {
        'type': Sequelize.STRING(50),
        'field': 'type'
      },
      'subtype': {
        'type': Sequelize.STRING(50),
        'field': 'subtype'
      },
      'fundingSourceId': {
        'type': Sequelize.STRING(100),
        'field': 'fundingSourceId',
        'unique': true
      },
      'primary': {
        'type': Sequelize.BOOLEAN,
        'field': 'primary',
        'defaultValue': false
      },
      'accessToken': {
        'type': Sequelize.STRING(100),
        'field': 'accessToken'
      },
      'accountId': {
        'type': Sequelize.STRING(100),
        'field': 'accountId'
      },
      'active': {
        'type': Sequelize.BOOLEAN,
        'field': 'active',
        'defaultValue': true
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'field': 'userId',
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true
      },
      'institutionId': {
        'type': Sequelize.INTEGER,
        'field': 'institutionId',
        'references': {
          'model': 'institutions',
          'key': 'id'
        },
        'allowNull': true
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'sparechanges',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'allowNull': false
      },
      'active': {
        'type': Sequelize.BOOLEAN,
        'field': 'active',
        'defaultValue': true
      },
      'accounts': {
        'type': Sequelize.JSON,
        'field': 'accounts'
      },
      'invested': {
        'type': Sequelize.DECIMAL(16, 8).UNSIGNED,
        'field': 'invested',
        'defaultValue': 0
      },
      'ongoing': {
        'type': Sequelize.DECIMAL(16, 8).UNSIGNED,
        'field': 'ongoing',
        'defaultValue': 0
      },
      'charge': {
        'type': Sequelize.DECIMAL(16, 8).UNSIGNED,
        'field': 'charge',
        'defaultValue': 0
      },
      'lastChargeDate': {
        'type': Sequelize.DATEONLY,
        'field': 'lastChargeDate',
        'defaultValue': Sequelize.Date
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'field': 'userId',
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true
      },
      'bankAccountId': {
        'type': Sequelize.INTEGER,
        'field': 'bankAccountId',
        'references': {
          'model': 'bankAccounts',
          'key': 'id'
        },
        'allowNull': true
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'portfolioInvestments',
    {
      'name': {
        'type': Sequelize.STRING(50),
        'field': 'name'
      },
      'percent': {
        'type': Sequelize.DOUBLE,
        'field': 'percent'
      },
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'primaryKey': true
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true,
        'field': 'userId',
        'primaryKey': true
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'recurrings',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'allowNull': false
      },
      'active': {
        'type': Sequelize.BOOLEAN,
        'field': 'active',
        'defaultValue': true
      },
      'amount': {
        'type': Sequelize.DECIMAL(16, 8).UNSIGNED,
        'field': 'amount',
        'defaultValue': 0
      },
      'day': {
        'type': Sequelize.TINYINT,
        'field': 'day',
        'defaultValue': 1
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'field': 'userId',
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true
      },
      'bankAccountId': {
        'type': Sequelize.INTEGER,
        'field': 'bankAccountId',
        'references': {
          'model': 'bankAccounts',
          'key': 'id'
        },
        'allowNull': true
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'failedBoosts',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'count': {
        'type': Sequelize.TINYINT,
        'field': 'count',
        'defaultValue': 0
      },
      'active': {
        'type': Sequelize.BOOLEAN,
        'field': 'active',
        'defaultValue': true
      },
      'success': {
        'type': Sequelize.BOOLEAN,
        'field': 'success',
        'defaultValue': false
      },
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'allowNull': false
      },
      'amount': {
        'type': Sequelize.DECIMAL(16, 8).UNSIGNED,
        'field': 'amount',
        'defaultValue': 0
      },
      'failDate': {
        'type': Sequelize.DATEONLY,
        'field': 'failDate',
        'defaultValue': Sequelize.Date
      },
      'nextProcessingDate': {
        'type': Sequelize.DATEONLY,
        'field': 'nextProcessingDate',
        'defaultValue': Sequelize.Date
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'field': 'userId',
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true
      },
      'recurringId': {
        'type': Sequelize.INTEGER,
        'field': 'recurringId',
        'references': {
          'model': 'recurrings',
          'key': 'id'
        },
        'allowNull': true
      },
      'sparechangeId': {
        'type': Sequelize.INTEGER,
        'field': 'sparechangeId',
        'references': {
          'model': 'sparechanges',
          'key': 'id'
        },
        'allowNull': true
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'userCardTransactions',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'amount': {
        'type': Sequelize.DECIMAL(16, 8),
        'field': 'amount',
        'defaultValue': 0
      },
      'roundUp': {
        'type': Sequelize.DECIMAL(16, 8),
        'field': 'roundUp',
        'defaultValue': 0
      },
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'allowNull': false
      },
      'transaction_id': {
        'type': Sequelize.STRING(100),
        'field': 'transaction_id'
      },
      'transaction_type': {
        'type': Sequelize.STRING(32),
        'field': 'transaction_type'
      },
      'name': {
        'type': Sequelize.STRING(250),
        'field': 'name'
      },
      'category': {
        'type': Sequelize.JSON,
        'field': 'category'
      },
      'date': {
        'type': Sequelize.DATEONLY,
        'field': 'date',
        'allowNull': false
      },
      'account_id': {
        'type': Sequelize.STRING(100),
        'field': 'account_id'
      },
      'accountName': {
        'type': Sequelize.STRING(50),
        'field': 'accountName'
      },
      'accountMask': {
        'type': Sequelize.STRING(4),
        'field': 'accountMask'
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'field': 'userId',
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'wallets',
    {
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'primaryKey': true
      },
      'amount': {
        'type': Sequelize.DECIMAL(22, 12).UNSIGNED,
        'field': 'amount',
        'defaultValue': 0
      },
      'pending': {
        'type': Sequelize.DECIMAL(22, 12).UNSIGNED,
        'field': 'pending',
        'defaultValue': 0
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true,
        'field': 'userId',
        'primaryKey': true
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      }
    },
    {
      'charset': 'utf8'
    }
  ]
},
{
  fn: 'createTable',
  params: [
    'transactions',
    {
      'id': {
        'type': Sequelize.INTEGER,
        'field': 'id',
        'autoIncrement': true,
        'primaryKey': true,
        'allowNull': false
      },
      'amount': {
        'type': Sequelize.DECIMAL(22, 12),
        'field': 'amount',
        'defaultValue': 0
      },
      'currency': {
        'type': Sequelize.STRING(6),
        'field': 'currency',
        'allowNull': false
      },
      'type': {
        'type': Sequelize.SMALLINT,
        'field': 'type'
      },
      'providerTransactionId': {
        'type': Sequelize.STRING(50),
        'field': 'providerTransactionId'
      },
      'providerTransactionTime': {
        'type': Sequelize.DATE,
        'field': 'providerTransactionTime'
      },
      'cancelationDate': {
        'type': Sequelize.DATE,
        'field': 'cancelationDate'
      },
      'cancelationReason': {
        'type': Sequelize.STRING(50),
        'field': 'cancelationReason'
      },
      'status': {
        'type': Sequelize.SMALLINT,
        'field': 'status'
      },
      'singleInvestment': {
        'type': Sequelize.BOOLEAN,
        'field': 'singleInvestment'
      },
      'createdAt': {
        'type': Sequelize.DATE,
        'field': 'createdAt',
        'allowNull': false
      },
      'updatedAt': {
        'type': Sequelize.DATE,
        'field': 'updatedAt',
        'allowNull': false
      },
      'userId': {
        'type': Sequelize.INTEGER,
        'field': 'userId',
        'references': {
          'model': 'users',
          'key': 'id'
        },
        'allowNull': true
      },
      'bankAccountId': {
        'type': Sequelize.INTEGER,
        'field': 'bankAccountId',
        'references': {
          'model': 'bankAccounts',
          'key': 'id'
        },
        'allowNull': true
      },
      'investmentId': {
        'type': Sequelize.INTEGER,
        'field': 'investmentId',
        'references': {
          'model': 'investments',
          'key': 'id'
        },
        'allowNull': true
      },
      'cancelId': {
        'type': Sequelize.INTEGER,
        'field': 'cancelId',
        'references': {
          'model': 'transactions',
          'key': 'id'
        },
        'allowNull': true
      }
    },
    {
      'charset': 'utf8'
    }
  ]
}
]

module.exports = {
  pos: 0,
  up: function (queryInterface, Sequelize) {
    var index = this.pos
    return new Promise(function (resolve, reject) {
      function next () {
        if (index < migrationCommands.length) {
          const command = migrationCommands[index]
          console.log('[#' + index + '] execute: ' + command.fn)
          index++
          queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject)
        } else { resolve() }
      }
      next()
    })
  },
  info: info
}
