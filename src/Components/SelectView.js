import React from 'react'
import { Image, Text, TouchableOpacity } from 'react-native'

import imagesPath from '../constants/imagesPath'
import colors from '../styles/colors'
import { moderateScale } from '../styles/responsiveSize'
import { useTheme } from '../theme/ThemeProvider'
import { getCommonStyles } from '../styles/commonStyles'

const SelectView = ({
  isSelected,
  onPress,
  textColor,
  label,
  iconStyle,
  rightIcon
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  return (
        <TouchableOpacity
            style={{
              backgroundColor: isSelected ? theme.colors.themecolor2 : theme.colors.white,
              borderWidth: moderateScale(1),
              borderColor: theme.colors.grey_234_1,
              paddingHorizontal: moderateScale(20),
              paddingVertical: moderateScale(16),
              borderRadius: moderateScale(16),
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: moderateScale(12),
              height: moderateScale(58)
            }}
            onPress={onPress}
            activeOpacity={1}
        >
            <Text style={{
              ...commonStyles.font_16_medium,
              color: isSelected ? theme.colors.white : theme.colors.black,
              ...textColor
            }}>{label}</Text>

            <Image source={rightIcon || imagesPath.ic_greenTick}
                style={{
                  tintColor: isSelected ? theme.colors.white : theme.colors.themecolor2,
                  ...iconStyle
                }}
            />
        </TouchableOpacity>
  )
}
export default React.memo(SelectView)
