import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import navigationString from '../constants/navigationString';
import * as ScreenName from '../Screens';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <>
      <Stack.Screen
        name={navigationString.ONBOARDING_SCREEN}
        component={ScreenName.OnBoardingScreen}
      />
      <Stack.Screen
        name={navigationString.CREATEPROFILE}
        component={ScreenName.CreateProfile}
      />
      <Stack.Screen
        name={navigationString.SIGNUP}
        component={ScreenName.Signup}
      />
      <Stack.Screen
        name={navigationString.SELECTGENDER}
        component={ScreenName.SelectGender}
      />
      <Stack.Screen
        name={navigationString.SELECTLOCATION}
        component={ScreenName.SelectLocation}
      />
      <Stack.Screen
        name={navigationString.ADDITIONAL_DETAILS}
        component={ScreenName.AdditionalDetails}
      />
      <Stack.Screen
        name={navigationString.PREFERENCES_SCREEN}
        component={ScreenName.PreferencesScreen}
      />
      <Stack.Screen
        name={navigationString.OTPSCREEN}
        component={ScreenName.OtpScreen}
      />
      <Stack.Screen
        name={navigationString.LOGINSCREEN}
        component={ScreenName.loginScreen}
      />
      <Stack.Screen
        name={navigationString.FORGOT_SCREEN}
        component={ScreenName.ForgotScreen}
      />
      <Stack.Screen
        name={navigationString.FORGOT_PASSWORD}
        component={ScreenName.ForgotPassword}
      />
      <Stack.Screen
        name={navigationString.FORGOT_USERNAME}
        component={ScreenName.ForgotUsername}
      />
      <Stack.Screen
        name={navigationString.CREATE_PASSWORD}
        component={ScreenName.CreatePassword}
      />
      <Stack.Screen
        name={navigationString.SELECT_USER_TYPE}
        component={ScreenName.SelectUserType}
      />
      <Stack.Screen
        name={navigationString.TERMS_CONDITION_PRIVACY_POLICY}
        component={ScreenName.TermsConditionPrivacyPolicy}
      />
      <Stack.Screen
        name={navigationString.SHOW_USER_DETAILS}
        component={ScreenName.ShowUserDetails}
      />

      <Stack.Screen
        name={navigationString.SELECT_TAGS}
        component={ScreenName.SelectTags}
      />
      {/* <Stack.Screen
        name={navigationString.ADDMEDIASCREEN}
        component={ScreenName.AddMediaScreen}
      /> */}

      {/* <Stack.Screen
        name={navigationString.SETUP_COMPLETED}
        component={ScreenName.SetupCompleted}
      />  */}
    </>
  );
};

export default AuthStack;
