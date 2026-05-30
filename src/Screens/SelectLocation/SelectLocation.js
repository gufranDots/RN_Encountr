// import liraries
import React, { useLayoutEffect, useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'

import ButtonComp from '../../Components/ButtonComp'
import DropDownComp from '../../Components/DropDownComp'
import GradientText from '../../Components/GradientText'
import HeaderComp from '../../Components/HeaderComp'
import { Loader } from '../../Components/Loader'
import WrapperContainer from '../../Components/WrapperContainer'
import { CountriesAndStates } from '../../constants/CountriesAndStates'

import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import { moderateScale } from '../../styles/responsiveSize'
import { ApiError, showError } from '../../utils/helperFunctions'
import { createNewProfileApi } from '../../redux/reduxActions/authActions'
import { setItem } from '../../utils/utils'
import { uploadProfilePicApi } from '../../redux/reduxActions/homeActions'
import { enableFreeze } from 'react-native-screens'
import { getCommonStyles } from '../SubscriptionScreen/styles'
import { useTheme } from '../../theme/ThemeProvider'

enableFreeze()
const SelectLocation = props => {
  const { navigation } = props
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);

  const [isLoading, setLoading] = useState(false)
  const [allCountries, setAllCountries] = useState(CountriesAndStates || [])
  const [currCountry, setcurrCountry] = useState('')
  const [currentCountryStates, setSelectedCountryStates] = useState([])
  const [selectedState, setSelectedState] = useState('')

  useLayoutEffect(() => {
    setAllCountries(CountriesAndStates)
  }, [])

  const onPressItem = (item, name) => {
    setcurrCountry(item?.name)
    setSelectedCountryStates(item?.states)
  }

  const fetchStates = item => {
    setcurrCountry(item?.name)
  }

  const _onContinue = () => {
    if (currCountry === '') {
      return showError(strings.pleaseSelectYourCountryAndState)
    } else if (selectedState === '') {
      return showError(strings.pleaseSelectYourState)
    }

    const prevData = {
      ...props?.route?.params?.prevData,
      country: currCountry,
      state: selectedState
    }

    navigation.navigate(navigationString.ADDITIONAL_DETAILS, { prevData })

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
      device_token: '12345',
      bio: prevData?.bio || '',
      occupation: prevData?.occupation || '',
      gender:
        prevData?.gender.toLowerCase() === 'men'
          ? '2'
          : prevData?.gender.toLowerCase() === 'women'
            ? '1'
            : '3' || 2
    }

    setLoading(true)
    createNewProfileApi(apiData)
      .then(res => {
        console.log(res, 'resresresresresres')
        _updateProfilePic(prevData)
        setLoading(false)
      })
      .catch(error => {
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

  return (
    <WrapperContainer>
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
          text={strings.Location}
          textStyle={styles.headerText}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.5, y: 0.7 }}
        />
      </View>

      <View style={styles.btnStyle}>
        <DropDownComp
          label={strings.country}
          fetchData={fetchStates}
          value={currCountry}
          dropDownData={allCountries}
          centerText={strings.selectYourCountry}
          onPressItem={(item, name) => onPressItem(item, name)}
          name={strings.countries}
          placeholder={strings.selectYourCountry}
        />
        <DropDownComp
          label={strings.state}
          value={selectedState}
          dropDownData={currentCountryStates}
          centerText={strings.selectYourState}
          onPressItem={(item, name) => setSelectedState(item?.name)}
          name={strings.state}
          placeholder={strings.selectYourState}
        />
      </View>
      <View style={styles.btnView}>
        <ButtonComp
          onPressBtn={_onContinue}
          btnText={strings.continue}
          btnView={styles.continueView}
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
export default SelectLocation
