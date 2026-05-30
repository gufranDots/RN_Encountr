import React, { FC } from 'react'
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native'
import colors from '../styles/colors'
import { height, moderateScale, width } from '../styles/responsiveSize'
import {MaterialIndicator} from 'react-native-indicators'
import strings from '../constants/Languages'
import { useTheme } from '../theme/ThemeProvider'
import { getCommonStyles } from '../styles/commonStyles'

export const Loader = ({ isLoading, message }) => {
  const { theme, isDark } = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme);
  return (
    isLoading ? (
      <View style={{ ...styles.mainView }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            // height: moderateScale(110),
            backgroundColor: theme.colors.white,
            paddingHorizontal: moderateScale(40),
            paddingVertical: moderateScale(20),
            borderRadius: moderateScale(20)
          }}>
          <View style={{ height: moderateScale(70) }}>
            <MaterialIndicator color={isDark ? theme.colors.blackOpacity80 :theme.colors.themecolor2} size={moderateScale(40)} />
          </View>
          <Text
            style={{
              ...commonStyles.font_14_medium,
              textAlign: 'center',
              color: theme.colors.darkBlack,
              paddingHorizontal: moderateScale(8),
              marginTop: moderateScale(20)
            }}
          // numberOfLines={1}
          >
            {message || strings.loading}
          </Text>
        </View>
      </View>
    ) : (
      <></>
    )

  );
}


const getStyles = (theme) => StyleSheet.create({
  mainView: {
    backgroundColor: theme.colors.blackOpacity40,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    height,
    width,
    top: 0
  }
})
