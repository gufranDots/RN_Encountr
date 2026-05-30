import React from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {height, moderateScale, width} from '../styles/responsiveSize';
import colors from '../styles/colors';
import FastImage from '../utils/FastImageCompat';
import CountryFlag from 'react-native-country-flag';
import {ShowGender} from '../utils/helperFunctions';
import imagesPath from '../constants/imagesPath';
import countryData from '../constants/countryData.json';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

type TinderCardCompTypes = {
  item: any;
  onPressCard: () => void;
};

const TinderCardComp = ({
  item,
  onPressCard = () => {},
}: TinderCardCompTypes) => {
  const { theme } = useTheme();
  const commonStyles= getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  return item?.is_profile_hidden ? null : (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={1}
      onPress={onPressCard}>
      <ImageBackground
        style={styles.card}
        source={
          item?.profile_image
            ? { uri: item?.profile_image }
            : imagesPath.noImage
        }
        borderRadius={moderateScale(12)}
        resizeMode="cover">
        <LinearGradient
          style={{
            borderRadius: moderateScale(12),
          }}
          colors={[
            '#ffffff00',
            '#ffffff00',
            '#ffffff00',
            'rgba(0,0,0,0.12)',
            'rgba(0,0,0,0.80)',
            'rgba(20,19,19,1)',
          ]}>
          <View
            style={{
              position: 'absolute',
              right: moderateScale(15),
              top: moderateScale(15),
            }}>
            {ShowGender(item?.gender)}
          </View>
          <View style={styles.photoDescriptionContainer}>
            <View style={styles.cardSubView}>
              <View style={styles.nameFlagView}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '80%',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.nameAge} numberOfLines={2}>
                    {item?.first_name + ',' + item?.age}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.white,
                      borderRadius: moderateScale(100),
                      height: 14,
                      width: 14,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 6,
                    }}>
                    <Image
                      source={imagesPath.verify}
                      style={{
                        height: 22,
                        width: 22,
                        resizeMode: 'contain',
                        tintColor: colors.verifiedBlue,
                      }}
                    />
                  </View>
                </View>
                {/* <CountryFlag
                isoCode={item?.country_flag || 'GB'}
                size={moderateScale(24)}
              /> */}
                <CountryFlag
                  isoCode={
                    countryData?.country?.filter(
                      val => val?.countryName === item?.country,
                    )[0]?.countryCode || 'GB'
                  }
                  size={moderateScale(20)}
                />
              </View>
              <Text style={styles.occupationText} numberOfLines={2}>
                {item?.occupation}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 2,
                }}>
                <Image
                  style={{tintColor: colors.white, marginRight: 6}}
                  source={imagesPath.ic_location}
                />
                <Text
                  style={{...commonStyles.font_12_medium, color: colors.white}}>
                  {item?.distance ? item?.distance?.toFixed(2) : 0} km away
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default TinderCardComp;

const getStyles = (theme:any, commonStyles:any) => StyleSheet.create({
  card: {
    /* Setting the height according to the screen height, it also could be fixed value or based on percentage. In this example, this worked well on Android and iOS. */
    marginTop: moderateScale(-18),
    marginLeft: moderateScale(-4),
    height: Platform.OS === 'ios' ? height / 1.4 : height / 1.4,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: theme.colors.blackOpacity0,
    width: width / 1.06,
    borderRadius: moderateScale(12),
    // // ...Platform.select({
    // //   ios: {
    // //     shadowColor: colors.blackDark,
    // //     shadowOffset: {
    // //       width: 0,
    // //       height: 2,
    // //     },
    // //     shadowRadius: 12,
    // //     shadowOpacity: 1,
    // //     elevation: 5,
    // //   },
    // //   android: {
    // //        borderBottomWidth: 2,
    // //             borderTopWidth:2,
    // //             borderColor:'#000',
    // //     elevation: 18,

    // //   },
    // }),
  },
  image: {
    flex: 1,
    width: width / 1.06,
    height: '100%',
    backgroundColor: theme.colors.blackOpacity12,
    borderRadius: moderateScale(12),
  },
  photoDescriptionContainer: {
    justifyContent: 'flex-end',
    // alignItems: 'flex-start',
    // flexDirection: 'column',
    bottom: moderateScale(64),
    height: '100%',
    width: width / 1.06,
    borderBottomLeftRadius: moderateScale(12),
    borderBottomRightRadius: moderateScale(12),

    // position: 'absolute',
    // backgroundColor: 'red'
  },
  text: {
    ...commonStyles.font_20_regular,
    textAlign: 'center',
    color: theme.colors.white,
    textShadowColor: theme.colors.black,
    textShadowRadius: 10,
  },
  cardSubView: {
    padding: moderateScale(16),
    // backgroundColor: colors.blackOpacity40,
    borderBottomLeftRadius: moderateScale(12),
    borderBottomRightRadius: moderateScale(12),
  },
  nameFlagView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  nameAge: {
    ...commonStyles.font_20_bold,
    color: theme.colors.white,
    paddingEnd: moderateScale(6),
  },
  occupationText: {
    ...commonStyles.font_14_medium,
    color: theme.colors.white,
    lineHeight: moderateScale(24),
    marginTop: moderateScale(6),
  },
});
