import h from 'react-hyperscript'
import { isNil } from 'ramda'
import { connect as connectFeathers } from 'feathers-action-react'
import { compose } from 'recompose'
import { push } from 'react-router-redux'

import { actions as taskPlans } from '../dux/plans'
import { actions as taskWorks } from '../dux/works'
import getTaskWorkerProps from '../getters/getTaskWorkerProps'
import TaskWorker from '../components/TaskWorker'

export default compose(
  connectFeathers({
    selector: getTaskWorkerProps,
    actions: {
      taskPlans,
      taskWorks,
      // `feathers-action-react` wraps every
      //  action creator in a cid creator.
      router: {
        push: (cid, ...args) => push(...args)
      }
    },
    // TODO can optimize `feathers-action-react` to de-dupe
    // new queries by checking if deepEqual
    query: (props) => {
      const { taskPlanId } = props.match.params
      const { taskPlan } = props.selected
      var queries = [
        {
          service: 'taskPlans',
          id: taskPlanId
        },
        {
          service: 'taskPlans',
          params: {
            query: {
              parentTaskPlanId: taskPlanId
            }
          }
        },
        {
          service: 'taskWorks',
          params: {
            query: {
              taskPlanId
            }
          }
        }
      ]

      // once we have the task work, query for the child task works
      const { taskWork } = taskPlan || {}
      if (taskWork) {
        queries.push({
          service: 'taskWorks',
          params: {
            query: {
              parentTaskWorkId: taskWork.id
            }
          }
        })
      }

      return queries
    },
    shouldQueryAgain: (props, status) => {
      if (status.isPending) return false

      const { taskPlan } = props.selected

      // wait for task plan before re-query
      if (isNil(taskPlan)) return false

      // re-query when we haven't gotten back taskWork
      const { taskWork } = taskPlan

      if (isNil(taskWork)) return true

      return false
    }
  })
)(props => {
  const { taskPlan, currentAgent: agent, actions } = props

  return h(TaskWorker, {
    taskPlan,
    onNavigate: handleNavigate,
    onCancel: handleCancel
  })

  function handleNavigate (taskPlan) {
    actions.router.push(`/tasks/${taskPlan.id}`)
  }

  function handleCancel (taskPlan) {
    const { parentTaskPlan } = taskPlan
    const nextRoute = isNil(parentTaskPlan)
      ? '/' : `/tasks/${parentTaskPlan.id}`
    actions.router.push(nextRoute)
  }
})
