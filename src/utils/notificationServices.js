import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

import { PERMISSIONS } from 'react-native-permissions';
import { getChatCount, saveChatCounter } from '../redux/reduxActions/chatActions';
import { saveAllHomeData, saveFcmTokenToRedux } from '../redux/reduxActions/authActions';
import { getItem, getUserData, setItem } from './utils';
import NavigationService from '../Navigation/NavigationService';
import navigationString from '../constants/navigationString';
import notifee, {
  AndroidBadgeIconType,
  AndroidImportance,
} from '@notifee/react-native';
import { updateProfileApi } from '../redux/reduxActions/profileActions';
import { useSelector } from 'react-redux';
import { saveUserData } from '../redux/reduxReducers/authReducers';
import { matchUserListApi } from '../redux/reduxActions/homeActions';
import { showError } from './helperFunctions';
import Sound from 'react-native-sound';

export async function requestUserPermission(callback = () => { }) {
  if (Platform.OS === 'ios') {
    await messaging().registerDeviceForRemoteMessages();
    // await messaging().registerForRemoteNotifications()
  }
  if (Platform.Version >= 33 && Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'Allow this app to post notifications?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const token = await getFcmToken();
        callback(false);
        return token;
      } else {
        // Even if user denied the notification permission, we can still
        // obtain an FCM token on Android (POST_NOTIFICATIONS only gates
        // displaying notifications, not receiving data messages / tokens).
        const token = await getFcmToken();
        callback(true);
        return token;
      }
    } catch (err) {
      console.warn(err);
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      const token = await getFcmToken();
      callback(false);
      return token;
    } else {
      callback(true);
    }
  }
  return null;
}

const _getAllUsers = () => {
  const apiData = {
    pageNo: 1
    // latitude:coords?.latitude,
    // longitude:coords?.longitude
  }

  matchUserListApi(apiData)
    .then(res => {
      saveAllHomeData(res?.data?.data)


      console.log(res, 'matchUserListApi res')
    })
    .catch(error => {
      console.log(error)
      showError(error?.message)
    })
}

export const getFcmToken = async () => {
  try {
    if (Platform.OS === 'ios') {
      try {
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
          await messaging().registerDeviceForRemoteMessages();
        }
      } catch (e) {}
    }
    const token = await messaging().getToken();
    if (token) {
      await setItem('FCM_TOKEN', token);
      saveFcmTokenToRedux(token);
      console.log('FCM token: ', token);
    }
    return token || null;
  } catch (error) {
    console.log(error, 'fcm error in creating token');
    return null;
  }
};

// Returns a usable FCM token, preferring Redux, then AsyncStorage, then a
// fresh fetch from FCM. Use this whenever you are about to send the token
// to the backend (login, signup, profile create, etc.) to avoid sending a
// dummy fallback when the in-memory token hasn't loaded yet on Android.
export const ensureFcmToken = async () => {
  try {
    const cached = await getItem('FCM_TOKEN');
    if (cached) {
      saveFcmTokenToRedux(cached);
      return cached;
    }
  } catch (e) {}
  return await getFcmToken();
};

const updateProfile = () => {
  const userData = useSelector(state => state?.authReducers?.userData || {});

  const apiData = {
    first_name: userData?.first_name,
    dob: userData?.dob,
    bio: userData?.bio,
    occupation: userData?.occupation,
    country: userData?.country,
    city: userData?.city,
    gender: userData?.gender || 1,
    church_name: userData?.church_name,
    church_role: userData?.church_role || '',
    body_type: userData?.body_type,
    highest_education: userData?.highest_education,
    looking_for: userData?.looking_for,
    height: userData?.height,
    preference: userData?.preference,
  };
  updateProfileApi(apiData)
    .then(res => {
      console.log(res, 'response from api ==>>>>>');
      saveUserData({ ...userData, is_notification_exist: false });
    })
    .catch(error => {
      console.log(error, 'ERRORRRR');
    });
};

