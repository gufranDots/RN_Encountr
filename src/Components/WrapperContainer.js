import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
 
} from 'react-native';

import colors from '../styles/colors';
import {moderateScale} from '../styles/responsiveSize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

const WrapperContainer = ({
  children,
  statusBarAvailable = true,
  isSafeAreaAvailable = false,
  onlyScrollViewAvailable = false,
  scrollViewBouncesEnable = false,
  paddingAvailable = true,
  mainViewStyle,
  refreshControl,
  contentContainerStyle,
  statusbarcolorr,
  isWhiteStatusBar= true
}) => {
  const { theme , isDark } = useTheme();
  const styles = wrapperStyles(theme);
  function WithOnlyScrollView() {
    return (
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        onResponderMove={() => console.log('hellojhjkhkjhkj')}
        bounces={scrollViewBouncesEnable}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: moderateScale(60),
          flexGrow: 1,
          ...contentContainerStyle,
        }}
        refreshControl={refreshControl}
        stickyHeaderIndices={[0]}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={{
        ...styles.container,
        paddingHorizontal: paddingAvailable ? moderateScale(16) : 0,
        // backgroundColor: theme.colors.white,
        ...mainViewStyle,
      }}>
      {statusBarAvailable ? (
        <StatusBar
          backgroundColor={
            statusbarcolorr ? statusbarcolorr : theme.colors.white
          }
          barStyle={
            !isWhiteStatusBar || isDark ? 'light-content' : 'dark-content'
          }
          translucent={Platform.OS === 'android'}
          showHideTransition={'none'}
          hidden={false}
        />
      ) : (
        <></>
      )}
      {isSafeAreaAvailable ? <SafeAreaView style={styles.headerStyle} /> : <></>}
      {onlyScrollViewAvailable ? WithOnlyScrollView() : children}
    </View>
  );
};

const wrapperStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  headerStyle:{
    marginTop: moderateScale(-30),
  }
});

export default React.memo(WrapperContainer);
