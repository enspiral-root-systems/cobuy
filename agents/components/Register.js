import PropTypes from 'prop-types'
import React from 'react'
import { connect as connectFela } from 'react-fela'
import { Field, reduxForm as connectForm } from 'redux-form'
import { map, flow } from 'lodash'
import { TextField } from 'redux-form-material-ui'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import FontIcon from 'material-ui/FontIcon'
import { required, email, length, confirmation } from 'redux-form-validators'

import styles from '../styles/Register'

// https://blog.codinghorror.com/the-god-login/

const remoteAuthenticationMethods = [
  {
    label: 'Google',
    icon: 'fa fa-google',
    backgroundColor: '#ffffff'
  },
  {
    label: 'Facebook',
    icon: 'fa fa-facebook',
    backgroundColor: '#3b5998'
  },
  {
    label: 'Twitter',
    icon: 'fa fa-twitter',
    backgroundColor: '#00bced'
  },
  {
    label: 'GitHub',
    icon: 'fa fa-github',
    backgroundColor: '#6d6d6d'
  }
]

function LocalAuthenticationForm (props) {
  const { styles, handleSubmit } = props

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Field
        name='name'
        floatingLabelText='Name'
        fullWidth={true}
        component={TextField}
        validate={required()}
      />
      <Field
        name='email'
        type='email'
        floatingLabelText='Email'
        fullWidth={true}
        component={TextField}
        validate={email()}
      />
      <Field
        name='password'
        type='password'
        floatingLabelText='Password'
        fullWidth={true}
        component={TextField}
        validate={length({ min: 8 })}
      />
      <Field
        name='passwordConfirm'
        type='password'
        floatingLabelText='Confirm Password'
        fullWidth={true}
        component={TextField}
        validate={confirmation({ field: 'password', fieldLabel: 'Password' })}
      />
      <div className={styles.actions}>
        <RaisedButton
          type='submit'
          label='Create new account'
          primary={true}
          className={styles.registerAction}
        />
        <FlatButton
          label='Sign In'
          className={styles.signInAction}
        />
      </div>
    </form>
  )
}

LocalAuthenticationForm = flow(
  connectForm({
    form: 'localAuthenticationForm'
  })
)(LocalAuthenticationForm)

function Register (props) {
  const { styles, actions } = props
  return (
    <div className={styles.container}>
      <p className={styles.intro}>
        Hey, welcome to Cobuy!
      </p>
      <ul className={styles.remotes}>
        {map(remoteAuthenticationMethods, method => (
          <li
            className={styles.remote}
          >
            <RaisedButton
              label={method.label}
              icon={<FontIcon className={method.icon} />}
              backgroundColor={method.backgroundColor}
              hoverColor={method.hoverColor}
              fullWidth={true}
            />
          </li>
        ))}
      </ul>
      <LocalAuthenticationForm
        styles={styles}
        onSubmit={actions.authentication.register}
      />
    </div>
  )
}

Register.propTypes = {
}

Register.defaultProps = {
}

export default flow(
  connectFela(styles)
)(Register)