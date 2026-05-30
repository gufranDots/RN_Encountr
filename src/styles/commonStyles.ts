import {StyleSheet} from 'react-native';
import colors from './colors';
import fontFamily from './fontFamily';
import {moderateScale, scale, textScale} from './responsiveSize';
import { ImageEnum } from '../constants';

export const hitSlopProp = {
  top: 16,
  right: 16,
  left: 16,
  bottom: 16,
};
export const getCommonStyles = (theme: any) => StyleSheet.create({
  // 8
  font_8_regular: {
    fontSize: textScale(8),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_8_medium: {
    fontSize: textScale(8),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_8_bold: {
    fontSize: textScale(8),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_8_SemiBold: {
    fontSize: textScale(8),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_8_extraLight: {
    fontSize: textScale(8),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 10
  font_10_regular: {
    fontSize: textScale(10),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_10_medium: {
    fontSize: textScale(10),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_10_bold: {
    fontSize: textScale(10),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_10_SemiBold: {
    fontSize: textScale(10),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_10_extraLight: {
    fontSize: textScale(10),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 12
  font_12_regular: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_12_medium: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_13_medium: {
    fontSize: textScale(13),
    fontFamily: fontFamily.medium,
    color: theme.colors.white,
    textAlign: 'left',
  },
  font_12_bold: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_12_SemiBold: {
    fontSize: textScale(12),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_12_extraLight: {
    fontSize: textScale(12),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 14
  font_14_regular: {
    fontSize: textScale(14),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_14_medium: {
    fontSize: textScale(14),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_14_bold: {
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_14_SemiBold: {
    fontSize: textScale(14),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_14_extraLight: {
    fontSize: textScale(14),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 16
  font_16_regular: {
    fontSize: textScale(16),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_16_medium: {
    fontSize: textScale(16),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_16_bold: {
    fontSize: textScale(16),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_16_SemiBold: {
    fontSize: textScale(16),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_16_extraLight: {
    fontSize: textScale(16),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 18
  font_18_regular: {
    fontSize: textScale(18),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_18_medium: {
    fontSize: textScale(18),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_18_bold: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_18_SemiBold: {
    fontSize: textScale(18),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_18_extraLight: {
    fontSize: textScale(18),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 20
  font_20_regular: {
    fontSize: textScale(20),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_20_medium: {
    fontSize: textScale(20),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_20_bold: {
    fontSize: textScale(20),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_20_SemiBold: {
    fontSize: textScale(20),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_20_extraLight: {
    fontSize: textScale(20),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 22
  font_22_regular: {
    fontSize: textScale(22),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_22_medium: {
    fontSize: textScale(22),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_22_bold: {
    fontSize: textScale(22),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_22_SemiBold: {
    fontSize: textScale(22),
    fontFamily: fontFamily.SemiBold,
    color: colors.darkBlack,
    textAlign: 'left',
  },
  font_22_extraLight: {
    fontSize: textScale(22),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 24
  font_24_regular: {
    fontSize: textScale(24),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_24_medium: {
    fontSize: textScale(24),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_24_bold: {
    fontSize: textScale(24),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_24_SemiBold: {
    fontSize: textScale(24),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_24_extraLight: {
    fontSize: textScale(24),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 26
  font_26_regular: {
    fontSize: textScale(26),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_26_medium: {
    fontSize: textScale(26),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_26_bold: {
    fontSize: textScale(26),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_26_SemiBold: {
    fontSize: textScale(26),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_26_extraLight: {
    fontSize: textScale(26),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
    // 28
    font_28_regular: {
      fontSize: textScale(28),
      fontFamily: fontFamily.regular,
      color: theme.colors.darkBlack,
      textAlign: 'left',
    },
    font_28_medium: {
      fontSize: textScale(28),
      fontFamily: fontFamily.medium,
      color: theme.colors.darkBlack,
      textAlign: 'left',
    },
    font_28_bold: {
      fontSize: textScale(28),
      fontFamily: fontFamily.bold,
      color: theme.colors.darkBlack,
      textAlign: 'left',
    },
    font_28_SemiBold: {
      fontSize: textScale(28),
      fontFamily: fontFamily.SemiBold,
      color: theme.colors.darkBlack,
      textAlign: 'left',
    },
    font_28_extraLight: {
      fontSize: textScale(28),
      fontFamily: fontFamily.extraLight,
      color: theme.colors.darkBlack,
      textAlign: 'left',
    },
  // 32
  font_32_regular: {
    fontSize: textScale(32),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_32_medium: {
    fontSize: textScale(32),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_32_bold: {
    fontSize: textScale(32),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_32_SemiBold: {
    fontSize: textScale(32),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_34_extraLight: {
    fontSize: textScale(34),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  // 34
  font_34_regular: {
    fontSize: textScale(34),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_34_medium: {
    fontSize: textScale(34),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_34_bold: {
    fontSize: textScale(34),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_34_SemiBold: {
    fontSize: textScale(34),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },

  // 38
  font_38_regular: {
    fontSize: textScale(38),
    fontFamily: fontFamily.regular,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_38_medium: {
    fontSize: textScale(38),
    fontFamily: fontFamily.medium,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_38_bold: {
    fontSize: textScale(38),
    fontFamily: fontFamily.bold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_38_SemiBold: {
    fontSize: textScale(38),
    fontFamily: fontFamily.SemiBold,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  font_38_extraLight: {
    fontSize: textScale(38),
    fontFamily: fontFamily.extraLight,
    color: theme.colors.darkBlack,
    textAlign: 'left',
  },
  shadowStyle: {
    // backgroundColor: theme.colors.darkBlack,
    // borderRadius: 8,
  shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 8,
    // borderColor: theme.colors.lightWhiteGrayColor,
    // borderWidth: 0.7,
  },
  listViewContainer:{
    flexGrow:1,
  },
  iconStyle48:{
    height: scale(48),
    width:scale(48),
    resizeMode: ImageEnum.contain
  },
  user26IconStyle:{
    height: scale(26),
    width:scale(26),
    resizeMode: ImageEnum.contain
  },
  iconStyle24:{
    height: scale(24),
    width:scale(24),
    resizeMode: ImageEnum.contain
  },
  iconStyle20:{
    height: scale(20),
    width:scale(20),
    resizeMode: ImageEnum.contain
  },
  iconStyle18:{
    height: scale(18),
    width:scale(18),
    resizeMode: ImageEnum.contain,
    marginRight:moderateScale(10)
  },
  iconStyle15:{
    height: scale(15),
    width:scale(15),
    resizeMode: ImageEnum.contain
  },
  iconStyle11:{
    height: scale(11),
    width:scale(11),
    resizeMode: ImageEnum.contain
  },
  iconStyle10:{
    height: scale(10),
    width:scale(10),
    resizeMode: ImageEnum.contain
  },
  iconStyle12:{
    height: scale(12),
    width:scale(12),
    resizeMode: ImageEnum.contain
  },
  iconStyle8:{
    height: scale(8),
    width:scale(8),
    resizeMode: ImageEnum.contain
  },
  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray2,
  },
  drawerRoundUserIcon: {
    height: scale(123),
    width: scale(123),
    borderRadius: moderateScale(123),
    resizeMode: ImageEnum.contain,
    alignSelf:'center'
  },
  rowCenterAligned: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordEyeIconStyle:{
    width:scale(21),
    height:scale(14),
    resizeMode:ImageEnum.contain
  }
});
