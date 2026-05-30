import React, {FC, useState} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import CustomLoader from './CustomLoader';
import FastImage from '../utils/FastImageCompat';
import { ImageEnum } from '../constants';
import { moderateScale, scale } from '../styles/responsiveSize';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

interface CustomImageProps {
  source: object | number;
  style?: object;
  imgLoaderStyle?: object;
  imgLoaderSize?: object;
}

const CustomImage: FC<CustomImageProps> = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <View style={{alignSelf:'center'}}>
      <FastImage
        source={props?.source}
        style={[commonStyles.drawerRoundUserIcon, props?.style]}
        onLoadStart={() => {
          setLoading(true);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
      />
      {loading && (
        <CustomLoader
          loaderContainer={[commonStyles.drawerRoundUserIcon, props?.imgLoaderStyle]}
          loaderSize={props?.imgLoaderSize ? props?.imgLoaderSize: Platform.OS == 'android' ? moderateScale(30): 'small'}
        />
      )}
    </View>
  );
};
export default CustomImage;
