// import liraries
import React, { FC } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCommonStyles, hitSlopProp } from '../styles/commonStyles';
import { moderateScale } from '../styles/responsiveSize';
import { SkypeIndicator } from 'react-native-indicators';
import imagesPath from '../constants/imagesPath';
import { useTheme } from '../theme/ThemeProvider';
interface ButtonCompProps {
  btnText: string;
  txtStyle?: object;
  btnView?: object;
  onPressBtn?: () => void;
  rightImage?: any;
  btnStyle?: object;
  disabled?: boolean;
  loading?: boolean;
  leftimg?:any;
  leftimgstyle?:any
}

const ButtonComp: FC<ButtonCompProps> = ({
  btnText,
  txtStyle,
  btnView,
  onPressBtn,
  rightImage,
  btnStyle,
  disabled = false,
  loading = false,
  leftimg,
  leftimgstyle
}) => {
    const { theme } = useTheme();
  const styles = btnStyles(theme);
  return (
    <View style={{ ...btnStyle }}>
      <TouchableOpacity
        onPress={onPressBtn}
        disabled={disabled}
        style={{ ...styles.btnStyle, ...btnView }}
        hitSlop={hitSlopProp}
        activeOpacity={0.9}>
        {loading ? (
          <SkypeIndicator color={theme.colors.white} size={moderateScale(26)} />
        ) : (
          <>
         {leftimg? <Image source={leftimg} style={leftimgstyle}/>:null}
            <Text style={{ ...styles.textView, ...txtStyle }}>{btnText}</Text>
            {rightImage ? (
              <Image source={rightImage} style={{ alignSelf: 'flex-end' }} />
            ) : (
              <></>
            )}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

// define your styles
const btnStyles = (theme: any) => {
  const commonStyles = getCommonStyles(theme);
  return (StyleSheet.create({
    btnStyle: {
      borderRadius: moderateScale(12),
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      flexDirection: 'row',
      width: '100%',
      backgroundColor: theme.colors.themecolor2,
      height: moderateScale(50),
    },
    textView: {
      ...commonStyles.font_16_SemiBold,
      color: theme.colors.primaryTxt,
    },
  }));
}

// make this component available to the app
export default React.memo(ButtonComp);
