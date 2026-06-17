import { StyleSheet, View, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

import HeaderComp from '../../Components/HeaderComp'
import imagesPath from '../../constants/imagesPath'
import { height, moderateScale, width } from '../../styles/responsiveSize'
import strings from '../../constants/Languages'
import { getCommonStyles } from '../../styles/commonStyles'
import ButtonComp from '../../Components/ButtonComp'
import WrapperContainer from '../../Components/WrapperContainer'
import GradientText from '../../Components/GradientText'
import { useSelector } from 'react-redux'
import RNFetchBlob from 'rn-fetch-blob'
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions'
import { getItem, getUserData, setItem, setUserData } from '../../utils/utils'
import { Loader } from '../../Components/Loader'
import { getUserProfile } from '../../redux/reduxActions/authActions'
import { saveUserDataToStore, setBonkFiltersApi, setBonkersFiltersApi } from '../../redux/reduxActions/homeActions'
import { useTheme } from '../../theme/ThemeProvider'
import { buildDefaultFilterFormData } from '../../utils/defaultProfileFilters'

import { isUserProfileComplete } from '../../utils/profileCompletion'

const isProfileReadyForDashboard = isUserProfileComplete

export default function SetupCompleted () {
  const { theme, isDark } = useTheme()
  const commonStyles = getCommonStyles(theme)
  const styles = getStyles(theme, commonStyles, isDark)
  const userData = useSelector(state => state?.authReducers?.userData || {})
  const coordinates = useSelector(state => state?.authReducers?.coordinates || {})

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
    if (base64Image != null) {
      setLoading(false)
      return
    }

    if (!userData?.profile_image) {
      setLoading(false)
      return
    }

    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', userData.profile_image)
      .then(resp => {
        imagePath = resp.path()
        setLoading(false)
        return resp.readFile('base64')
      })
      .then(base64Data => {
        setLoading(false)
        setItem('PROFILE_BASE_64', base64Data)
        return fs.unlink(imagePath)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const _ensureProfileComplete = async cachedUserData => {
    const profileRes = await getUserProfile()
    const refreshedUser = profileRes?.data || (await getUserData())

    if (isProfileReadyForDashboard(refreshedUser)) {
      return refreshedUser
    }

    const mergedUser = {
      ...cachedUserData,
      ...refreshedUser,
      token: cachedUserData?.token || refreshedUser?.token,
      photos: refreshedUser?.photos?.length
        ? refreshedUser.photos
        : cachedUserData?.photos,
      filters:
        refreshedUser?.filters ||
        cachedUserData?.filters ||
        (cachedUserData?.photos?.length ? {} : null),
    }

    await setUserData(mergedUser)
    saveUserDataToStore(mergedUser)
    return mergedUser
  }

  const start = async () => {
    setLoading(true)

    try {
      const cachedUser = await getUserData()
      const defaultFilters = buildDefaultFilterFormData(cachedUser, coordinates)
      const setFiltersApi =
        cachedUser?.user_type === 1 ? setBonkersFiltersApi : setBonkFiltersApi

      try {
        await setFiltersApi(defaultFilters)
      } catch (filterError) {
        console.log(filterError, 'default filter API failed, refreshing profile')
      }

      const finalUser = await _ensureProfileComplete(cachedUser)

      if (!isProfileReadyForDashboard(finalUser)) {
        showError(
          'Profile setup is incomplete. Please add photos and try again.',
        )
        setLoading(false)
        return
      }

      setLoading(false)
      showSuccess(strings.You_are_signed_up)
    } catch (err) {
      console.log(err)
      showError(ApiError(err))
      setLoading(false)
    }
  }

  return (
    <WrapperContainer isSafeAreaAvailable>
      <HeaderComp />
      <View style={{ flex: 0.96, marginTop: moderateScale(24) }}>
        <View style={{ paddingTop: moderateScale(10) }} />
        <View style={{ paddingTop: moderateScale(12) }} />
        <View style={styles.imagestyle}>
          <Image
            source={imagesPath.congrats1}
            style={{ height: height / 6, width: width / 2.6 }}
          />
          <GradientText
            text={strings.Congratulations}
            textStyle={styles.mainText}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 0.7, y: 0.8 }}
          />
          <GradientText
            text={strings.You_are_signed_up}
            textStyle={{
              ...commonStyles.font_16_medium,
              marginTop: moderateScale(12),
            }}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 0.7, y: 0.8 }}
          />
        </View>
      </View>

      <View>
        <ButtonComp
          btnText={
            strings.startencounter + `${timer == 0 ? '' : ' in ' + timer}`
          }
          onPressBtn={start}
          disabled={timer != 0}
          btnView={{
            backgroundColor:
              timer != 0 ? theme.colors.grey_187_1 : theme.colors.themecolor2,
          }}
        />
      </View>

      <Loader isLoading={isLoading} />
    </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    mainText: {
      ...commonStyles.font_34_bold,
      color: isDark ? theme.colors.blackOpacity80 : theme.colors.themecolor2,
    },
    imagestyle: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
