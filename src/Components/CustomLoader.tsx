import React,{FC} from 'react';
import {View, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {ImageEnum} from '../constants';
import { scale } from '../styles/responsiveSize';
import colors from '../styles/colors';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

interface CustomLoaderProps {
    loaderContainer?:object
    loaderColor?:string
    loaderSize?: number | "small" | "large" | undefined;
}

const CustomLoader:FC<CustomLoaderProps> = ({loaderSize, loaderContainer,loaderColor, ...props}) => {
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  return (
    <View style={[commonStyles.loader, loaderContainer]}>
        <ActivityIndicator size={loaderSize} color={loaderColor || colors.black} />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderImg: {
    height: scale(120),
    width: scale(120),
    resizeMode: ImageEnum.contain,
  },
});
export default CustomLoader;
