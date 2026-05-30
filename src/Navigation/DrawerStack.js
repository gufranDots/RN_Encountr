import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import * as ScreenName from '../Screens';
import colors from '../styles/colors';
import {navigationString} from '../constants';
import {CustomDrawer} from '../Components';
import {moderateScale} from '../styles/responsiveSize';
import TabRoutes from './TabRoutes';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

const Drawer = createDrawerNavigator();
const DrawerStack = () => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme);
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerLabelStyle: [commonStyles.font_14_medium],
        drawerStyle: styles.drawerContainer,
      }}
      initialRouteName={navigationString.BOTTOM_STACK}
      drawerContent={props => <CustomDrawer {...props} />}>
      <Drawer.Screen
        name={navigationString.BOTTOM_STACK}
        component={TabRoutes}
      />
    </Drawer.Navigator>
  );
};
const getStyles = (theme) => StyleSheet.create({
  drawerContainer: {
    width: '80%',
    backgroundColor: theme.colors.white,
    borderTopEndRadius: moderateScale(20),
    borderBottomEndRadius: moderateScale(20),
  },
});
export default DrawerStack;
