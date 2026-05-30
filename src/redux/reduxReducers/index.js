import { combineReducers } from '@reduxjs/toolkit'
import actionTypes from '../actionTypes'

import authReducers from './authReducers'
import homeReducers from './homeReducers'
import walkSafeReducers from './walkSafeReducers'
import themeReducers from './themeReducers'

const appReducer = combineReducers({
  authReducers,
  homeReducers,
  walkSafeReducers,
  themeReducers
})

const rootReducer = (state, action) => {
  if (action.type == actionTypes.CLEAR_REDUX_STATE) {
    state = undefined
  }
  return appReducer(state, action)
}

export default rootReducer
