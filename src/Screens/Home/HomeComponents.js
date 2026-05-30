import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import HomeButtons from '../../Components/HomeButtons'
import imagesPath from '../../constants/imagesPath'
import colors from '../../styles/colors'
import { moderateScale } from '../../styles/responsiveSize'
import { enableFreeze } from 'react-native-screens'
import { useTheme } from '../../theme/ThemeProvider'
enableFreeze()
const RenderJackQueenButtons = ({
  onPressJack,
  onPressQueen,
  onPressFriend
}) => {
  const {theme} = useTheme();

  return (
    <View style={styles.mainView}>
      <HomeButtons
        value={'No Thank You'}
        onPress={onPressJack}
        mainViewStyle={{ backgroundColor: theme.colors.themecolor2 }}
      />
      {/* <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPressFriend}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0.75, y: 0 }}
          colors={[colors.themecolor2, colors.pink_164]}
          style={{
            marginTop: moderateScale(90),
            height: moderateScale(90),
            paddingHorizontal: moderateScale(4),
            width: moderateScale(90),
            borderRadius: moderateScale(45),
            backgroundcolor: colors.white,
            alignItems: 'center',
            borderWidth: 0.4,
            borderColor: colors.grey_187_1,
            justifyContent: 'center'
          }}
        >
          <Text style={{
            ...commonStyles.font_12_bold,
            color: colors.black,
            textAlign: 'center'
          }}>
            {"Let's be friends"}
          </Text>
        </LinearGradient>
      </TouchableOpacity> */}

      <HomeButtons
        value={"Let's Match"}
        onPress={onPressQueen}
        mainViewStyle={{ backgroundColor: theme.colors.pink_164 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  mainView: {
    alignItems: 'center',
    flex: 0.4,
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
})

export default React.memo(RenderJackQueenButtons)
