import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import {
//   ZegoUIKitPrebuiltCallInCallScreen,
//   ZegoUIKitPrebuiltCallWaitingScreen,
// } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import React from 'react';
import navigationString from '../constants/navigationString';
import * as ScreenName from '../Screens';

import {
  ZegoUIKitPrebuiltCallInCallScreen,
  ZegoUIKitPrebuiltCallWaitingScreen,
} from "@zegocloud/zego-uikit-prebuilt-call-rn";

import TabRoutes from './TabRoutes';
import { withIAPContext } from 'react-native-iap';
import DrawerStack from './DrawerStack';

const Stack = createNativeStackNavigator();

const MainStack = userData => {
  return (
    <>
      {!!userData?.pin && !!userData?.is_pin_enable && (
        <Stack.Screen
          name={navigationString.VERIFY_PROFILE_PIN_SCREEN}
          component={ScreenName.VerifyLoginPin}
          initialParams={{ userData: userData }}
        />
      )}
      <Stack.Screen
        name={navigationString.DrawerStack}
        component={DrawerStack}
      />
      {/* <Stack.Screen name={navigationString.DrawerStack} component={TabRoutes} /> */}
      <Stack.Screen
        name={navigationString.CHATSCREEN}
        component={ScreenName.ChatScreen}
      />
      <Stack.Screen
        name={navigationString.CHATSCREEN2}
        component={ScreenName.ChatScreen2}
      />

      <Stack.Screen
        name={navigationString.PROFILESCREEN}
        component={ScreenName.ProfileScreen}
      />

      <Stack.Screen
        name={navigationString.EDITPROFILE}
        component={ScreenName.EditProfile}
      />
      <Stack.Screen
        name={navigationString.VOICE_DROP}
        component={ScreenName.VoiceDrop}
      />
      <Stack.Screen
        name={navigationString.SETTINGSCREEN}
        component={ScreenName.SettingScreen}
      />
      <Stack.Screen
        name={navigationString.VIEWPROFILE}
        component={ScreenName.ViewProfile}
      />
      <Stack.Screen
        name={navigationString.SUBSCRIPTION_SCREEN}
        component={ScreenName.StripeSubscriptionScreen}
      />
      <Stack.Screen
        name={navigationString.PUBLIC_GROUP_CHAT}
        component={ScreenName.PublicGroupChat}
      />
      <Stack.Screen
        name={navigationString.BOOM_ME}
        component={ScreenName.BoomMe}
      />
      <Stack.Screen
        name={navigationString.View_Member_Group}
        component={ScreenName.ViewMemberGroup}
      />
      <Stack.Screen
        name={navigationString.ONE_TIME_READ}
        component={ScreenName.OneTimeRead}
      />

      <Stack.Screen
        name={navigationString.PRIVATE_GROUP_CHAT}
        component={ScreenName.PrivateGroupChat}
      />
      <Stack.Screen
        name={navigationString.ALL_GALLERY_IMAGES}
        component={ScreenName.AllGalleryImages}
      />
      <Stack.Screen
        name={navigationString.CHANGE_PASSWORD}
        component={ScreenName.ChangePassword}
      />
      <Stack.Screen
        name={navigationString.TAPS_HISTORY}
        component={ScreenName.TapsHistory}
      />
      <Stack.Screen
        name={navigationString.BLOCKED_USERS}
        component={ScreenName.BlockedUsers}
      />
      {/* <Stack.Screen
        name={navigationString.FACE_DETECTION_EDIT}
        component={ScreenName.FaceDetectionUser}
      /> */}
      <Stack.Screen
        name={navigationString.CONTACT_US}
        component={ScreenName.ContactScreen}
      />
      <Stack.Screen
        name={navigationString.TERMS_CONDITION_PRIVACY_POLICY}
        component={ScreenName.TermsConditionPrivacyPolicy}
      />
      {/* <Stack.Screen
        options={{headerShown: false}}
        name="ZegoUIKitPrebuiltCallWaitingScreen"
        component={ZegoUIKitPrebuiltCallWaitingScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ZegoUIKitPrebuiltCallInCallScreen"
        component={ZegoUIKitPrebuiltCallInCallScreen}
      /> */}
      <Stack.Screen
        name={navigationString.SET_PREFERENCES_AUTH}
        component={ScreenName.SetPreferencesAuth}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={navigationString.EXPLORE}
        component={ScreenName.Explore}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={navigationString.VIEWED_ME_LIST}
        component={ScreenName.VIEWED_ME_LIST}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={navigationString.STRIPE_PAYMENT}
        component={ScreenName.STRIPE_PAYMENT}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={navigationString.CREATE_CHAT_ROOM}
        component={ScreenName.CREATE_CHAT_ROOM}
      // options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationString.ADD_CHAT_MEMBER}
        component={ScreenName.AddChatMember}
      // options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationString.MAP_SCREEN}
        component={ScreenName.MapScreen}
      // options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationString.ALL_PRIVATE_GALLERY_IMAGES}
        component={ScreenName.AllPrivateGalleryImages}
      // options={{gestureEnabled: false}}
      />

      <Stack.Screen
        name={navigationString.SET_PIN_SCREEN}
        component={ScreenName.SetPinScreen}
      // options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name={navigationString.OTPSCREEN}
        component={ScreenName.OtpScreen}
      />
      <Stack.Screen
        name={navigationString.PROFILE_PERMISSIONS}
        component={ScreenName.ProfilePermissions}
      />
      <Stack.Screen
        name={navigationString.FAVORITE_CHAT}
        component={ScreenName.FavoriteChat}
      />
      <Stack.Screen
        name={navigationString.ADMIN_CONTACT}
        component={ScreenName.AdminContact}
      />
      <Stack.Screen
        name={navigationString.CYPHER_SCREEN}
        component={ScreenName.CypherScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="ZegoUIKitPrebuiltCallWaitingScreen"
        component={ZegoUIKitPrebuiltCallWaitingScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="ZegoUIKitPrebuiltCallInCallScreen"
        component={ZegoUIKitPrebuiltCallInCallScreen}
      />
    </>
  );
};

export default MainStack;
