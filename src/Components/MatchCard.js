// import liraries
import { BlurView } from '@react-native-community/blur'
import React, { Component, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform
} from 'react-native'
import FastImage from '../utils/FastImageCompat'
import { useSelector } from 'react-redux'
import imagesPath from '../constants/imagesPath'
import colors from '../styles/colors'
import { getCommonStyles, hitSlopProp } from '../styles/commonStyles'
import { moderateScale, textScale } from '../styles/responsiveSize'
import { useTheme } from '../theme/ThemeProvider'

// create a component
const MatchCard = ({
  onPressCancel = () => { },
  onPressMessage = () => { },
  mainContainer = {},
  itemData,
  name,
  age,
  pic,
  isFav,
  onPressCard,
  from
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme)
  const userDataRef = useRef()
  const userData = useSelector(state => state?.authReducers?.userData, (_, b) => {
    userDataRef.current = b
    return true
  })

  return (
    <TouchableOpacity style={{ ...styles.container, ...mainContainer }}
      onPress={onPressCard}
      activeOpacity={0.8}
    >
      <FastImage
        style={{ ...styles.imgStyle }}
        source={
          pic ? { uri: pic } : imagesPath.snap2
        }
      />
      <View style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: theme.colors.blackOpacity70, paddingTop: moderateScale(3) }}>
        <Text
          style={{
            ...commonStyles.font_16_bold,
            marginBottom: moderateScale(8),
            marginStart: moderateScale(16),
            color: theme.colors.white,
            textTransform: 'capitalize'
          }}
          numberOfLines={2}
        >
          {name + age}
        </Text>
        {Platform.OS === 'ios'
          ? (
            <View
              style={{ ...styles.blurView }}>
                <>
                <TouchableOpacity
                style={styles.btnStyle}
                hitSlop={hitSlopProp}
                onPress={onPressCancel}>
                <Image source={imagesPath.ic_whiteCross} />
              </TouchableOpacity>

              <View style={styles.lineStyle} />
                </>

              <TouchableOpacity
                style={styles.btnStyle}
                hitSlop={hitSlopProp}
                onPress={onPressMessage}>

                <Image source={
                  userData?.user_type === 1
                    ? itemData?.status === 1 ? imagesPath.ic_white_heart : imagesPath.ic_whiteMsg
                    : from === '_MY_FAVOURITES'
                      ? isFav === 1 ? imagesPath.ic_whiteMsg : imagesPath.ic_white_heart
                      : imagesPath.ic_white_heart
                }
                  style={{
                    height: moderateScale(18),
                    width: moderateScale(18),
                    tintColor: userData?.user_type === 2 && (from === '_BONK_HOME' && isFav === 1 ? colors.red : null)
                  }}
                  resizeMode={'contain'}
                />
              </TouchableOpacity>
            </View>
            )
          : (
            <View
              style={{ ...styles.blurView }}>
              <TouchableOpacity
                style={styles.btnStyle}
                hitSlop={hitSlopProp}
                onPress={onPressCancel}>
                <Image source={imagesPath.ic_whiteCross} />
              </TouchableOpacity>
              <View style={styles.lineStyle} />

              <TouchableOpacity
                style={styles.btnStyle}
                hitSlop={hitSlopProp}
                onPress={onPressMessage}>
                <Image source={
                  userData?.user_type === 1
                    ? itemData?.status === 1 ? imagesPath.ic_white_heart : imagesPath.ic_whiteMsg
                    : from === '_MY_FAVOURITES'
                      ? isFav === 1 ? imagesPath.ic_whiteMsg : imagesPath.ic_white_heart
                      : imagesPath.ic_white_heart
                }
                  style={{
                    height: moderateScale(18),
                    width: moderateScale(18),
                    tintColor: userData?.user_type === 2 && (from === '_BONK_HOME' && isFav === 1 ? theme.colors.red : null)
                  }}
                  resizeMode={'contain'}
                />
              </TouchableOpacity>
            </View>
            )}
      </View>
    </TouchableOpacity>
  )
}

// define your styles
const getStyles = (theme) => StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: moderateScale(16),
    height: moderateScale(200),
    backgroundColor: theme.colors.blackOpacity20
  },
  blurView: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: moderateScale(10),
    ...(Platform.OS === 'android' && { backgroundcolor: theme.colors.blackOpacity40 })
  },
  ridesFriends: {
    paddingTop: moderateScale(8),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    borderColor: theme.colors.white
  },
  btnStyle: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imgStyle: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
    backgroundcolor: theme.colors.blackOpacity40
  },
  lineStyle: {
    width: moderateScale(2),
    backgroundColor: theme.colors.white
  }
})

export default React.memo(MatchCard)
