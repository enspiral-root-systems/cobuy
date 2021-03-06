import h from 'react-hyperscript'
import { connect as connectStyles } from 'react-fela'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import ContentAdd from 'material-ui/svg-icons/content/add'
import ContentEdit from 'material-ui/svg-icons/content/create'
import { compose, withState, withHandlers } from 'recompose'
import { FormattedMessage } from 'dogstack/intl'

import ProductIntentForm from './ProductIntentForm'

import styles from '../styles/ProductIntentDialog'

export default compose(
  connectStyles(styles),
  withState('isDialogOpen', 'setDialogOpen', false),
  withHandlers({
    openDialog: ({ setDialogOpen }) => () => setDialogOpen(true),
    closeDialog: ({ setDialogOpen }) => () => setDialogOpen(false),
  })
)(ProductIntentDialog)

function ProductIntentDialog (props) {
  const {
    styles,
    isDialogOpen,
    closeDialog,
    openDialog,
    onSubmit,
    ...otherProps
  } = props

  const {
    currentAgent,
    hasIntentByAgent
  } = otherProps

  const hasIntent = hasIntentByAgent[currentAgent.id]

  const ActionIcon = hasIntent ? ContentEdit : ContentAdd
  const submitMessageId = hasIntent ? 'ordering.updateIntent' : 'ordering.createIntent'

  return (
    h('div', {
      className: styles.container
    }, [
      h(Dialog, {
        title: (
          h(FormattedMessage, {
            id: 'ordering.castYourIntent',
            className: styles.title
          })
        ),
        actions: [
          h(RaisedButton, {
            type: 'submit',
            form: 'productIntent',
            className: styles.button,
            primary: true
          }, [
            h(FormattedMessage, {
              id: submitMessageId,
              className: styles.buttonText
            })
          ]),
          h(RaisedButton, {
            className: styles.button,
            onClick: closeDialog,
            secondary: true
          }, [
            h(FormattedMessage, {
              id: 'app.cancel',
              className: styles.buttonText
            })
          ])
        ],
        modal: false,
        open: isDialogOpen,
        onRequestClose: closeDialog
      }, [
        h(ProductIntentForm, {
          ...otherProps,
          onSubmit: (...args) => {
            onSubmit(...args)
            closeDialog()
          }
        })
      ]),
      h(FloatingActionButton, {
        className: styles.action,
        onClick: openDialog
      }, [
        h(ActionIcon)
      ])
    ])
  )
}
