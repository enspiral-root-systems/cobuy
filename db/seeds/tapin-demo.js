const hasher = require('feathers-authentication-local/lib/utils/hash')
const { flatten, map, pick, merge } = require('ramda')

const agents = [
  {
    name: 'Dan Lewis',
    description: "I'm Dan - I love building things, from sheds to organisations",
    avatar: 'https://raw.githubusercontent.com/root-systems/handbook/master/members/dan.png',
    email: 'dan@rootsystems.nz',
    password: 'password'
  },
  {
    name: 'Iain Kirkpatrick',
    description: "I'm Iain - I love basketball and programming while watching basketball",
    avatar: 'https://raw.githubusercontent.com/root-systems/handbook/master/members/iain.png',
    email: 'iain@rootsystems.nz',
    password: 'password'
  },
  {
    name: 'Sarah Rogers',
    description: "I'm Sarah - I love bargain hunting and adding to my vast repertoire of Simpsons knowledge",
    avatar: 'https://raw.githubusercontent.com/root-systems/handbook/master/members/sarah.png',
    email: 'sarah@rootsystems.nz',
    password: 'password'
  },
  {
    name: 'Mikey Williams',
    description: "I'm Mikey - I love making mad science and participating in cooperative ecosystems",
    avatar: 'https://raw.githubusercontent.com/root-systems/handbook/master/members/mikey.png',
    email: 'mikey@rootsystems.nz',
    password: 'password'
  }
]

exports.seed = function (knex, Promise) {
  // insert agents
  const devPersonAgent = {}
  return Promise.all([
    knex('agents').insert(devPersonAgent).returning('id'),
    knex('agents').insert(devPersonAgent).returning('id'),
    knex('agents').insert(devPersonAgent).returning('id'),
    knex('agents').insert(devPersonAgent).returning('id')
  ])
  .then((ids) => {
    ids = flatten(ids)
    // insert person profile
    return Promise.all(agents.map((agent, i) => {
      const profile = merge(pick(['name', 'description', 'avatar'], agent), { agentId: ids[i] })
      return knex('profiles').insert(profile).returning('agentId')
    }))
  })
  .then((ids) => {
    ids = flatten(ids)
    // hash person credential
    return Promise.all(agents.map((agent, i) => {
      const credential = merge(pick(['email', 'password'], agent), { agentId: ids[i] })
      return hashCredential(credential)
    }))
  })
  .then((credentials) => {
    // insert person credential
    return Promise.all(credentials.map((credential) => {
      return knex('credentials').insert(credential).returning('agentId')
    }))
  })
}

function hashCredential (credential) {
  return hasher(credential.password)
    .then(hashedPassword => {
      return Object.assign(credential, { password: hashedPassword })
    })
}