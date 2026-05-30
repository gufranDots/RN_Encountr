import 'react-native-gesture-handler'
import { AppRegistry, LogBox, Platform } from 'react-native'
import messaging from '@react-native-firebase/messaging'
import App from './App'
import { name as appName } from './app.json'
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn'
import * as ZIM from 'zego-zim-react-native'
import * as ZPNs from 'zego-zpns-react-native'
import { getChatCount, saveChatCounter } from './src/redux/reduxActions/chatActions'
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import store from './src/redux/store'
import { Provider } from 'react-redux'
import { updateChatCOunt } from './src/redux/reduxActions/homeActions'


if (__DEV__) {
  require('./ReactotronConfig');
}

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage)
  notifee.setBadgeCount(0).then(() => console.log('Badge count removed!'));

  if (remoteMessage?.data?.type === 'chat') {
    getChatCount()
      .then(res => {
        updateChatCOunt(true)
        saveChatCounter(res?.data);
      })
      .catch(error => {
        console.log(error, 'CHAT_ID error');
      });
  }
})

ZegoUIKitPrebuiltCallService.useSystemCallingUI([ZIM, ZPNs])

LogBox.ignoreLogs(['new NativeEventEmitter'])
LogBox.ignoreLogs(['Warning: ...'])
LogBox.ignoreAllLogs()
const myApp = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}
AppRegistry.registerComponent(appName, () => myApp)

// if (!__DEV__ && Platform.OS !== 'android') {
//   try {
//     console = {}
//     console.assert = () => { }
//     console.log = () => { }
//     console.warn = () => { }
//     console.error = () => { }
//     console.time = () => { }
//     console.timeEnd = () => { }

//     global.console = console
//   } catch (err) { }
// }


// sha keys debug
// SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
// SHA256:FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C

//sha keys release 
// SHA1: 58:FB:A3:97:07:74:FF:FF:07:D8:81:3E:F7:4B:41:93:D9:E1:B5:F9
// SHA256: 0B:72:6A:C0:DC:7C:9E:2E:B6:10:74:91:34:3F:33:E6:FC:B5:95:BF:DD:2C:04:7D:EF:C0:1A:BD:F9:3B:73:24


