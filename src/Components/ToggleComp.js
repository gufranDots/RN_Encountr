import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import imagesPath from '../constants/imagesPath'
import colors from '../styles/colors'
import { getCommonStyles, hitSlopProp } from '../styles/commonStyles'
import { moderateScale } from '../styles/responsiveSize'

const ToggleComp = ({
  toggleText,
  mainContainerStyle,
  toggleValue = false,
  setToggleValueFromChild = () => { }
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  return (
    <View style={{ ...styles.mainContainer, ...mainContainerStyle }}>
      <Text style={{ ...commonStyles.font_14_bold, color: theme.colors.themecolor2 }}>{toggleText}</Text>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          width: moderateScale(44),
          height: moderateScale(30)
        }}
        hitSlop={hitSlopProp}
        onPress={() => setToggleValueFromChild(!toggleValue)}>
        <Image
          source={
            toggleValue ? imagesPath.ic_toggle_on : imagesPath.ic_toggle_off
          }
          style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
        />
      </TouchableOpacity>
    </View>
  )
}

export default React.memo(ToggleComp)

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: moderateScale(20),
    alignItems: 'center'
  }
})
