import { compose } from 'recompose'
import { connect as connectFela } from 'react-fela'
import h from 'react-hyperscript'
import Paper from 'material-ui/Paper'
import { groupBy, map, pipe, prop, reduce, merge, values, find, propEq } from 'ramda'
import {
  Table,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
  TableBody,
  TableFooter
} from 'material-ui/Table'
import { add, mul } from 'bigmath'

const summariseOrder = pipe(
  groupBy(
    prop('productId')
  ),
  map(reduce((soFar, orderPlan) => {
    const { product, priceSpecId, quantity } = orderPlan

    if (soFar === null) {
      return {
        product,
        priceSpecId,
        quantity
      }
    }
    return merge(soFar, {
      quantity: add(quantity, soFar.quantity)
    })
  }, null)),
  values
)

const getPriceFromPlan = (plan) => find(propEq('id', plan.priceSpecId))(plan.product.priceSpecs).price

function SupplierOrderSummary ({ order }) {
  const summarisedOrder = summariseOrder(order.orderPlans)
  return (
    h('div', {}, [
      h(Paper, {
        zDepth: 2
      },
        [
          h('h2', {}, 'Supplier Order Summary')
        ]),
      h(Table, {}, [
        h(TableHeader, { displaySelectAll: false }, [
          h(TableRow, {}, [
            h(TableHeaderColumn, {}, 'Product Name'),
            h(TableHeaderColumn, {}, 'Quanity'),
            h(TableHeaderColumn, {}, 'Item Price'),
            h(TableHeaderColumn, {}, 'Total')
          ])
        ]),
        h(TableBody, { displayRowCheckbox: false }, [
          summarisedOrder.map((plan) => {
            const { product, quantity } = plan
            const price = getPriceFromPlan(plan)
            return h(TableRow, {}, [
              h(TableRowColumn, {}, product.resourceType.name),
              h(TableRowColumn, {}, quantity),
              h(TableRowColumn, {}, price),
              h(TableRowColumn, {}, mul(plan.quantity, price))
            ])
          })
        ]),
        h(TableFooter, {}, [
          h(TableRow, {}, [
            h(TableRowColumn, {}, ''),
            h(TableRowColumn, {}, ''),
            h(TableRowColumn, {}, 'total'),
            h(TableRowColumn, {}, reduce(add, 0, summarisedOrder.map((plan) => mul(getPriceFromPlan(plan), plan.quantity))))
          ])
        ])
      ])
    ])
  )
}

export default compose(
  // connectFela(styles)
)(SupplierOrderSummary)
