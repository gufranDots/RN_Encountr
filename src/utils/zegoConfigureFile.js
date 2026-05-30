// import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn'
// import * as ZIM from 'zego-zim-react-native'
// import * as ZPNs from 'zego-zpns-react-native'
// import ZegoUIKit from '@zegocloud/zego-uikit-rn'
import {
  ZEGOCLOUD_APP_ID,
  ZEGOCLOUD_APP_SIGN,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  ONE_ON_ONE_VOICE_CALL_CONFIG
} from '../config/urls'
// import navigationString from '../constants/navigationString'
// import { socketRef } from './utils'
// import { showError } from './helperFunctions'

// export const configureZegoCloud = async userData => {
//   ZegoUIKitPrebuiltCallService.init(
//     ZEGOCLOUD_APP_ID,
//     ZEGOCLOUD_APP_SIGN,
//     userData?.id,
//     userData?.user_name,
//     [ZegoUIKitSignalingPlugin],
//     [ZIM, ZPNs],
//     {
//       onOutgoingCallTimeout: (callID, inviter, type, invitees) => {
//         console.log('Incoming call:', callID, inviter, type, invitees)
//         socketMessage = {
//           sender_id: userData?.id,
//           user_id: inviter[0]?.userID,
//           receiver_id: inviter[0]?.userID,
//           _id: userData?.id,
//           text: 'You have Missed call',
//           message: 'You have Missed call',
//           type: type || 'text',
//           createdAt: String(new Date()),
//           user: {
//             _id: userData?.id,
//             name: userData?.user_name,
//             avatar: userData?.profile_image
//           }
//         }
//         socketRef.emit('sendMessage', socketMessage, (response, err) => {
//           console.log('SOCKET sendMessage 11111111', response, err)
//           const sentMsgRes = response?.data
//           if (response.status === 'error') {
//             showError(response?.message || 'Error')
//           }
//         })
//       },
//       onOutgoingCallCancelButtonPressed: (callID, inviter, type, invitees) => {
//         console.log('OUTncoming call:', type, invitees)
//         socketMessage = {
//           sender_id: userData?.id,
//           user_id: type[0]?.userID,
//           receiver_id: type[0]?.userID,
//           _id: userData?.id,
//           text: 'You have Missed call',
//           message: 'You have Missed call',
//           type: 'text',
//           createdAt: String(new Date()),
//           user: {
//             _id: userData?.id,
//             name: userData?.user_name,
//             avatar: userData?.profile_image
//           }
//         }
//         socketRef.emit('sendMessage', socketMessage, (response, err) => {
//           console.log('SOCKET sendMessage 11111111', response, err)
//           const sentMsgRes = response?.data
//           if (response.status === 'error') {
//             showError(response?.message || 'Error')
//           }
//         })
//       },
//       ringtoneConfig: {
//         incomingCallFileName: 'zego_incoming.mp3',
//         outgoingCallFileName: 'zego_incoming.mp3'
//       },
//       notifyWhenAppRunningInBackgroundOrQuit: true,
//       isIOSSandboxEnvironment: false,
//       androidNotificationConfig: {
//         channelID: 'ZegoUIKit',
//         channelName: 'ZegoUIKit'
//       },
//       requireConfig: data => {
//         console.log(data, 'ZEGOXXX requireConfig')
//         const callConfig = data.type
//           ? ONE_ON_ONE_VIDEO_CALL_CONFIG
//           : ONE_ON_ONE_VOICE_CALL_CONFIG
//         return {
//           ...callConfig,
//           onHangUP: duration => {
//             props.navigation.navigate(navigationString.HOME)
//           },
//           durationConfig: {
//             isVisible: true
//             // onDurationUpdate: duration => {
//             //   console.log(duration, 'ZEGOXXX duration')
//             //   if (duration === 10) {
//             //     ZegoUIKitPrebuiltCallService.hangUp()
//             //   }
//             // }
//           }
//         }
//       }
//     }
//   )

//   ZegoUIKit.onError(userData?.id, (method, code, message) => {
//     console.log('++++++------', method, code, message);
//   });
// }

export const removeZegoCloud = async () => {
  ZegoUIKit.getSignalingPlugin().logout()
  ZegoUIKitPrebuiltCallService.uninit()
}




import ZegoUIKitPrebuiltCallService from "@zegocloud/zego-uikit-prebuilt-call-rn";
import * as ZIM from "zego-zim-react-native";
import * as ZPNs from "zego-zpns-react-native";

export const configureZegoCloud = async (userData) => {
  let user_id = userData?.id;
  let user_name = userData?.user_name;
  


  return ZegoUIKitPrebuiltCallService.init(
    ZEGOCLOUD_APP_ID,
    ZEGOCLOUD_APP_SIGN,
    `${user_id}`,
    `${user_name}`,
    [ZIM, ZPNs],
    {
      androidNotificationConfig: {
        channelID: "ZegoUIKit",
        channelName: "ZegoUIKit",
      },
    },
  );
};



