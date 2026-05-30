// import liraries
import React, { useLayoutEffect, useState } from 'react'
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import ButtonComp from '../../Components/ButtonComp'
import GradientText from '../../Components/GradientText'
import HeaderComp from '../../Components/HeaderComp'
import { Loader } from '../../Components/Loader'
import WrapperContainer from '../../Components/WrapperContainer'

import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'

import {getCommonStyles} from '../../styles/commonStyles'
import { height, moderateScale, width } from '../../styles/responsiveSize'
import {
  ApiError,
  getColorCodeWithOpactiyNumberHASHES,
  showError
} from '../../utils/helperFunctions'
import { createNewProfileApi } from '../../redux/reduxActions/authActions'
import { setItem } from '../../utils/utils'
import { uploadProfilePicApi } from '../../redux/reduxActions/homeActions'
import {
  BODY_TYPE,
  EDUCATION,
  LOOKING_FOR,
  MAX_HEIGHT,
  MIN_HEIGHT
} from '../../utils/staticData'
import SingleSlider from '../../Components/SingleSlider'
import SelectSliderComp from '../../Components/SelectSliderComp'
import fontFamily from '../../styles/fontFamily'
import { useSelector } from 'react-redux'
import { useTheme } from '../../theme/ThemeProvider'

const PreferencesScreen = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const { navigation } = props
  const fcmToken = useSelector(state => state?.authReducers?.token || null)

  const [isLoading, setLoading] = useState(false)
  const [bodyType, setBodyType] = useState([
    { name: BODY_TYPE[0] },
    { name: BODY_TYPE[1] },
    { name: BODY_TYPE[2] },
    { name: BODY_TYPE[3] },
    { name: BODY_TYPE[4] }
  ])
  const [maxHeight, setMaxHeight] = useState(4)
  const [bodyTypeValue, setBodyTypeValue] = useState({})
  const [educationValue, setEducationValue] = useState({})
  const [lookingForValue, setLookingForValue] = useState({})

  const [educationState, setEducationState] = useState([
    { name: EDUCATION[0] },
    { name: EDUCATION[1] },
    { name: EDUCATION[2] },
    { name: EDUCATION[3] },
    { name: EDUCATION[4] },
    { name: EDUCATION[5] },
    { name: EDUCATION[6] },
    { name: EDUCATION[7] },
    { name: EDUCATION[8] },
    { name: EDUCATION[9] }
  ])

  const [lookingFor, setLookingFor] = useState([
    { name: LOOKING_FOR[0] },
    { name: LOOKING_FOR[1] },
    { name: LOOKING_FOR[2] },
    { name: LOOKING_FOR[3] }
  ])

  const _onContinue = () => {
    if (!selectedItem) {
      showError('Please select your preference')
      return
    }
    const prevData = {
      ...props?.route?.params?.prevData,
      preference: selectedItem

      // country: currCountry,
      // state: selectedState
    }

    _hitApi(prevData)

    // navigation.navigate(navigationString.SELECT_USER_TYPE, {
    //   prevData
    // })
  }

  const _hitApi = prevData => {
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
      user_type: 1,
      device_type: Platform.OS,
      device_token:fcmToken || '123456',
      bio: prevData?.bio || '',
      occupation: prevData?.occupation || '',
      gender:
        prevData?.gender.toLowerCase() === 'men'
          ? '2'
          : prevData?.gender.toLowerCase() === 'women'
            ? '1'
            : '3' || 2,
      body_type: prevData?.body_type,
      highest_education: prevData?.education,
      looking_for: prevData?.looking_for,
      height: String(prevData?.height),
      preference: prevData?.preference,
      having_kids: prevData?.having_kids,
      married_status : prevData?.married_status,
    }

    console.log(apiData, 'api data ========>>>')

    setLoading(true)
    createNewProfileApi(apiData)
      .then(res => {
        console.log(res, 'resresresresresres')
        _updateProfilePic(prevData)
        setLoading(false)
      })
      .catch(error => {
        console.log(error, 'errrrrrrrrrrr')
        setLoading(false)
        showError(ApiError(error))
      })
  }

  const _updateProfilePic = prevData => {
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

  const preferenceData = [
    { name: 'Body Type', image: imagesPath.bodyType },
    { name: 'Education', image: imagesPath.education },
    { name: 'Looking For', image: imagesPath.lookingFor },
    { name: 'Height', image: imagesPath.height }
  ]

  const [selectedItem, setSelectedItem] = useState()

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedItem(item?.name)}
        style={{
          borderWidth: selectedItem === item?.name ? 2 : 1,
          width: '48%',
          alignItems: 'center',
          borderRadius: 18,
          height: moderateScale(120),
          justifyContent: 'space-between',
          paddingVertical: moderateScale(20),
          borderColor:
            selectedItem === item?.name ? theme.colors.themecolor2 : theme.colors.darkBlack,
          backgroundColor: selectedItem !== item?.name ? theme.colors.white : theme.colors.themeOpacity
        }}>
        <Image
          source={item?.image}
          style={{
            height: 50,
            width: 50,
            resizeMode: 'contain',
            tintColor:
              selectedItem === item?.name
                ? theme.colors.themecolor2
                : theme.colors.black
          }}
        />
        <Text
          style={{
            ...commonStyles.font_12_medium,
            fontFamily:
              selectedItem === item?.name ? fontFamily.bold : fontFamily.medium,
            color:
              selectedItem === item?.name
                ? theme.colors.themecolor2
                : theme.colors.black
          }}>
          {item?.name}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <WrapperContainer paddingAvailable={false}>
      <View style={{ paddingHorizontal: moderateScale(16) }}>
        <HeaderComp
          onPressBack={() => navigation.goBack()}
          leftIcon={imagesPath.ic_back}
          onPressRightText={() =>
            navigation.navigate(navigationString.SETTINGSCREEN)
          }
        />
        <View style={{ marginHorizontal: moderateScale(10) }}>
          {/* <Text style={styles.headerText}>{strings.Location}</Text> */}
          <GradientText
            text={'Your Preference'}
            textStyle={styles.headerText}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0.5, y: 0.7 }}
          />
          <Text
            style={{
              ...commonStyles.font_14_medium,
              paddingVertical: moderateScale(4)
            }}>
            What is your highest preference for getting matches ?
          </Text>
        </View>
      </View>

      <FlatList
        data={preferenceData}
        renderItem={renderItem}
        numColumns={2}
        bounces={false}
        contentContainerStyle={{
          paddingHorizontal: moderateScale(20),
          paddingTop: moderateScale(20)
        }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View style={styles.btnView}>
        <ButtonComp
          onPressBtn={_onContinue}
          btnText={strings.continue}
          btnView={styles.continueView}
          btnStyle={{
            marginHorizontal: moderateScale(16)
          }}
        />
      </View>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles) => StyleSheet.create({
  continueView: {
    position: 'absolute'
  },
  headerText: {
    ...commonStyles.font_34_bold,
    marginTop: moderateScale(32)
  },
  btnStyle: {
    marginTop: moderateScale(48),
    marginHorizontal: moderateScale(4)
  },
  btnView: {
    flex: 1,
    marginBottom: moderateScale(110),
    justifyContent: 'flex-end'
  }
})

// make this component available to the app
export default PreferencesScreen
