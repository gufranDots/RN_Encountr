// import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn'
// import * as ZIM from 'zego-zim-react-native'
// import * as ZPNs from 'zego-zpns-react-native'
// import ZegoUIKit from '@zegocloud/zego-uikit-rn'
import ZegoUIKitPrebuiltCallService from "@zegocloud/zego-uikit-prebuilt-call-rn";
import ZegoUIKit from "@zegocloud/zego-uikit-rn";
import * as ZIM from "zego-zim-react-native";
import * as ZPNs from "zego-zpns-react-native";
import {
  ZEGOCLOUD_APP_ID,
  ZEGOCLOUD_APP_SIGN,
} from '../config/urls';

let zegoInitPromise = null;
let zegoInitializedUserId = null;

export const removeZegoCloud = async () => {
  ZegoUIKit.getSignalingPlugin().logout();
  ZegoUIKitPrebuiltCallService.uninit();
  zegoInitPromise = null;
  zegoInitializedUserId = null;
};

export const configureZegoCloud = async (userData) => {
  const user_id = userData?.id;
  const user_name = userData?.user_name;

  if (!user_id) {
    return null;
  }

  const userIdStr = `${user_id}`;

  if (zegoInitPromise && zegoInitializedUserId === userIdStr) {
    return zegoInitPromise;
  }

  if (zegoInitializedUserId && zegoInitializedUserId !== userIdStr) {
    await removeZegoCloud();
  }

  zegoInitializedUserId = userIdStr;
  zegoInitPromise = ZegoUIKitPrebuiltCallService.init(
    ZEGOCLOUD_APP_ID,
    ZEGOCLOUD_APP_SIGN,
    userIdStr,
    `${user_name}`,
    [ZIM, ZPNs],
    {
      androidNotificationConfig: {
        channelID: "ZegoUIKit",
        channelName: "ZegoUIKit",
      },
    },
  );

  try {
    return await zegoInitPromise;
  } catch (error) {
    zegoInitPromise = null;
    zegoInitializedUserId = null;
    throw error;
  }
};
