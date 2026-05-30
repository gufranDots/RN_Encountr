import React, { useLayoutEffect, useState } from 'react'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import FastImage from '../../utils/FastImageCompat'

import HeaderComp from '../../Components/HeaderComp'
import imagesPath from '../../constants/imagesPath'

import {
  moderateScale,
  moderateScaleVertical,
  width
} from '../../styles/responsiveSize'
import { Loader } from '../../Components/Loader'
import WrapperContainer from '../../Components/WrapperContainer'
import strings from '../../constants/Languages'
import { createNewProfileApi } from '../../redux/reduxActions/authActions'
import { uploadProfilePicApi } from '../../redux/reduxActions/homeActions'
import colors from '../../styles/colors'
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles'
import { ApiError, showError } from '../../utils/helperFunctions'
import { useSelector } from 'react-redux'
import { setItem } from '../../utils/utils'
import { ensureFcmToken } from '../../utils/notificationServices'

const SelectUserType = props => {
  const { navigation, route } = props
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);

  const fcmToken = useSelector(state => state?.authReducers?.token || null)

  const [prevData, setPrevData] = useState(route?.params?.prevData)
  const [isLoading, setLoading] = useState(false)

  // console.log(prevData, 'fkjsdgggjksd')

  // useLayoutEffect(() => {
  //   _onSelectUserType()
  // }, [])

  const _onSelectUserType = async userType => {
    const resolvedFcmToken = fcmToken || (await ensureFcmToken());
    const apiData = {
      church_name: prevData?.church_name || '',
      church_role: prevData?.church_role || '',
      first_name: prevData?.name || '',
      user_name: prevData?.user_name || '',
      email: prevData?.email || '',
      country_code: prevData?.country_code || '',
      country_flag: prevData?.country_flag || '',
      phone_number: prevData?.phone_number || '',
      password: prevData?.password || '',
      dob: prevData?.dob || '',
      country: prevData?.country || '',
      city: prevData?.state || '',
      user_type: userType || '',
      device_type: Platform.OS,
      device_token: resolvedFcmToken || '_TEST',
      bio: prevData?.bio || '',
      occupation: prevData?.occupation || '',
      gender:
        prevData?.gender.toLowerCase() == 'men'
          ? '2'
          : prevData?.gender.toLowerCase() == 'women'
            ? '1'
            : '3' || 2
    }
    setLoading(true)
    createNewProfileApi(apiData)
      .then(res => {
        console.log(res, 'resresresresresres')
        _updateProfilePic()
        setLoading(false)
      })
      .catch(error => {
        setLoading(false)
        showError(ApiError(error))
      })

    console.log(apiData, 'apiDataapiData')
  }

  const _updateProfilePic = () => {
    const _formData = new FormData()
    _formData.append('image', {
      uri: prevData?.profile_image?.path,
      name: 'image.png',
      fileName: 'filename',
      type: 'image/png'
    })
    _formData.append('with_thumb', true)

    setItem('PROFILE_BASE_64', prevData?.profile_image?.data)

    uploadProfilePicApi(_formData)
      .then(res => {
        setLoading(false)
      })
      .catch(error => {
        setLoading(false)
        showError(ApiError(error))
      })
  }

  return (
    <WrapperContainer paddingAvailable={false}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.5, padding: moderateScale(30) }}>
          <HeaderComp
            leftIcon={imagesPath.ic_back}
            onPressBack={() => navigation.goBack()}
          />

          <TouchableOpacity
            hitSlop={hitSlopProp}
            activeOpacity={0.7}
            onPress={() => _onSelectUserType(1)}>
            <FastImage
              source={imagesPath.ic_logobonkers}
              style={{
                height: moderateScale(80),
                width: width / 4
              }}
              resizeMode={'contain'}
            />

            <Text style={{ ...commonStyles.font_16_SemiBold }}>
              {strings.longtermDating}
            </Text>
            <Image
              source={imagesPath.arrow}
              style={{ margin: moderateScale(6), tintcolor: theme.colors.black }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          hitSlop={hitSlopProp}
          activeOpacity={0.7}
          onPress={() => _onSelectUserType(2)}
          style={styles.TextView}>
          <FastImage
            source={imagesPath.ic_logobonk}
            style={{
              height: moderateScale(60),
              width: width / 4
            }}
            resizeMode={'contain'}
          />
          <Text style={{ ...commonStyles.font_16_SemiBold }}>
            {strings.casualFun}
          </Text>

          <Image
            source={imagesPath.arrow}
            style={{ margin: moderateScale(6), tintcolor: theme.colors.black }}
          />
        </TouchableOpacity>
      </View>
      <Image source={imagesPath.setprefback} style={styles.imgStyle} />
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  )
}

export default SelectUserType

const getStyles = (theme, commonStyles) => StyleSheet.create({
  headingText: {
    marginTop: moderateScaleVertical(20),
    paddingLeft: moderateScale(3),
    ...commonStyles.font_26_bold,
    textTransform: 'uppercase'
  },
  cardStyle: {
    backgroundColor: theme.colors.orange,
    flexDirection: 'row',
    borderRadius: moderateScale(15),
    marginTop: moderateScaleVertical(50),
    borderWidth: 2,
    shadowColor: theme.colors.gray2,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3
  },
  imgStyle: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: -100,
    opacity: 0.7
  },
  TextView: {
    flex: 0.5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: moderateScale(60)
  }
})
