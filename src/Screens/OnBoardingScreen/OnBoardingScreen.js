import React, { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from '../../utils/FastImageCompat';
import Carousel from "react-native-snap-carousel-v4";

import ButtonComp from "../../Components/ButtonComp";
import GradientText from "../../Components/GradientText";
import WrapperContainer from "../../Components/WrapperContainer";
import imagesPath from "../../constants/imagesPath";
import strings from "../../constants/Languages";
import navigationString from "../../constants/navigationString";
import { getCommonStyles, hitSlopProp } from "../../styles/commonStyles";
import { moderateScale, width } from "../../styles/responsiveSize";
import { checkLocationSevice } from "../../utils/miscellaneous";
import { stableKeyExtractor } from "../../utils/stableKeyExtractor";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "../../theme/ThemeProvider";

const OnBoardingScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const styles = boardingStyles(theme);
  const commonStyles = getCommonStyles(theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = [
    {
      id: 1,
      name: strings.appName,
      path: imagesPath.icBannerTwo,
      text: strings.onBoardFirstSlideDes,
    },
    {
      id: 2,
      name: strings.onBoardSecondSlideTitle,
      path: imagesPath.icBannerFour,
      text: strings.onBoardSecondsSlideDes,
    },
    {
      id: 3,
      name: strings.onBoardThirdSlideTitle,
      path: imagesPath.icBannerSix,
      text: strings.onBoardThirdSlideDes,
    },
    {
      id: 4,
      name: strings.onBoardFourthSlideTitle,
      path: imagesPath.icBannerFive,
      text: strings.onBoardFourthSlideDes,
    },
  ];

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      checkLocationSevice();
    });
    return unsubscribe;
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => {
   
      return (
        <View style={styles.centerAlign}>
          <FastImage source={item?.path} style={styles.imgStyle} />
          {index === currentIndex ? (
            <View style={[styles.halfWidth,styles.centerAlign,
            // {display:index === currentIndex?'flex':'none' }
          ]
            }>
              <GradientText
                text={item.name}
                textStyle={[styles.mainText , { color: isDark ? theme.colors.primaryTxt  : theme.colors.themecolor2 }]}
                start={{ x: 0, y: 0.8 }}
                end={{ x: 0.8, y: 0.1 }}
              />
              <Text style={styles.subText}>{item?.text}</Text>
            </View>
          ) : (
            <></>
          )}
        </View>
      );
    },
    [data]
  );

  return (
    <WrapperContainer paddingAvailable={false}>
      <KeyboardAwareScrollView contentContainerStyle={{flexGrow:1}}>
      <View style={styles.mainCont}>
        <Carousel
          data={data}
          renderItem={renderItem}
          keyExtractor={stableKeyExtractor}
          sliderWidth={width}
          itemWidth={width / 1.6}
          layout="default"
          onSnapToItem={(index)=> setCurrentIndex(index)}
          // onScrollIndexChanged={(index) => {
          //   setCurrentIndex(index)
          //   // setTimeout(() => {
          //   //   setCurrentIndex(index)
          //   // }, 1);
          //   }}
        />
      </View>

      <View style={styles.dotView}>
        {data.map((item, index) => {
          return (
            <Image
              key={item.toString() + index}
              // source={imagesPath.dot}
              style={{
                backgroundColor:
                  index === currentIndex ? theme.colors.black : theme.colors.fadeGray,
                ...styles.imgDot,
              }}
            />
          );
        })}
      </View>

      <View style={styles.createAccView}>
        <ButtonComp
          btnText={strings.CreateAnAccount}
          // onPressBtn={() => navigation.navigate(navigationString.CREATEPROFILE)}
          onPressBtn={() => navigation.navigate(navigationString.SIGNUP)}
        />
        <View style={styles.aHAccount}>
          <Text
            style={{
              ...commonStyles.font_12_medium,
              marginBottom: moderateScale(20),
            }}
          >
            {strings.AlreadyHadAnAccount}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(navigationString.LOGINSCREEN)}
            hitSlop={hitSlopProp}
          >
            <Text
              style={{
                ...commonStyles.font_12_SemiBold,
                marginBottom: moderateScale(20),
              }}
            >
              {"  " + strings.SignIn}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      </KeyboardAwareScrollView>
    </WrapperContainer>
  );
};

export default OnBoardingScreen;

const boardingStyles = (theme) => {
  const commonStyles = getCommonStyles(theme);
  return StyleSheet.create({
  mainText: {
    marginTop: moderateScale(22),
    ...commonStyles.font_22_bold,
    color: theme.colors.themecolor2,
    textAlign:'center'
  },
  subText: {
    ...commonStyles.font_14_regular,
    marginTop: moderateScale(10),
    textAlign: "center",
    lineHeight: moderateScale(22),
    color: theme.colors.darkBlack,
  },
  imgStyle: {
    width: moderateScale(240),
    height: moderateScale(360),
    borderRadius: moderateScale(16),
    marginTop: moderateScale(40),
  },
  aHAccount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScale(24),
  },
  createAccView: {
    paddingHorizontal: moderateScale(16),
    flex: 0.15,
    justifyContent: "space-evenly",
    marginBottom: moderateScale(25),
  },
  imgDot: {
    height: moderateScale(8),
    width: moderateScale(8),
    marginHorizontal: moderateScale(2),
    marginBottom: moderateScale(10),
    borderRadius: moderateScale(4),
  },
  dotView: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 0.05,
  },
  mainCont: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
   
  },
  centerAlign: {
    alignItems: "center",
  },
  halfWidth: {
    width: width / 1.2,
  
  },
  });
};
