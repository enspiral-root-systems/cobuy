import test from 'ava'
import feathers from 'feathers'
// import rest from 'feathers-rest'
// import bodyParser from 'body-parser'
import feathersHooks from 'feathers-hooks'
import createDb from 'dogstack/createDb'
import feathersConfig from 'feathers-configuration'
import feathersAuth from 'feathers-authentication'
import feathersAuthJwt from 'feathers-authentication-jwt'
import { isEmpty } from 'ramda'

// import fetch from 'node-fetch'
// import feathersClient from 'feathers/client'
// import restClient from 'feathers-rest/client'
// import authClient from 'feathers-authentication-client'
// import localStorage from 'localstorage-memory'

import OrderIntents from './orderIntents'
import Orders from './orders'
import TaskPlans from '../../tasks/services/plans'
import agentsServices from 'dogstack-agents/service'

import dbConfig from '../../db'

process.env.NODE_ENV = 'test'

// TODO: IK: test the authentication hook works as expected (i.e. can't call any methods without being authenticated)
// TODO: IK: figure out how to reset the incrementing id after each test, brittle tests atm
var app, credential, client
test.before(() => {
  app = feathers()
    // .use(bodyParser.json())
    // .use(bodyParser.urlencoded({ extended: true }))
    // .configure(rest())
    .configure(feathersConfig())
    .configure(feathersHooks())

  const db = createDb(dbConfig)
  app.set('db', db)

  app.configure(OrderIntents)
  app.configure(Orders)
  app.configure(TaskPlans)
  agentsServices.call(app)

  app.listen(9000)

  // client = feathersClient()
  //   .configure(restClient('http://localhost:9000').fetch(fetch))
  //   .configure(feathersHooks())
  //   .configure(authClient({ storage: localStorage }))

  return db.migrate.latest(dbConfig.migrations)
  .then(() => {
    // create test user
    return app.service('credentials').create({
      email: 'test@test.com',
      password: 'testing123'
    })
  })
  .then((createdCredential) => {
    credential = createdCredential
    // create test data
    const params = { credential }
    return Promise.all([
      app.service('relationships').create({ relationshipType: 'member', sourceId: 99, targetId: credential.agentId }, params),
      app.service('orders').create({ consumerAgentId: 99, supplierAgentId: 98, adminAgentId: 1 }, params)
    ])
  })
})

test.beforeEach(() => {
  const params = { credential }
  return app.service('orderIntents').create([
    { agentId: credential.agentId, desiredQuantity: 10, productId: 1, priceSpecId: 1, orderId: 1 },
    { agentId: credential.agentId, desiredQuantity: 23, productId: 1, priceSpecId: 2,orderId: 1 },
    { agentId: 99, desiredQuantity: 46, productId: 99, priceSpecId: 99, orderId: 99 }
  ], params)
})

test.afterEach(() => {
  return app.service('orderIntents').remove(null, {})
})

test.serial('OrderIntents.create: create new intent successfully', t => {
  return app.service('orderIntents').create({
    agentId: 1,
    desiredQuantity: 46,
    productId: 2,
    priceSpecId: 1,
    orderId: 1
  })
  .then(intent => {
    t.is(intent.id, 4)
    t.is(intent.agentId, 1)
    t.is(intent.desiredQuantity, 46)
    t.is(intent.productId, 2)
    t.is(intent.priceSpecId, 1)
    t.is(intent.orderId, 1)
  })
})

test.serial('OrderIntents.find: may only find intents that relate to groups of current user', t => {
  // simulate client authentication by just passing the credential in params
  const params = { credential, query: {}, provider: 'rest' }
  return app.service('orderIntents').find(params)
  .then(intents => {
    const expected = [
      { id: 5,
        agentId: 1,
        desiredQuantity: 10,
        productId: 1,
        priceSpecId: 1,
        orderId: 1
      },
      { id: 6,
        agentId: 1,
        desiredQuantity: 23,
        productId: 1,
        priceSpecId: 2,
        orderId: 1
      }
    ]
    t.deepEqual(intents, expected)
  })
})

test.serial('OrderIntents.find: omit unauthorised results if directly specified by orderId', t => {
  const params = { credential, query: { orderId: 99 }, provider: 'rest' }
  return app.service('orderIntents').find(params)
  .then(intents => {
    t.deepEqual(intents, [])
  })
})

test.serial('OrderIntents.get: can get authorised result', t => {
  const params = { credential, provider: 'rest' }
  // TODO: IK: figure out how to reset the incrementing id after each test
  return app.service('orderIntents').get(12, params)
  .then((intent) => {
    t.is(intent.id, 12)
    t.is(intent.agentId, 1)
    t.is(intent.desiredQuantity, 23)
    t.is(intent.productId, 1)
    t.is(intent.priceSpecId, 2)
    t.is(intent.orderId, 1)
  })
})

test.serial('OrderIntents.get: omit unauthorised results via get', t => {
  const params = { credential, provider: 'rest' }
  return t.throws(app.service('orderIntents').get(16, params))
})

// TODO: IK: not sure how to create feathers client correctly to test authentication-related hooks for these tests below
test.todo("OrderIntents.create: can't create an intent for an agentId that isn't current user id")
test.todo("OrderIntents.update: can update current user intent")
test.todo("OrderIntents.update: can't update an intent for an agentId that isn't current user id")
test.todo("OrderIntents.patch: can patch current user intent")
test.todo("OrderIntents.patch: can't patch an intent for an agentId that isn't current user id")
test.todo("OrderIntents.remove: can remove current user intent")
test.todo("OrderIntents.remove: can't remove an intent for an agentId that isn't current user id")
