// import liraries
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import imagesPath from '../constants/imagesPath';
import colors from '../styles/colors';
import fontFamily from '../styles/fontFamily';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../styles/responsiveSize';
import GradientText from './GradientText';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

// create a component
const HeaderComp = ({
  viewStyle,
  navigation,
  SubText,
  rightIcon,
  leftIcon,
  leftIconStyle,
  textName,
  rightText = '',
  leftText,
  leftTextSyle,
  leftTextViewStyle,
  onPressRightIcon,
  imgStyle,
  onPressBack = () => {},
  onPressRightText = () => {},
  onPressOnline,
  leftImageStyle,
  leftBackTxt,
  centerText,
  centertextstyle,
  centerImage,
  righttxtstyle,
  showBackButton = true,
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  return (
    <View style={{...styles.viewStyle, ...viewStyle}}>
      {leftIcon ? (
        <View style={{flex: 0.5, flexDirection: 'row', alignItems: 'center'}}>
          {showBackButton && (
            <TouchableOpacity
              onPress={onPressBack}
              style={{...styles.boxView, ...leftIconStyle}}
              activeOpacity={0.9}>
              <Image
                style={{
                  height: moderateScale(18),
                  width: moderateScale(18),
                  tintColor: theme.colors.black,
                  ...leftImageStyle,
                }}
                source={leftIcon}
              />
            </TouchableOpacity>
          )}

          {leftBackTxt && (
            <GradientText
              text={leftBackTxt}
              textStyle={styles.leftBackTxt}
              start={{x: 0, y: 0.7}}
              end={{x: 0.7, y: 0.8}}
            />
          )}
        </View>
      ) : (
        <View style={{flex: 0.5, ...leftTextViewStyle}}>
          {/* <Text style={{ ...styles.leftText, ...leftTextSyle }}>{leftText}</Text> */}
          <GradientText
            text={leftText}
            textStyle={styles.leftText}
            start={{x: 0, y: 0.7}}
            end={{x: 0.7, y: 0.8}}
          />
        </View>
      )}
      {SubText ? (
        <View style={{flex: 2, flexDirection: 'row'}}>
          <TouchableOpacity onPress={onPressOnline}>
            <Image
              source={imagesPath.snap1}
              style={{
                backgroundColor: 'grey',
                height: moderateScale(48),
                width: moderateScale(48),
                borderRadius: moderateScale(29),
              }}
            />
          </TouchableOpacity>
          <View
            style={{
              marginLeft: moderateScaleVertical(10),
              justifyContent: 'center',
            }}>
            <Text
              style={{
                ...commonStyles.font_14_SemiBold,
              }}>
              {SubText}
            </Text>
            <Text style={{color: 'grey'}}>Online</Text>
          </View>
        </View>
      ) : null}

      {centerText ? (
        <View>
          <Text style={{...commonStyles.font_16_SemiBold, ...centertextstyle}}>
            {centerText}
          </Text>
        </View>
      ) : null}

      {textName ? (
        <View style={styles.txtStyle}>
          <Image source={centerImage || imagesPath.bonkers_text} />
          {/* <Text style={{ fontWeight: '700', fontSize: textScale(24) }}>
            Discover
          </Text> */}
          <Text
            style={{
              ...commonStyles.font_12_medium,
              marginTop: moderateScale(4),
            }}>
            {textName}
          </Text>
        </View>
      ) : null}

      {rightIcon ? (
        <View style={{flex: 0.5, alignItems: 'flex-end'}}>
          <TouchableOpacity onPress={onPressRightIcon} style={styles.boxView}>
            <Image
              style={{
                // height: moderateScale(24),
                // width: moderateScale(24),
                ...imgStyle,
              }}
              source={rightIcon}
            />
          </TouchableOpacity>
        </View>
      ) : null}
      {rightText && (
        <TouchableOpacity
          onPress={onPressRightText}
          style={{
            flex: 0.5,
            alignItems: 'flex-end',
          }}>
          <Text style={{...commonStyles.font_16_SemiBold, ...righttxtstyle}}>
            {rightText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const getStyles= (theme, commonStyles) => StyleSheet.create({
  viewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxView: {
    borderColor: theme.colors.black,
    borderWidth: moderateScale(1),
    height: moderateScale(48),
    width: moderateScale(48),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtStyle: {
    flex: 0.9,
    flexDirection: 'column',
    alignItems: 'center',
  },
  leftText: {
    ...commonStyles.font_28_bold,
    color: theme.colors.black,
    
  },
  leftBackTxt: {
    marginLeft: moderateScale(13),
    ...commonStyles.font_16_SemiBold,
    color: theme.colors.black,
  },
});
export default HeaderComp;
