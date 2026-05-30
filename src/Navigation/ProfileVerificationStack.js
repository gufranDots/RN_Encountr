import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import navigationString from '../constants/navigationString'
import * as ScreenName from '../Screens'

// import TabRoutes from './TabRoutes';

const Stack = createNativeStackNavigator()

const ProfileVerificationStack = () => {
  return (
        <>
            {/* <Stack.Screen
                name={navigationString.SETUP_COMPLETED}
                component={ScreenName.SetupCompleted}
            /> */}
            {/* <Stack.Screen
                name={navigationString.FACE_DETECTION}
                component={ScreenName.FaceDetection}
            /> */}
        </>
  )
}

export default ProfileVerificationStack
