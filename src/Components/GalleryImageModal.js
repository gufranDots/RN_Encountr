import React, {useCallback, useEffect, useRef} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from '../utils/FastImageCompat';
import imagesPath from '../constants/imagesPath';
import colors from '../styles/colors';
import {height, moderateScale, width} from '../styles/responsiveSize';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { stableKeyExtractor } from '../utils/stableKeyExtractor';

const GalleryImageModal = ({data, onPressClose, currentIndex}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme)
  const flatListRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({index: currentIndex, animated: true});
    }, 100);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const _renderImages = useCallback(
    ({item, index}) => {
      return (
        <View style={{backgroundColor: theme.colors.blackOpacity20}}>
          <FastImage
            source={{uri: item?.orig_path_url? item?.orig_path_url:  item?.thumb_path}}
            resizeMode={'contain'}
            style={styles.pic}
          />
        </View>
      );
    },
    [theme.colors.blackOpacity20, styles.pic],
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        initialScrollIndex={0}
        data={data}
        extraData={data}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={stableKeyExtractor}
        renderItem={_renderImages}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 0));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
      />

      <TouchableOpacity
        style={{...styles.closeText, top: insets.top}}
        activeOpacity={0.7}
        onPress={onPressClose}>
        <Image
          source={imagesPath.ic_cross}
          style={{tintcolor: theme.colors.themecolor2}}
        />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  closeText: {
    position: 'absolute',
    backgroundColor: colors.white,
    right: moderateScale(24),
    top: moderateScale(48),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(4),
    borderWidth: 1,
    borderColor: theme.colors.themecolor2,
  },
  pic: {
    width,
    height,
  },
});

export default React.memo(GalleryImageModal);
