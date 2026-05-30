import React, {FC} from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native'
import FastImage from '../utils/FastImageCompat';
import { moderateScale, verticalScale, width } from '../styles/responsiveSize';
import colors from '../styles/colors';
import {useSelector} from 'react-redux';
import strings from '../constants/Languages';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';


interface CustomTabBarProps {
    iconSource: object | number;
    label: string;
    focused?: boolean;
    activeStyle?: any
    inactiveStyle?: any
    iconStyle?:object
    iconResizeMode?: any
    showNotificationDot?: boolean
}
interface HomeReducersState {
  homeReducers: {
    chatCount: boolean;
  };
}


const CustomTabBar: FC<CustomTabBarProps> = ({ 
  iconSource, 
  label, 
  focused, 
  activeStyle, 
  inactiveStyle, 
  iconStyle, 
  iconResizeMode,
  showNotificationDot = false 
}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);
  const chatCount = useSelector<HomeReducersState>(state => state?.homeReducers?.chatCount || false);
  
  // Create animated value for pulse effect
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    if (chatCount || showNotificationDot) {
      // Create pulsing animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [chatCount, showNotificationDot]);

  return (
    <>
    <View style={[styles.bottomTabView, focused ? activeStyle : inactiveStyle]}>
      <View style={styles.iconContainer}>
        <FastImage
          source={iconSource}
          style={{...styles.tabIconStyle,...iconStyle}}
          // tintColor={ label == strings.chatRoom ? null : focused ? activeStyle.color : inactiveStyle.color}
          resizeMode={iconResizeMode}
        />
        {/* Enhanced notification dot for unread messages */}
        {(chatCount || showNotificationDot) && label == strings.inbox && (
          <Animated.View 
            style={[
              styles.notificationDot,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]} 
          />
        )}
      </View>
    {/* <Text style={{...styles.tabTxtStyle, color: focused ? activeStyle.color : inactiveStyle.color}}>
      {label === strings.chatRoom ? '' : label}
    </Text> */}
  </View>
  </>
  )
}
const getStyles = (theme: any) => {
  const commonStyles = getCommonStyles(theme);
  return (
    StyleSheet.create({
      tabTxtStyle: {
        marginTop: verticalScale(6),
        ...commonStyles.font_10_SemiBold,
      },
      tabIconStyle: {
        height: moderateScale(57),
        width: moderateScale(57),
        marginTop: verticalScale(12),
      },
      bottomTabView: {
        flex: 1,
        alignItems: 'center',
        borderColor: theme.colors.primaryWhite,
        width: width / 5,
        // borderTopWidth: moderateScale(2),
      },
      iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      },
      notificationDot: {
        position: 'absolute',
        top: verticalScale(8),
        right: moderateScale(-2),
        width: moderateScale(12),
        height: moderateScale(12),
        borderRadius: moderateScale(6),
        backgroundColor: theme.colors.red,
        borderWidth: 2,
        borderColor: theme.colors.white,
        shadowColor: theme.colors.red,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
      },
    })
  );
}

export default CustomTabBar