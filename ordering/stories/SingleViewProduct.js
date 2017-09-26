import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import h from 'react-hyperscript'

import SingleViewProduct from '../components/SingleViewProduct'

// https://github.com/root-systems/cobuy/wiki/Models
const mockProductInfo = {
  id: 188,
  resourceTypeId: 123,
  resourceType: {
    id: 123,
    name: 'crayons',
    description: 'these are crayons. look at all the pretty colours! they are made of beeswax. you could probably eat them and not die.',
    image: 'http://www.mercurius-australia.com/site/images/1250623.jpg'
  },
  priceSpecs: [
    {
      id: 456,
      productId: 188,
      minimum: '10',
      price: '9.99',
      currency: 'NZD'
    },
    {
      id: 457,
      productId: 188,
      minimum: '100',
      price: '7.99',
      currency: 'NZD'
    }
  ],
  facets: [
    {
      id: 345,
      resourceTypeId: 123,
      name: 'colour',
      description: 'the colour of each crayon',
      values: [
        {
          id: 678,
          resourceTypeFacetId: 345,
          name: 'blue'
        },
        {
          id: 679,
          resourceTypeFacetId: 345,
          name: 'orange'
        },
        {
          id: 680,
          resourceTypeFacetId: 345,
          name: 'purple'
        }
      ]
    }
  ]
}

storiesOf('ordering.SingleViewProduct', module)
  .add('default', () => (
    h(SingleViewProduct, {
      product: mockProductInfo,
      onSubmit: action('submit')
    })
  ))