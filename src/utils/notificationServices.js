import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { getChatCount, saveChatCounter } from '../redux/reduxActions/chatActions';
import { saveAllHomeData, saveFcmTokenToRedux } from '../redux/reduxActions/authActions';
import { getItem, getUserData, setItem } from './utils';
import NavigationService from '../Navigation/NavigationService';
import navigationString from '../constants/navigationString';
import notifee, {
  AndroidImportance,
} from '@notifee/react-native';
import { updateProfileApi } from '../redux/reduxActions/profileActions';
import { useSelector } from 'react-redux';
import { saveUserData } from '../redux/reduxReducers/authReducers';
import { matchUserListApi } from '../redux/reduxActions/homeActions';
import { showError } from './helperFunctions';

export async function requestUserPermission(callback = () => { }) {
  if (Platform.OS === 'ios') {
    await messaging().registerDeviceForRemoteMessages();
    // await messaging().registerForRemoteNotifications()
  }
  if (Platform.Version >= 33 && Platform.OS === 'android') {
    try {
      const token = await getFcmToken();
      callback(false);
      return token;
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

const stringifyNotificationData = data => {
  if (!data || typeof data !== 'object') {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value ?? '')]),
  );
};

const getNotificationContent = remoteMessage => {
  const {notification, data} = remoteMessage || {};
  const title =
    notification?.title ||
    data?.title ||
    data?.notification_title ||
    'Encountr';
  const body =
    notification?.body ||
    data?.body ||
    data?.content ||
    data?.message ||
    data?.notification_body ||
    '';
  return {title, body};
};

let defaultChannelId = null;

const ensureDefaultChannel = async () => {
  if (Platform.OS !== 'android') {
    return null;
  }
  if (defaultChannelId) {
    return defaultChannelId;
  }
  defaultChannelId = await notifee.createChannel({
    id: 'encountr_notifications',
    name: 'Encountr Notifications',
    sound: 'zego_incoming',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });
  return defaultChannelId;
};

export async function displayForegroundNotification(remoteMessage) {
  console.log('[FCM] displayForegroundNotification', remoteMessage);

  const {title, body} = getNotificationContent(remoteMessage);
  const {data} = remoteMessage || {};

  if (!body && !title) {
    console.warn('[FCM] foreground message missing title/body', remoteMessage);
    return;
  }

  try {
    const settings = await notifee.requestPermission();
    if (Platform.OS === 'android' && settings.authorizationStatus === 0) {
      console.warn('[FCM] notification permission denied on Android');
      return;
    }

    const channelId = Platform.OS === 'android' ? await ensureDefaultChannel() : null;

    await notifee.displayNotification({
      title,
      body,
      data: stringifyNotificationData(data),
      ...(Platform.OS === 'android' && channelId
        ? {
            android: {
              channelId,
              smallIcon: 'ic_notification',
              pressAction: {id: 'default'},
              importance: AndroidImportance.HIGH,
              sound: 'zego_incoming',
            },
          }
        : {}),
      ...(Platform.OS === 'ios'
        ? {
            ios: {
              sound: 'default',
              foregroundPresentationOptions: {
                alert: true,
                badge: true,
                sound: true,
                list: true,
              },
            },
          }
        : {}),
    });
    console.log('[FCM] foreground notification displayed');
  } catch (error) {
    console.warn('[FCM] failed to display foreground notification', error);
  }
}

export function registerForegroundMessageHandler() {
  if (Platform.OS === 'android') {
    ensureDefaultChannel().catch(error => {
      console.warn('[FCM] failed to create default channel', error);
    });
  }

  return messaging().onMessage(async remoteMessage => {
    console.log('[FCM] onMessage (foreground)', remoteMessage);

    if (remoteMessage?.data?.type === 'chat') {
      getChatCount()
        .then(res => {
          saveChatCounter(res?.data);
        })
        .catch(error => {
          console.log(error, 'CHAT_ID error');
        });
    }

    await displayForegroundNotification(remoteMessage);
  });
}
export const notificationListener = () => {
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
};
