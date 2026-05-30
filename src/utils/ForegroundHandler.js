import notifee, {
  AndroidColor,
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import {Platform} from 'react-native';
import {getChatCount, saveChatCounter} from '../redux/reduxActions/chatActions';
import { updateChatCOunt } from '../redux/reduxActions/homeActions';

const ForegroundHandler = props => {
  useEffect(() => {
    return notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        if (detail?.notification?.data?.type === 'chat') {
          getChatCount()
            .then(res => {
              console.log(res, 'CHAT_ID res',!!res?.data);
              // saveChatCounter(res?.data);
              updateChatCOunt(!!res?.data)
              NavigationService.navigate(navigationString.CHATSCREEN, {
                prevData: detail?.notification?.data?.sender_id,
              });
            })
            .catch(error => {
              console.log(error, 'CHAT_ID error');
            });
        }
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('remote message foreground', remoteMessage);

      const {data, messageId, notification} = remoteMessage;
      if (remoteMessage?.data?.type === 'chat') {
        getChatCount()
          .then(res => {
            console.log(res, 'CHAT_ID res',!!res?.data);
            updateChatCOunt(true)
            saveChatCounter(res?.data);
          })
          .catch(error => {
            console.log(error, 'CHAT_ID error');
          });
      }
      /// Create a channel (required for Android)

      if (Platform.OS === 'ios') {
        await notifee.requestPermission();
      }

      let displayNotificationData = {};
      // if (Platform.OS==="android") {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        vibration: true,
        lightColor: AndroidColor.YELLOW,
        sound: 'notification.wav',
        importance: AndroidImportance.HIGH,
      });
      displayNotificationData = {
        title: data?.title || notification?.title || '',
        body: data?.body || notification?.body || '',
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
          importance: AndroidImportance.HIGH,
        },

        data: {...data},
      };

      // }
      // else{
      //   displayNotificationData = {
      //     title: data?.title || notification?.title || '',
      //     body: data?.body || notification?.body || '',
      //     ios: {
      //       sound: 'default',
      //       criticalVolume: 0.9,
      //     },
      //     data: { ...data },
      //   };
      // }

      await notifee.displayNotification(displayNotificationData);
    });
    return unsubscribe;
  }, []);

  return null;
};

export default ForegroundHandler;
