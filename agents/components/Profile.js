import React from 'react'
import { connect as connectFela } from 'react-fela'
import { Field, reduxForm as connectForm } from 'redux-form'
import { pipe, isNil, not } from 'ramda'
import { TextField } from 'redux-form-material-ui'
import RaisedButton from 'material-ui/RaisedButton'
import { compose, withState, withHandlers } from 'recompose'
import h from 'react-hyperscript'

import { FormattedMessage } from '../../lib/Intl'
import styles from '../styles/Profile'
import Button from '../../app/components/Button'
import AvatarField from '../../app/components/AvatarField'

function Profile (props) {
  const { styles, isEditing, toggleEdit, agent, handleSubmit } = props
  if (isNil(agent)) return null
  const { profile } = agent
  if (isNil(profile)) return null
  const { name, description, avatar } = profile

  console.log(handleSubmit)
  return h('form', {
    className: styles.container,
    onSubmit: handleSubmit
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
      h('div', {
        className: styles.avatarContainer
      }, [
        h(Field, {
          name: 'avatar',
          component: AvatarField,
          isEditingProfile: isEditing,
          value: avatar
        })
      ]),
      h('div', {
        className: styles.infoContainer
      }, [
        h(Field, {
          name: 'name',
          floatingLabelText: (
            h(FormattedMessage, {
              id: 'agents.nameLabel',
              className: styles.labelText
            })
          ),
          component: TextField,
          fullWidth: true,
          value: name,
          disabled: not(isEditing)
        }),
        h(Field, {
          name: 'description',
          floatingLabelText: (
            h(FormattedMessage, {
              id: 'agents.descriptionLabel',
              className: styles.labelText
            })
          ),
          component: TextField,
          value: description,
          fullWidth: true,
          multiLine: true,
          rowsMax: 5,
          disabled: not(isEditing)
        })
      ])
    ]),
    h('div', {
      className: styles.buttonContainer
    }, [
      isEditing
      ? h(RaisedButton, {
        className: styles.button,
        type: 'submit'
      }, [
        h(FormattedMessage, {
          id: 'agents.saveProfile',
          className: styles.labelText
        })
      ])
      : h(RaisedButton, {
        className: styles.button,
        type: 'button',
        onClick: () => toggleEdit()
      }, [
        h(FormattedMessage, {
          id: 'agents.editProfile',
          className: styles.labelText
        })
      ])
    ])

  ])
}

export default compose(
  connectFela(styles),
  withState('isEditing', 'setEditing', false),
  withHandlers({
    toggleEdit: ({ setEditing }) => () => setEditing(not)
  }),
  connectForm({
    form: 'profile',
    initialValues: {
      avatar: 'http://dinosaur.is/images/mikey-small.jpg',
      name: 'classic nixon',
      description: "it's classic nixon"
    }
  })
)(Profile)
