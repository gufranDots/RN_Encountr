import React, { useEffect, useRef, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { useNavigation } from '@react-navigation/native'
import ButtonComp from '../../Components/ButtonComp'
import HeaderComp from '../../Components/HeaderComp'
import WrapperContainer from '../../Components/WrapperContainer'
import imagesPath from '../../constants/imagesPath'
import { saveLoginToStore } from '../../redux/reduxActions/authActions'
import {getCommonStyles} from '../../styles/commonStyles'
import { moderateScale } from '../../styles/responsiveSize'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import { enableFreeze } from 'react-native-screens'
import { useTheme } from '../../theme/ThemeProvider'
enableFreeze()
export default function ProfileVerification () {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const navigation = useNavigation()

  const timerRef = useRef(0)
  const [timer, setTimer] = useState(5)

  useEffect(() => {
    if (timer != 0) {
      timerRef.current = setTimeout(() => {
        setTimer(timer - 1)
      }, 1000)
    } else {
      clearTimeout(timerRef)
    }
    return () => {
      clearTimeout(timerRef)
    }
  }, [timer])

  const onBtnPress = () => {
    // navigation.navigate(navigationString.FACE_DETECTION)
    alert()
    // navigation.dispatch(
    //   CommonActions.reset({
    //     index: 1,
    //     routes: [
    //       { name: navigationString.TABROUTES }
    //     ]
    //   })
    // )
  }

  return (
    <WrapperContainer>
      <HeaderComp
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
      />

      <View style={{ paddingTop: moderateScale(26) }}>
        <Text style={styles.mainText}>{"strings.profileVerification"}</Text>
      </View>
      <View style={styles.imagestyle}>
        {/* <Text style={{ padding: moderateScale(10) }}>you got a RED badge</Text> */}
        <Image source={imagesPath.faceScan} style={{ alignSelf: 'flex-end', height: '60%', width: '60%', resizeMode: 'contain' }} />
        {/* <Image source={imagesPath.ic_Person2} style={{ alignSelf: 'flex-end' }} />
        <Image source={imagesPath.ic_Person3} style={{ alignSelf: 'flex-end' }} /> */}
      </View>
      <View
        style={{
          paddingTop: moderateScale(20),
          paddingHorizontal: moderateScale(4),
          alignContent: 'center'
        }}>
        <Text style={{ ...commonStyles.font_14_medium, textAlign: 'center' }}>
          {
            strings.To_verify_the_accountupload_the_selfie_with_the_same_gestures_shown_in_the_sample_photos
          }
        </Text>
        <Text
          style={{
            ...commonStyles.font_12_regular,
            marginTop: moderateScale(10),
            opacity: 0.8,
            textAlign: 'center'
          }}>
          {strings.These_photos_will_no_be_shared_with_anyone}
        </Text>
      </View>

      <View
        style={{
          justifyContent: 'flex-end',
          flex: 0.4,
          marginBottom: moderateScale(20)
        }}>
        <ButtonComp
          btnText={strings.startVerification + `${timer == 0 ? '' : ' in ' + timer}`}
          onPressBtn={onBtnPress}
          disabled={timer != 0}
          btnView={{ backgroundColor: timer != 0 ? theme.colors.grey_187_1 : theme.colors.themecolor2 }}
        />
      </View>
    </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles) => StyleSheet.create({
  container: {
    flex: 1
  },
  mainText: {
    ...commonStyles.font_34_bold
  },
  imagestyle: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  }
})
