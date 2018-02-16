import test from 'ava'
import feathers from 'feathers'
import feathersHooks from 'feathers-hooks'
import createDb from 'dogstack/createDb'
import feathersConfig from 'feathers-configuration'
import feathersAuth from 'feathers-authentication'
import feathersAuthJwt from 'feathers-authentication-jwt'
import { isEmpty } from 'ramda'

import PriceSpecs from './priceSpecs'
import Products from './products'
import ResourceTypes from '../../resources/services/resourceTypes'
import agentsServices from 'dogstack-agents/service'

import dbConfig from '../../db'

process.env.NODE_ENV = 'test'

// TODO: IK: test the authentication hook works as expected (i.e. can't call any methods without being authenticated)
// TODO: IK: figure out how to reset the incrementing id after each test, brittle tests atm
var app, credential, noGroupCredential
test.before(() => {
  app = feathers()
    .configure(feathersConfig())
    .configure(feathersHooks())

  const db = createDb(dbConfig)
  app.set('db', db)

  app.configure(PriceSpecs)
  app.configure(Products)
  app.configure(ResourceTypes)
  agentsServices.call(app)

  app.listen(9000)

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
    // create other test user
    return app.service('credentials').create({
      email: 'tester@tester.com',
      password: 'testing789'
    })
  })
  .then((createdCredential) => {
    noGroupCredential = createdCredential
    // create test data
    const params = { credential }
    return app.service('relationships').create([
      { relationshipType: 'admin', sourceId: 3, targetId: credential.agentId },
      { relationshipType: 'member', sourceId: 3, targetId: credential.agentId },
      { relationshipType: 'supplier', sourceId: 3, targetId: 4 }
    ], params)
  })
  .then(() => {
    const params = { credential }
    return app.service('products').create([
      { resourceTypeId: 10, supplierAgentId: 4 },
      { resourceTypeId: 100, supplierAgentId: 5 }
    ], params)
  })
})

test.beforeEach(() => {
  const params = { credential }
  return app.service('priceSpecs').create([
    { productId: 1, minimum: 5, price: 10, currency: 'NZD' },
    { productId: 1, minimum: 10, price: 2, currency: 'NZD' },
    { productId: 2, minimum: 1, price: 100, currency: 'NZD' }
  ], params)
})

test.afterEach(() => {
  return app.service('priceSpecs').remove(null, {})
})

test.serial('PriceSpecs.create: create new priceSpec successfully', t => {
  const params = { credential, provider: 'rest' }
  return app.service('priceSpecs').create({
    productId: 2,
    minimum: "23",
    price: "10",
    currency: 'NZD'
  }, params)
  .then(priceSpec => {
    t.is(priceSpec.id, 4)
    t.is(priceSpec.productId, 2)
    t.is(priceSpec.minimum, "23")
    t.is(priceSpec.price, "10")
    t.is(priceSpec.currency, 'NZD')
  })
})

// TODO: IK: need a working test client that provides auth token for this test
// can manually test by temp removing authenticate('jwt') from service
test.serial("PriceSpecs.create: can't create new priceSpec if not a group admin", t => {
  const params = { noGroupCredential, provider: 'rest' }
  return t.throws(app.service('priceSpecs').create({
    productId: 3,
    minimum: "2",
    price: "30",
    currency: 'NZD'
  }, params))
})

test.serial('PriceSpecs.find: may only find priceSpecs that relate to products of suppliers of groups of current user', t => {
  const params = { credential, query: {}, provider: 'rest' }
  return app.service('priceSpecs').find(params)
  .then(priceSpecs => {
    const expected = [
      { id: 8,
        productId: 1,
        minimum: "5",
        price: "10",
        currency: 'NZD'
      },
      { id: 9,
        productId: 1,
        minimum: "10",
        price: "2",
        currency: 'NZD'
      }
    ]
    t.deepEqual(priceSpecs, expected)
  })
})

test.serial('PriceSpecs.find: omit unauthorised results', t => {
  const params = { credential, query: { productId: 2 }, provider: 'rest' }
  return app.service('priceSpecs').find(params)
  .then(priceSpecs => {
    t.deepEqual(priceSpecs, [])
  })
})

test.serial('PriceSpecs.get: can get authorised result', t => {
  const params = { credential, provider: 'rest' }
  // TODO: IK: figure out how to reset the incrementing id after each test
  return app.service('priceSpecs').get(14, params)
  .then((plan) => {
    t.is(plan.id, 14)
    t.is(plan.productId, 1)
    t.is(plan.minimum, "5")
    t.is(plan.price, "10")
    t.is(plan.currency, "NZD")
  })
})

test.serial('PriceSpecs.get: omit unauthorised results via get', t => {
  const params = { credential, provider: 'rest' }
  return t.throws(app.service('priceSpecs').get(19, params))
})

// TODO: IK: not sure how to create feathers client correctly to test authentication-related hooks for these tests below
// test.todo("PriceSpecs.create: can't create new plan if external provider")
// test.todo("PriceSpecs.update: can update current user plan")
// test.todo("PriceSpecs.update: can't update a plan for an agentId that isn't current user id")
// test.todo("PriceSpecs.patch: can patch current user plan")
// test.todo("PriceSpecs.patch: can't patch a plan for an agentId that isn't current user id")
// test.todo("PriceSpecs.remove: can remove current user plan")
// test.todo("PriceSpecs.remove: can't remove a plan for an agentId that isn't current user id")