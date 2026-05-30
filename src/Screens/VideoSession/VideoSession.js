import React, { useState, useRef } from 'react'
import { Image, TouchableOpacity, View, TouchableWithoutFeedback, Text, Button, TextInput } from 'react-native'
import {  ONE_ON_ONE_VOICE_CALL_CONFIG, ONE_ON_ONE_VIDEO_CALL_CONFIG, ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn'
import { useSelector } from 'react-redux'
import { moderateScale } from '../../styles/responsiveSize'
import colors from '../../styles/colors'
import imagesPath from '../../constants/imagesPath'
import HeaderComp from '../../Components/HeaderComp'
import { enableFreeze } from 'react-native-screens'
enableFreeze()
const VideoSession = (props) => {
  const { route, navigation } = props
  const userData = useSelector(state => state?.authReducers?.userData || {})

  // const AUDIO = { ...ONE_ON_ONE_VOICE_CALL_CONFIG }
  // const VIDEO = { ...ONE_ON_ONE_VIDEO_CALL_CONFIG }
  // const VIDEO_TYPE = route?.params?.type === 'AUDIO' ? AUDIO : VIDEO

  const [invitees, setInvitees] = useState([])
  const viewRef = useRef(null)

  const changeTextHandle = value => {
    setInvitees(value ? value.split(',') : [])
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>

      <ZegoUIKitPrebuiltCall
        appID={126482989}
        appSign={'bcbbd4f9b06b7bf6e52677be11f23f71b6ad39e0b571acc223197dbe04d9b924'}
        userID={String(userData?.id)} // userID can be something like a phone number or the user id on your own user system.
        userName={userData?.first_name}
        callID={'15'} // callID can be any unique string.
        config={{
          // You can also use ONE_ON_ONE_VOICE_CALL_CONFIG/GROUP_VIDEO_CALL_CONFIG/GROUP_VOICE_CALL_CONFIG to make more types of calls.
          ...VIDEO_TYPE,
          onOnlySelfInRoom: () => { navigation.goBack() },
          onHangUp: () => { navigation.goBack() }
        }}
      />

      <HeaderComp
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
        viewStyle={{
          marginTop: moderateScale(40),
          marginStart: moderateScale(24)
        }}
      />

<TouchableWithoutFeedback>
      <View>
        <Text>Your user id: {userData?.user_name}</Text>
        <View>
          <TextInput
            ref={viewRef}
            style={{ backgroundColor: 'pink' }}
            onChangeText={changeTextHandle}
            placeholder="Invitees ID, Separate ids by ','"
          />
          <ZegoSendCallInvitationButton
            invitees={invitees.map((inviteeID) => {
              return { userID: inviteeID, userName: inviteeID }
            })}
            isVideoCall={false}
            resourceID={'zegouikit_call'}
          />
          <ZegoSendCallInvitationButton
            invitees={invitees.map((inviteeID) => {
              return { userID: inviteeID, userName: inviteeID }
            })}
            isVideoCall={true}
            resourceID={'zegouikit_call'}
          />
        </View>
        <View style={{ width: 220, marginTop: 100 }}>
          <Button title='Back To Login Screen' onPress={() => { navigation.navigate('LoginScreen') }}></Button>
        </View>
      </View>
    </TouchableWithoutFeedback>

    </View>
  )
}
export default VideoSession
