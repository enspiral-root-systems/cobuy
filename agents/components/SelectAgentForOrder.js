import React from 'react'
import { connect as connectFela } from 'react-fela'
import { Field, reduxForm as connectForm } from 'redux-form'
import { pipe, isNil, not, map, isArrayLike } from 'ramda'
import { SelectField } from 'redux-form-material-ui'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import { compose, withState, withHandlers } from 'recompose'
import h from 'react-hyperscript'

import { FormattedMessage } from '../../lib/Intl'
import styles from '../styles/SelectAgentForOrder'
import AvatarField from '../../app/components/AvatarField'

function SelectAgentForOrder (props) {
  const { agentType, styles, isEditing, toggleEdit, selectAgent, handleSubmit, agentCollection } = props

  return h('form', {
    className: styles.container
  }, [
    h('p', {
      className: styles.intro
    }, [
      h(FormattedMessage, {
        id: 'agents.profile',
        className: styles.labelText
      })
    ]),
    h('div', {
      className: styles.innerContainer
    }, [
      h(Field, {
        name: `select${agentType}`,
        floatingLabelText: (
          h(FormattedMessage, {
            id: 'agents.labelText',
            values: {
              agentType
            },
            className: styles.labelText
          })
        ),
        component: SelectField,
        onChange: (e, agentId) => {
          selectAgent(agentId)
        }
      }, [
        map((agent) => {
          return h(MenuItem, {
            value: agent.id,
            primaryText: agent.name
          })
        }, agentCollection)
      ]),
      h(RaisedButton, {
        className: styles.button,
        type: 'button',
        onClick: (ev) => {
          console.log('going to create a new agent / relationship')
        }
      }, 'create new')
    ])
  ])
}

export default compose(
  connectFela(styles),
  // TODO: IK: passing a function to connectForm seems to be supported, mentioned in docs, but causes forms to throw TypeErrors non-destructively
  connectForm((props) => ({
    form: `select${props.agentType}`, // TODO: probably need to pass in the form name so they don't all have the same name
    enableReinitialize: true
  }))
)(SelectAgentForOrder)