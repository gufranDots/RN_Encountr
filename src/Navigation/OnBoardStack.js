import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { navigationString } from '../constants'
import { WelcomeScreen } from '../Screens'
import * as ScreenName from '../Screens'

const Stack = createNativeStackNavigator()

const OnBoardStack = () => {
  return (
    <>
      <Stack.Screen
        name={navigationString.WELCOME_SCREEN}
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationString.ONBOARDING_SCREEN}
        component={ScreenName.OnBoardingScreen}
        options={{ headerShown: false }}
      />
    </>
  )
}

export default OnBoardStack