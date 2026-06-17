// import liraries
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ZegoCallInvitationDialog} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import {useSelector} from 'react-redux';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import ProfileSetupStack from './ProfileSetupStack';
import OnBoardStack from './OnBoardStack';
import colors from '../styles/colors';
import NavigationService from './NavigationService';
import { isUserProfileComplete } from '../utils/profileCompletion';


const Stack = createNativeStackNavigator();

function Routes() {
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const onBoard = useSelector(state => state?.authReducers?.onBoard);

  const hasToken = Boolean(userData?.token);
  const isProfileComplete = isUserProfileComplete(userData);

  let navigatorKey = 'auth';
  if (hasToken) {
    navigatorKey = isProfileComplete ? 'main' : 'setup';
  } else if (onBoard) {
    navigatorKey = 'onboard';
  }

  return (
    <NavigationContainer
      ref={ref => NavigationService.setTopLevelNavigator(ref)}
    >
      <ZegoCallInvitationDialog />
      <Stack.Navigator
        key={navigatorKey}
        backBehavior="initialRoute"
        screenOptions={{headerShown: false}}>
        {hasToken
          ? !isProfileComplete
            ? ProfileSetupStack()
            : MainStack(userData)
          : onBoard
          ? OnBoardStack()
          : AuthStack()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Routes;
