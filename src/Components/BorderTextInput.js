import React, { useEffect, useRef } from 'react';
import {
  I18nManager,
  Image,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import { useDarkMode } from 'react-native-dynamic';
import { useSelector } from 'react-redux';
// import imagePath from '../constants/imagePath';
import { hitSlopProp, getCommonStyles } from '../styles/commonStyles';
import { moderateScale, moderateScaleVertical, textScale } from '../styles/responsiveSize';
import { useTheme } from '../theme/ThemeProvider';

const BorderTextInput = ({
  containerStyle,
  textInputStyle,
  leftIcon,
  color,
  rightIcon,
  onChangeText,
  value,
  placeholder = '',
  marginBottom = 24,
  onPressRight = () => { },
  withRef = false,
  secureTextEntry = false,
  borderWidth = 1,
  borderRadius = 13,
  isShowPassword,
  rightIconStyle = {},
  require = false,
  keyboardType = 'default',
  maxLength,
  ...props
}) => {
  const { theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const inputRef = useRef();
  const { appStyle } = useSelector((state) => state?.initBoot || {});
  const fontFamily = appStyle?.fontSizeData;

  useEffect(() => {
    if (withRef && Platform.OS === 'android') {
      if (inputRef.current) {
        inputRef.current.setNativeProps({
          style: { fontFamily: fontFamily.regular },
        });
      }
    }
  }, [secureTextEntry]);
  return (
    <View
      style={{
        flexDirection: 'row',
        minHeight: moderateScale(58),
        color: theme.colors.white_234_1,
        borderWidth: borderWidth,
        borderRadius: borderRadius,
        borderColor:theme.colors.white_234_1,
        marginBottom,
        overflow: 'hidden',

        ...containerStyle,
      }}>
      {leftIcon && (
        <View style={{ justifyContent: 'center', marginLeft: 16 }}>
          <Image source={leftIcon} />
        </View>
      )}

      <TextInput
      
        selectionColor={theme.colors.grey}
        placeholder={placeholder.concat(!!require ? '*' : '')}
        placeholderTextColor={theme.colors.blackOpacity50}
        maxLength={maxLength}
        style={{
          flex: 1,
          ...commonStyles.font_14_regular,
          paddingHorizontal: moderateScaleVertical(16),
          textAlign: I18nManager.isRTL ? 'right' : 'left',
          ...textInputStyle,
        }}
        ref={inputRef}
        keyboardType={keyboardType}
        blurOnSubmit
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={secureTextEntry}
        autoCapitalize={'none'}
        {...props}
      />

      {rightIcon && (
        <TouchableOpacity
          style={{ justifyContent: 'center', marginRight: 10 }}
          hitSlop={hitSlopProp}
          onPress={onPressRight}>
          <Image
            style={{
              ...commonStyles.passwordEyeIconStyle,
              ...rightIconStyle,
            }}
            source={rightIcon}
            tintColor={theme.colors.placeHolderColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(BorderTextInput);
