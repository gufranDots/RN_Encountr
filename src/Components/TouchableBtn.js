// import liraries
import React, {Component} from 'react';
import {TouchableOpacity, View, Text, StyleSheet, Image} from 'react-native';
import colors from '../styles/colors';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../styles/responsiveSize';
import { getCommonStyles } from '../styles/commonStyles';
import {useTheme} from '../theme/ThemeProvider'

// create a component
const TouchableBtn = ({
  text,
  txtStyle,
  onPressBtn,
  mainContStyle,
  imagesrc,
  iconStyle,
  rightimg,
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  return (
    <TouchableOpacity
      onPress={onPressBtn}
      style={{...styles.container, ...mainContStyle}}
      activeOpacity={0.9}>
      <View
        style={{
          flex: 1,
          height: moderateScale(58),
          alignItems: 'center',
          // padding: moderateScale(16),
          flexDirection: 'row',
          backgroundColor: theme.colors.lightGray,
        }}>
        <Image
          source={imagesrc}
          style={{
            marginRight: moderateScale(15),
            tintColor: theme.colors.black,
            ...iconStyle,
          }}
        />
        <Text style={{...styles.txtStyle, ...txtStyle}}>{text}</Text>
      </View>
      {rightimg ? (
        <View style={{flex: 0.1, alignItems: 'flex-end'}}>
          <Image
            source={rightimg}
            style={{
              tintColor: theme.colors.black,
              marginTop: moderateScaleVertical(10),
              marginRight:moderateScale(6)
            }}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  container: {
    // borderColor: colors.likePink,
    borderRadius: moderateScale(10),
    // borderWidth: moderateScale(1),
    height: moderateScale(58),
    alignItems: 'center',
    padding: moderateScale(16),
    flexDirection: 'row',
    marginTop: moderateScale(12),
    backgroundColor: theme.colors.lightGray,
  },
  txtStyle: {
    // fontFamily: fontFamily.regular,
    // fontSize: textScale(16)
    ...commonStyles.font_14_medium,
  },
});

// make this component available to the app
export default React.memo(TouchableBtn);
