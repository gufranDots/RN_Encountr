import React from 'react'
import { Image, StyleSheet, View, Text } from 'react-native'

import CountryPicker, { DARK_THEME } from 'react-native-country-picker-modal'
import imagesPath from '../constants/imagesPath'

import colors from '../styles/colors'
import fontFamily from '../styles/fontFamily'
import { moderateScaleVertical, textScale } from '../styles/responsiveSize'
import { useTheme } from '../theme/ThemeProvider'

const CountryCodePicker = ({
  setCountryCode,
  setCountryFlag,
  countryCode,
  countryFlag
}) => {
  const {theme, isDark } = useTheme();
  const style = getStyles(theme);
  const onSelect = country => {
    console.log(country, 'lfklkkl')
    setCountryFlag(country.cca2)
    setCountryCode(country.callingCode[0])
  }

  return (
    <>
      <View style={style.countryview}>
        <CountryPicker
          onSelect={onSelect}
          visible={false}
          countryCode={countryFlag}
          withCallingCode={true}
          withCallingCodeButton={countryCode}
          withEmoji={true}
          withFilter
          withAlphaFilter
          theme={isDark ? DARK_THEME : null}
        />

        <Image source={imagesPath.ic_down} style={style.imgStyle} />
        <Text
          style={{
            fontSize: textScale(24),
            fontFamily: fontFamily.extraLight,
            color: colors.grey
          }}>
          {' '}
          |
        </Text>
      </View>
    </>
  )
}
const getStyles = (theme) => StyleSheet.create({
  countryview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imgStyle: {
    // height: moderateScale(width / 24),
    // width: moderateScale(width / 24),
    resizeMode: 'contain',
    marginLeft: moderateScaleVertical(5),
    tintColor: theme.colors.white
  }
})

export default React.memo(CountryCodePicker)
