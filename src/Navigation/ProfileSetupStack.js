import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import navigationString from '../constants/navigationString';
import * as ScreenName from '../Screens';

// import TabRoutes from './TabRoutes';

const Stack = createNativeStackNavigator();

const ProfileSetupStack = () => {
  return (
    <>
      {/* <Stack.Screen
        name={navigationString.SELECT_TAGS}
        component={ScreenName.SelectTags}
      /> */}
      <Stack.Screen
        name={navigationString.ADDMEDIASCREEN}
        component={ScreenName.AddMediaScreen}
        options={{gestureEnabled: false}}
      />
      {/* <Stack.Screen
        name={navigationString.SET_PREFERENCES_AUTH}
        component={ScreenName.SetPreferencesAuth}
        options={{gestureEnabled: false}}
      /> */}
      <Stack.Screen
        name={navigationString.VOICE_DROP}
        component={ScreenName.VoiceDrop}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationString.SETUP_COMPLETED}
        component={ScreenName.SetupCompleted}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationString.SELECTGENDER}
        component={ScreenName.SelectGender}
      />
      
    </>
  );
};

export default ProfileSetupStack;
