import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native'
import React from 'react'
import imagesPath from '../../constants/imagesPath'
import {
  height,
  moderateScale,
  verticalScale,
  width
} from '../../styles/responsiveSize'
import colors from '../../styles/colors'
import ButtonComp from '../../Components/ButtonComp'
import navigationString from '../../constants/navigationString'
import { useNavigation } from '@react-navigation/native'
import strings from '../../constants/Languages'
import { saveOnBoardData } from '../../redux/reduxActions/authActions'
import { ImageEnum } from '../../constants'
import { useTheme } from '../../theme/ThemeProvider'
import { getCommonStyles } from '../../styles/commonStyles'

export default function WelcomeScreen () {
  const navigation = useNavigation()
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = welComeStyles(theme, commonStyles);
  const onContinueBtnPress = () => {
    saveOnBoardData(false)
    navigation.navigate(navigationString.ONBOARDING_SCREEN)
  }
  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={imagesPath.Welcome_image}
        imageStyle={styles.imgBgStyle}
        style={styles.upperContainer}
      />
      <View
        style={styles.bottomContainer}>
        <Text style={styles.mainText}>{strings.Welcome} </Text>
        <Text style={styles.mainText}>{strings.toBonkers}</Text>
          <Text style={styles.subTitleTxt}>
            {strings.welcomeScreenSubtitle}
          </Text>
        <View style={styles.btnStyle}>
          <ButtonComp
            btnText={strings.continue}
            btnView={styles.btnContainer}
            txtStyle={styles.btnTxtColor}
            onPressBtn={onContinueBtnPress}
          />
        </View>
      </View>
    </View>
  )
}

const welComeStyles = (theme, commonStyles) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.greenTheme
  },
  upperContainer: {
    flex: 6,
  },
  bottomContainer:{
    flex: 4,
    marginTop: verticalScale(12),
    marginHorizontal: verticalScale(24)
  },
  imgBgStyle: {
    height,
    width,
    resizeMode: ImageEnum.cover
  },
  mainText: {
    ...commonStyles.font_34_bold,
    color: theme.colors.primaryTxt
  },
  subTitleTxt:{
    marginTop: verticalScale(14),
    ...commonStyles.font_14_medium,
    color: theme.colors.primaryWhite
  },
  btnStyle: {
    marginTop: moderateScale(50),
  },
  btnTxtColor:{
    color: theme.colors.limaGreen
  },
  btnContainer:{
    backgroundColor: theme.colors.primaryWhite 
  }
})
