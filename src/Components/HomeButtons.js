import React from 'react'
import {
  Text,
  TouchableOpacity,
  Image
} from 'react-native'
import colors from '../styles/colors'
import { moderateScale } from '../styles/responsiveSize'
import { useTheme } from '../theme/ThemeProvider'
import { getCommonStyles } from '../styles/commonStyles'

const HomeButtons = ({
  onPress,
  pic,
  mainViewStyle,
  value
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        height: moderateScale(90),
        paddingHorizontal: moderateScale(4),
        width: moderateScale(90),
        borderRadius: moderateScale(45),
        backgroundcolor: theme.colors.black,
        alignItems: 'center',
        borderColor: theme.colors.grey_187_1,
        justifyContent: 'center',
        ...mainViewStyle
      }}
      onPress={onPress}
    >
      <Text style={{
        ...commonStyles.font_12_bold,
        color: theme.colors.black,
        textAlign: 'center'
      }}>{value}</Text>
      {/* <Image
                source={pic}
            /> */}
    </TouchableOpacity>
  )
}
export default HomeButtons
