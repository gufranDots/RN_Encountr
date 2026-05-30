import { SafeAreaView, StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

import HeaderComp from '../../Components/HeaderComp'
import imagesPath from '../../constants/imagesPath'
import { height, moderateScale, width } from '../../styles/responsiveSize'
import strings from '../../constants/Languages'
import {getCommonStyles} from '../../styles/commonStyles'
import ButtonComp from '../../Components/ButtonComp'
import navigationString from '../../constants/navigationString'
import { useNavigation } from '@react-navigation/native'
import WrapperContainer from '../../Components/WrapperContainer'
import GradientText from '../../Components/GradientText'
import { useSelector } from 'react-redux'
import RNFetchBlob from 'rn-fetch-blob'
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions'
import { getItem, setItem, setUserData } from '../../utils/utils'
import { Loader } from '../../Components/Loader'
import { logoutApi, saveLoginToStore, saveProfileSetupDoneToStore } from '../../redux/reduxActions/authActions'
import { saveUserDataToStore, setBonkFiltersApi, setBonkersFiltersApi } from '../../redux/reduxActions/homeActions'
import { useTheme } from '../../theme/ThemeProvider'

export default function SetupCompleted (props) {
  const {theme, isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles, isDark)
  const navigation = useNavigation()
  const apiData=props.route.params
  const userData = useSelector(state => state?.authReducers?.userData || {})

  const timerRef = useRef(0)
  const [timer, setTimer] = useState(5)
  const [isLoading, setLoading] = useState(true)

  const fs = RNFetchBlob.fs
  let imagePath = null

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

  useEffect(() => {
    _convertImageToBase64()
  }, [])

  const _convertImageToBase64 = async () => {
    const base64Image = await getItem('PROFILE_BASE_64')
    console.log(base64Image, 'base64 Imagebase64Image')
    if (base64Image != null) {
      console.log(base64Image, 'base64 Imagebase64Image inside')
      setLoading(false)
      return
    }
    console.log(base64Image, 'base64 Imagebase64Image XXXX')
    RNFetchBlob.config({
      fileCache: true
    }).fetch('GET', userData?.profile_image)
      .then(resp => {
        imagePath = resp.path()
        setLoading(false)
        return resp.readFile('base64')
      })
      .then(base64Data => {
        setLoading(false)
        console.log(base64Data, 'base64 Database64Data')
        setItem('PROFILE_BASE_64', base64Data)
        return fs.unlink(imagePath)
      }).catch((error) => {
        console.log(error, 'base64 error', userData)
        setLoading(false)
      })
  }

  const start=()=>{
    setLoading(true);
    const API_TYPE =
    userData?.user_type === 1
      ? setBonkersFiltersApi(apiData)
      : setBonkFiltersApi(apiData);
      API_TYPE.then(res => {
        setLoading(false);
      }).catch(err => {
        console.log(err);
        showError(ApiError(err));
        setLoading(false);
      });
    // setBonkersFiltersApi(true)
    // logoutApi()
    // .then(res => {
    //   // setIsLoading(false)
    //   // saveLoginToStore(false)
    //   // saveLoginPinToStore(null)
    //   // clearLoginPin()
    // })
    // .catch(() => {
    //   // setIsLoading(false)
    // })
  }

  return (
    <WrapperContainer isSafeAreaAvailable>
      <HeaderComp />
      <View style={{ flex: 0.96, marginTop: moderateScale(24) }}>
        <View style={{ paddingTop: moderateScale(10) }}>
        </View>
        <View style={{ paddingTop: moderateScale(12), }}>
          {/* <GradientText
            text={strings.You_are_signed_up}
            textStyle={commonStyles.font_16_medium}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 0.7, y: 0.8 }}
          /> */}
          {/* <Text
            style={{
              ...commonStyles.font_14_medium,
              color: colors.likePink
            }}>
            {
              strings.Based_on_the_profile_parameters_selected_the_users_will_be_provided_with_a_profile_rating
            }
          </Text> */}
          {/* <Text
            style={{
              ...commonStyles.font_12_medium,
              marginTop: moderateScale(10),
              opacity: 0.9,
              color: colors.darkBlack
            }}>
            {strings.This_can_be_viewed_visually_by_other_users}
          </Text> */}
        </View>
        <View style={styles.imagestyle}>

          <Image source={imagesPath.congrats1} style={{height:height/6,width:width/2.6}}/>
        <GradientText
            text={strings.Congratulations}
            textStyle={styles.mainText}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 0.7, y: 0.8 }}
          />
        <GradientText
        
            text={strings.You_are_signed_up}
            textStyle={{...commonStyles.font_16_medium,marginTop:moderateScale(12)}}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 0.7, y: 0.8 }}
          />
          {/* <Text
            style={{
              ...commonStyles.font_12_regular,
              padding: moderateScale(10)
            }}>
            {'Welcome to'}
            <Text style={{ ...commonStyles.font_12_SemiBold }}>{' Encountr '}</Text>
          </Text> */}
          {/* <View style={{ width, flex: 0.8, justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={imagesPath.ic_redBadge}
              style={{ height: '50%', width: '50%' }}
              resizeMode={'contain'}
            />
          </View> */}
        </View>
      </View>

      <View style={{}}>
        <ButtonComp
          btnText={strings.startencounter + `${timer == 0 ? '' : ' in ' + timer}`}
          onPressBtn={() =>start()
            //  navigation.navigate(navigationString.FACE_DETECTION)
          }
          disabled={timer != 0}
          btnView={{ backgroundColor: timer != 0 ? theme.colors.grey_187_1 : theme.colors.themecolor2 }}
        />
      </View>

      <Loader isLoading={isLoading} />
    </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles, isDark) => StyleSheet.create({
  container: {
    flex: 1
  },
  mainText: {
    ...commonStyles.font_34_bold,
    color: isDark ? theme.colors.blackOpacity80 : theme.colors.themecolor2
  },
  imagestyle: {
    // backgroundColor: 'red',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
