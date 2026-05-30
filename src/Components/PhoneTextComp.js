import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import strings from '../constants/Languages'
import colors from '../styles/colors'
import { moderateScale } from '../styles/responsiveSize'
import CountryCodePicker from './CountryCodePicker'
import { useTheme } from '../theme/ThemeProvider'
import { getCommonStyles } from '../styles/commonStyles'

const PhoneTextComp = ({
  countryCode,
  countryFlag,
  phoneNumberVal,

  setCountryCode,
  setCountryFlag,
  onChangeText,
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles  = getStyles(theme, commonStyles)
  const _setCountryCode = (event) => {
    setCountryCode(event)
  }

  const _setCountryFlag = (event) => {
    setCountryFlag(event)
  }

  return (
        <View style={styles.inputStyle}>
            <Text style={styles.textStyle}>{strings.PhoneNumber}</Text>
            <CountryCodePicker
                countryCode={countryCode}
                countryFlag={countryFlag}
                setCountryCode={_setCountryCode}
                setCountryFlag={_setCountryFlag}
            />
            <TextInput
                placeholder={strings.enterPhoneNo}
                inputText={strings.PhoneNumber}
                placeholderTextColor={theme.colors.blackOpacity50}
                keyboardType="numeric"
                value={phoneNumberVal}
                maxLength={10}
                onChangeText={onChangeText}
                style={{
                  ...commonStyles.font_14_regular,
                  flex: 1,
                  padding: moderateScale(8),
                  color: theme.colors.black
                }}
            />
        </View>
  )
}

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  inputStyle: {
    borderWidth: moderateScale(1),
    height: moderateScale(60),
    width: '100%',
    borderRadius: moderateScale(10),
    borderColor: theme.colors.inputGray,
    marginTop: moderateScale(24),
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textStyle: {
    ...commonStyles.font_14_regular,
    position: 'absolute',
    top: moderateScale(-16),
    left: moderateScale(24),
    padding: moderateScale(6),
    color: theme.colors.blackOpacity50,
    backgroundColor: theme.colors.white
  }
})

export default React.memo(PhoneTextComp)
