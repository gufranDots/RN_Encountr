import React, {FC, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Platform, StyleProp, ViewStyle, ImageStyle} from 'react-native';
import CustomLoader from './CustomLoader';
import FastImage from '../utils/FastImageCompat';
import { moderateScale } from '../styles/responsiveSize';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

interface CustomImageProps {
  source: object | number;
  style?: StyleProp<ImageStyle>;
  imgLoaderStyle?: StyleProp<ViewStyle>;
  imgLoaderSize?: number | 'small' | 'large';
}

const CustomImage: FC<CustomImageProps> = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const [loading, setLoading] = useState<boolean>(true);

  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        commonStyles.drawerRoundUserIcon,
        props?.style,
        props?.imgLoaderStyle,
      ]),
    [commonStyles.drawerRoundUserIcon, props?.style, props?.imgLoaderStyle],
  );

  const sourceUri =
    props?.source &&
    typeof props.source === 'object' &&
    'uri' in props.source
      ? (props.source as {uri?: string}).uri
      : null;

  useEffect(() => {
    if (!sourceUri) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [sourceUri]);

  return (
    <View style={[containerStyle, styles.container]}>
      <FastImage
        source={props?.source}
        style={styles.image}
        onLoadStart={() => {
          if (sourceUri) {
            setLoading(true);
          }
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        onError={() => {
          setLoading(false);
        }}
      />
      {loading && sourceUri ? (
        <CustomLoader
          loaderContainer={styles.loaderOverlay}
          loaderSize={
            props?.imgLoaderSize
              ? props.imgLoaderSize
              : Platform.OS === 'android'
              ? moderateScale(30)
              : 'small'
          }
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomImage;
