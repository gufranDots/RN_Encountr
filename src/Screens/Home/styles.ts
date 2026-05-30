import { Platform, StyleSheet } from 'react-native';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
  width,
} from '../../styles/responsiveSize';
import colors from '../../styles/colors';
import { getCommonStyles } from '../../styles/commonStyles';
import fontFamily from '../../styles/fontFamily';
import { lightTheme } from '../../theme';

export const getStyles = (theme: any, commonStyles: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: moderateScale(22),
      // backgroundColor:"red"
      // justifyContent: 'space-between',
    },
    swiperContainer: {
      height: height / 1.5,
      marginTop: moderateScale(-16),
      zIndex: -10,
      // backgroundColor: 'red'
    },
    buttonsContainer: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: '22%',
    },
    copyright: {
      textAlign: 'center',
      fontSize: 10,
      color: 'black',
      paddingBottom: 20,
      fontFamily: 'Avenir',
    },
    overlayWrapper: {
      // flexDirection: 'column',
      // alignItems: 'flex-end',
      // justifyContent: 'flex-start',
      // marginTop: 30,
      // marginLeft: -30,
    },
    imgStyle: {
      width: moderateScale(296),
      height: moderateScale(450),
      borderRadius: moderateScale(16),
      alignSelf: 'center',
    },
    blurView: {
      position: 'absolute',
      backgroundColor: theme?.colors?.blackOpacity60 ?? colors.blackOpacity60,
      bottom: 0,
      width: moderateScale(296),
      borderBottomEndRadius: moderateScale(16),
      borderBottomStartRadius: moderateScale(16),
      padding: moderateScale(16),
    },
    circleView: {
      flex: 0.3,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'flex-end',
      marginTop: moderateScale(40),
    },
    circleStyle: {
      height: moderateScale(70),
      width: moderateScale(70),
      backgroundColor: theme?.colors?.lightPink ?? colors.lightPink,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: moderateScale(37),
    },
    bottomSheetView: {
      flex: 1,
      backgroundColor: 'pink',
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
    },
    textStyle: {
      ...commonStyles.font_24_bold,
    },
    switchView: {
      height: moderateScale(58),
      borderWidth: 0.2,
      borderRadius: moderateScale(15),
      marginTop: moderateScale(20),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    slider: {
      height: 45,
      width: '80%',
    },
    thirdView: {
      height: moderateScale(58),
      borderWidth: 0.5,
      borderTopRightRadius: moderateScale(15),
      borderBottomRightRadius: moderateScale(15),
      width: moderateScale(104),
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.gray4,
    },
    secView: {
      height: moderateScale(58),
      borderWidth: 0.5,
      width: moderateScale(104),
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.gray4,
    },
    firstView: {
      height: moderateScale(58),
      // backgroundColor: index == 1 ? colors.black : colors.white,
      borderWidth: 0.5,
      borderTopLeftRadius: moderateScale(15),
      borderBottomLeftRadius: moderateScale(15),
      width: moderateScale(104),
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.gray4,
    },
    viewStyle: {
      paddingHorizontal: moderateScale(10),
      flex: 1,
    },
    filterView: {
      alignItems: 'center',
      marginTop: moderateScale(22),
    },
    clearView: {
      position: 'absolute',
      right: moderateScale(40),
      top: moderateScale(30),
    },
    txtStyle: {
      ...commonStyles.font_16_SemiBold,
    },
    textView: {
      ...commonStyles.font_16_bold,
      marginTop: moderateScale(16),
    },
    modalStyle: {
      margin: 0,
    },
    modalMainContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme?.colors?.white,
    },
    modalContainer: {
      borderTopLeftRadius: moderateScale(24),
      borderTopRightRadius: moderateScale(24),
      // paddingHorizontal: moderateScale(30),
      paddingTop: moderateScale(32),
      paddingBottom: moderateScale(40),
      // height: height / 1.1,
      backgroundColor: theme?.colors?.white,
    },
    modalHeight: {
      height: height / 1.08,
      paddingTop: Platform.OS === 'ios' ? 0 : moderateScale(20),
    },
    headerView: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(10),
      justifyContent: 'space-between',
      marginHorizontal: moderateScale(20),
    },
    headerTextView: {
      flex: 1,
      alignItems: 'center',
    },
    rewindBtn: {
      backgroundColor: '#6E6E6E',
      height: moderateScale(64),
      width: moderateScale(64),
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    boomMain: {
      backgroundColor: theme?.colors?.white ?? colors.white,
      borderTopLeftRadius: moderateScale(24),
      borderTopRightRadius: moderateScale(24),
    },
    boomTxt: {
      fontSize: textScale(24),
      alignSelf: 'center',
      color: theme?.colors?.black ?? colors.black,
      fontFamily: fontFamily.bold,
      textTransform: 'capitalize',
      bottom: 10,
    },
    beSeenByMorePeople: {
      fontSize: textScale(14),
      alignSelf: 'center',
      textAlign: 'center',
      color: theme?.colors?.black ?? colors.black,
      fontFamily: fontFamily.bold,
      marginHorizontal: moderateScale(30),
    },
    learnMore: {
      fontSize: textScale(14),
      alignSelf: 'center',
      textAlign: 'center',
      color: theme?.colors?.themecolor2 ?? colors.themecolor2,
      fontFamily: fontFamily.bold,
      marginTop: moderateScaleVertical(4),
    },
    pricingView: {
      marginHorizontal: moderateScale(20),
      height: moderateScaleVertical(54),
      borderColor: theme?.colors?.themecolor2 ?? colors.themecolor2,
      borderWidth: 1.6,
      borderRadius: moderateScale(8),
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateScaleVertical(16),
    },
    timing: {
      fontSize: textScale(14),
      color: theme?.colors?.darkBlack ?? colors.darkBlack,
      marginLeft: moderateScale(20),
    },
    pricetxtview: {
      flexDirection: 'row',
      flex: 0.6,
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginRight: moderateScale(20),
    },
    pricetxt: {
      marginLeft: moderateScale(16),
      fontSize: textScale(16),
      color: theme?.colors?.darkBlack ?? colors.darkBlack,
      fontFamily: fontFamily.SemiBold,
    },
    seperationView: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: moderateScale(20),
    },
    unlimitedbtnview: {
      borderRadius: moderateScale(40),
      justifyContent: 'center',
      backgroundColor: theme?.colors?.white ?? colors.white,
      borderColor: theme?.colors?.themecolor2 ?? colors.themecolor2,
      borderWidth: 1.6,
    },
    btnstyle: {
      borderRadius: moderateScale(40),
      width: width - 40,
      alignSelf: 'center',
      marginTop: moderateScaleVertical(24),
      marginBottom: moderateScaleVertical(34),
    },
  });

const styles = getStyles(lightTheme, getCommonStyles(lightTheme));

export default styles;
