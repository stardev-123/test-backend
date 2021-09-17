/**
 * Created by laslo on 07/11/18.
 */
const _ = require('lodash')
const config = require('../../../config')
const Mixpanel = require('mixpanel')

const mixpanel = Mixpanel.init(config.mixpanel.token)

exports.createUser = ({ id, email, firstName, lastName }) => {
  mixpanel.people.set(id, {
    $first_name: firstName,
    $last_name: lastName,
    $email: email,
    $created: (new Date().toISOString()),
    State: '',
    LifetimeInvested: 0,
    NumTrades: 0
  })
}

exports.userUpdatePhone = (userId, PhoneNumber) => {
  mixpanel.people.set(userId, { PhoneNumber
  })
}

exports.userConfirmedCAState = (userId) => {
  mixpanel.people.set(userId, { State: 'CA' })
}

exports.userUpdatedState = (userId, State) => {
  mixpanel.people.set(userId, { State })
}

exports.userUpdateAddress = (userId, { address1, address2, city, state, zipcode }) => {
  mixpanel.people.set(userId, { State: state, address1, address2, city, zipcode })
}

exports.updateUser = (userId, { email, firstName, lastName, birthday, phoneNumber }) => {
  mixpanel.people.set(userId, {
    $first_name: firstName,
    $last_name: lastName,
    $email: email,
    $birthday: birthday,
    $phoneNumber: phoneNumber,
    $updated: (new Date().toISOString())
  })
}

exports.userCharged = (userId, amount) => {
  const now = new Date()
  mixpanel.people.set_once(userId, 'first_charge', now.toISOString())
  mixpanel.people.track_charge(userId, amount, { '$time': now })
}

exports.userInvested = (userId, amount, holdings) => {
  mixpanel.people.increment(+userId, 'NumTrades')
  mixpanel.people.increment(+userId, 'LifetimeInvested', amount)
  holdings.forEach(({ currency, amount }) => mixpanel.people.set(+userId, 'Holdings_' + currency, amount))
}

exports.userSold = (userId, amount, holdings) => {
  mixpanel.people.increment(+userId, 'NumTrades')
  holdings.forEach(({ currency, amount }) => mixpanel.people.set(+userId, 'Holdings_' + currency, amount))
}

exports.userEvent = (userId, name) => {
  const now = new Date().toISOString()
  mixpanel.track(name, {
    distinct_id: userId,
    $time: now
  })
}

exports.globalEvent = (name, payload) => {
  const now = new Date().toISOString()
  const options = _.defaults({ $time: now }, payload)
  mixpanel.track(name, options)
}