async function onDisplayNotification(data) {
  // Request permissions (required for iOS)

  console.log(data, 'FCM onDisplayNotification datadatadatadata');

  if (Platform.OS === 'ios') {
    await notifee.requestPermission();
  }

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'name',
    sound: 'zego_incoming.mp3',
    pressAction: { id: 'default' },
    smallIcon: 'ic_launcher_round1',
    largeIcon: 'ic_launcher_round1',
    // badgeIconType: AndroidBadgeIconType.LARGE,
    // importance: AndroidImportance.HIGH,
    // vibration: true,
  });

  // Display a notification
  await notifee.displayNotification({
    title: data?.notification?.title,
    body: data?.notification?.body,
    data: data?.data,
    android: {
      channelId,
    },
    ios: {
      sound: 'zego_incoming.mp3',
    },
  });
}

export const notificationListener = async () => {


  const sound = new Sound('zego_incoming.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('Error loading sound:', error);
    } else {
      console.log('Sound loaded successfully');
    }
  });
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', remoteMessage);
    Platform.OS === "android" ? sound.play() : null
    onDisplayNotification(remoteMessage);
  });
  //Backgorund
  messaging().onNotificationOpenedApp(remoteMessage => {
    const { notification } = remoteMessage;
    console.log(remoteMessage, 'background remoteMessageremoteMessage');
    if (remoteMessage?.data?.type === 'chat') {
      getChatCount()
        .then(res => {
          console.log(res, 'CHAT_ID res', remoteMessage);
          saveChatCounter(res?.data);
          getUserData().then((res) => {
            if (res?.subscription?.subscription_id === 3) {
              NavigationService.navigate(navigationString.CHATSCREEN, {
                prevData: remoteMessage?.data?.sender_id,
              });
            } else if (res?.subscription?.subscription_id === 2) {
              NavigationService.navigate(navigationString.CHATSCREEN, {
                prevData: remoteMessage?.data?.sender_id,
              });
            }
          })
        })
        .catch(error => {
          console.log(error, 'CHAT_ID error');
        });
    }
    if (remoteMessage?.data?.type === 'like') {
      NavigationService.navigate(navigationString.MATCHSCREEN, {
        prevData: 2,
      });
      _getAllUsers()
    }
    if (remoteMessage?.data?.type === 'match') {
      NavigationService.navigate(navigationString.MATCHSCREEN);
    }
    if (remoteMessage?.data?.type === 'mass_messaging') {
      updateProfile();
      NavigationService.navigate(navigationString.CONTACT_US);
    }
  });

  //Kill or inactive
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      console.log(remoteMessage, 'remoteMessageremoteMessage');

      if (remoteMessage?.data?.type === 'chat') {
        getChatCount()
          .then(res => {
            console.log(res, 'CHAT_ID res', remoteMessage);
            saveChatCounter(res?.data);
            getUserData().then((res) => {
              if (res?.subscription?.subscription_id === 3) {
                NavigationService.navigate(navigationString.CHATSCREEN, {
                  prevData: remoteMessage?.data?.sender_id,
                });
              } else if (res?.subscription?.subscription_id === 2) {
                NavigationService.navigate(navigationString.CHATSCREEN, {
                  prevData: remoteMessage?.data?.sender_id,
                });
              }
            })
          })
          .catch(error => {
            console.log(error, 'CHAT_ID error');
          });
      }
      if (remoteMessage?.data?.type === 'like') {
        NavigationService.navigate(navigationString.MATCHSCREEN, {
          prevData: 2,
        });
        _getAllUsers()
      }
      if (remoteMessage?.data?.type === 'match') {
        NavigationService.navigate(navigationString.MATCHSCREEN);
      }
      if (remoteMessage?.data?.type === 'mass_messaging') {
        updateProfile();
        NavigationService.navigate(navigationString.CONTACT_US);
      }
    });

  return unsubscribe;
};
