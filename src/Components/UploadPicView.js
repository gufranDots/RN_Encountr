import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import FastImage from '../utils/FastImageCompat';
import imagesPath from '../constants/imagesPath';
import colors from '../styles/colors';
import {moderateScale} from '../styles/responsiveSize';
import { useTheme } from '../theme/ThemeProvider';

const UploadPicView = ({selectImage, profilePic}) => {
  const {theme} = useTheme();
  return (
    <TouchableOpacity
      onPress={selectImage}
      activeOpacity={0.9}
      style={{
        alignItems: 'center',
        // alignSelf: 'center',
        width: moderateScale(100),
        height: moderateScale(100),
        marginTop: moderateScale(30),
        borderRadius: moderateScale(24),
        // borderWidth: 1,
        borderColor: colors.white_234_1,
        // padding: moderateScale(1),

        backgroundColor: colors.white_234_1,
      }}>
      <FastImage
        resizeMode={profilePic ? 'cover' : 'contain'}
        style={{
          height: profilePic ? moderateScale(100) : 70,
          marginVertical: profilePic ? 0 : moderateScale(14),
          // marginHorizontal: moderateScale(18),
          borderRadius: 24,
          width: profilePic ? moderateScale(100) : 70,
          // borderRadius: moderateScale(24),
          // borderWidth: 0.3,
          backgroundcolor: colors.white_234_1,
          overflow: 'hidden',
        }}
        source={profilePic ? {uri: profilePic} : imagesPath.profileimage}
      />
      <View
        style={{
          position: 'absolute',
          zIndex: 2000,
          bottom: moderateScale(-10),
          right: moderateScale(-10),
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.greenTheme,
          height: moderateScale(34),
          width: moderateScale(34),
          borderRadius: moderateScale(100),
        }}>
        <Image
          style={{
            height: moderateScale(16),
            width: moderateScale(16),
          }}
          source={imagesPath.camera}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});

export default React.memo(UploadPicView);
