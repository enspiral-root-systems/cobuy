import React from 'react'
import { connect as connectFela } from 'react-fela'
import { pipe } from 'ramda'
import Divider from 'material-ui/Divider'

import styles from '../styles/Dashboard'
import { FormattedMessage } from '../../lib/Intl'
import DashboardTasks from '../../tasks/components/DashboardTasks'
import DashboardOrders from '../../ordering/components/DashboardOrders'

import { mockFullParentTaskPlan } from '../../tasks/data/mock'

function Dashboard (props) {
  const { styles, actions, taskPlans, currentAgent } = props
  return (
    <div className={styles.container}>
      <p className={styles.intro}>
        <FormattedMessage
          id='app.dashboard'
          className={styles.labelText}
        />
      </p>
      <div className={styles.ordersContainer}>
        <DashboardOrders actions={actions} />
      </div>
      <Divider className={styles.divider} />
      <div className={styles.tasksContainer}>
        <DashboardTasks
          taskPlans={taskPlans}
          actions={actions}
          currentAgent={currentAgent}
        />
      </div>
    </div>
  )
}

export default pipe(
  connectFela(styles)
)(Dashboard)