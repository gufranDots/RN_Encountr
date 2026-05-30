import React, { FC } from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import FastImage from '../utils/FastImageCompat';
import { useSelector } from 'react-redux';
import imagesPath from '../constants/imagesPath';
import { getCommonStyles, hitSlopProp } from '../styles/commonStyles';
import { moderateScale, width } from '../styles/responsiveSize';
import colors from '../styles/colors';
import strings from '../constants/Languages';
import { useTheme } from '../theme/ThemeProvider';

interface HomeHeaderInterface {
  onPressFilter?: () => void;
}

type stateType = {
  authReducers: {
    userData: any;
  };
  homeReducers: {
    liveLocation: any;
  }
};

const HomeHeader: FC<HomeHeaderInterface> = ({ onPressFilter }) => {

  const userData = useSelector(
    (state: stateType) => state?.authReducers?.userData || {},
  );

  const mylocation = useSelector((state: stateType) => state?.homeReducers?.liveLocation || "")

  // console.log(mylocation, "mylocationmylocationmylocation");
  const { theme }= useTheme();
  const commonStyles = getCommonStyles(theme);


  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: moderateScale(4),
      }}>
      {/* <View style={{ width: width / 5 - moderateScale(20) }} /> */}

      <View
        style={{ width: width / 1.5 - moderateScale(20), flexDirection: 'row' }}>
        <FastImage
          source={imagesPath.Logo1}
          style={{
            height: moderateScale(40),
            width: moderateScale(40),
            marginRight: moderateScale(10),
          }}
          resizeMode={'contain'}
        />
        <View>
          <Text
            style={{
              ...commonStyles.font_22_bold,
              color: theme.colors.themecolor2,
              marginBottom: 4,
            }}>
            {strings.appName}
          </Text>
          <Text
            style={{
              ...commonStyles.font_12_SemiBold,
            }}>
            {mylocation ? mylocation : userData?.city + ', ' + userData?.country}
          </Text>
        </View>
        {/* }}>{userData?.filters?.location}</Text> */}
      </View>

      <TouchableOpacity
        style={{
          position: 'absolute',
          right: moderateScale(0),
          width: width / 5 - moderateScale(20),
          alignItems: 'flex-end',
          zIndex: 10,
        }}
        hitSlop={hitSlopProp}
        onPress={onPressFilter}>
        <Image
          // source={imagesPath.ic_filter}npm install patch-package

          style={{
            height: moderateScale(52),
            width: moderateScale(52),
          }}
          resizeMode={'contain'}
        />
      </TouchableOpacity>
    </View>
  );
};
export default React.memo(HomeHeader);
