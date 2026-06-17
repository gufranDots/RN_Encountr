// import liraries
import React, {useEffect, useRef, useState} from 'react';
import {Button, Platform, StyleSheet, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import CustomOTPInput from '../../Components/CustomOTPInput';
import HeaderComp from '../../Components/HeaderComp';
import {Loader} from '../../Components/Loader';
import WrapperContainer from '../../Components/WrapperContainer';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import {
  sendOtpApi,
  verifyOtpForgotPassword,
  verifyOtpToSignupApi,
} from '../../redux/reduxActions/authActions';
import {getCommonStyles} from '../../styles/commonStyles';
import {moderateScale, moderateScaleVertical} from '../../styles/responsiveSize';
import {ApiError, showError, showSuccess} from '../../utils/helperFunctions';
import {checkIsEmpty, checkLength} from '../../utils/validations';
import {clearAsyncStorate} from '../../utils/utils';
import { useTheme } from '../../theme/ThemeProvider';
import imagesPath from '../../constants/imagesPath';

const CELL_COUNT = 4;

const OtpScreen = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme);
  const {navigation, route} = props;
  const ParamDataa = props.route.params.type;
  // console.log(ParamDataa, 'ParamDataa');
  const counterRef = useRef(null);
  const {type} = route?.params;

  const [countryCode, setCountryCode] = useState(
    route?.params?.sendOtpData?.country_code || '',
  );
  const [phoneNumber, setPhoneNumber] = useState(
    route?.params?.sendOtpData?.phone_number || '',
  );
  const [isLoading, setLoading] = useState(false);
  const [counter, setCounter] = useState(120);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (counter > 0) {
      counterRef.current = setInterval(() => {
        setCounter(counter - 1);
      }, 1000);
      return () => clearInterval(counterRef.current);
    } else {
      counterRef.current = setInterval(() => {
        setCounter(counter - 1);
      }, 1000);
      clearInterval(counterRef.current);
    }
    return () => {
      clearTimeout(counterRef.current);
    };
  }, [counter]);

  const _sendOtp = () => {
    setLoading(true);
    const sendOtpData = {
      country_code: `${countryCode}`,
      phone_number: phoneNumber,
    };

    sendOtpApi(sendOtpData)
      .then(res => {
        // console.log(res?.data, 'gjhkjhkjhjkhkjhjkhkjhjkhkhjkhkjhj');
        setLoading(false);
        // showSuccess(strings.OTPResentSuccessfully)
        setCounter(60);
      })
      .catch(error => {
        console.log(error);
        setOtp('');
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const _verifyOtp = () => {
    if (checkIsEmpty(otp)) {
      return showError(strings.pleaseEnterOTP);
    } else if (otp.includes('null')) {
      return showError(strings.PleaseEnterYourDigitOTP);
    } else if (!checkLength(otp, 4)) {
      return showError(strings.PleaseEnterYourDigitOTP);
    }
    setLoading(true);
    if (type == '_FORGOT_PASSWORD' || type == 'usernameForgot') {
      verifyForgotPasswordOTP();
    } else {
      verifySignupOTP();
    }
  };
  // console.log(route, 'routeeee');
  const verifyForgotPasswordOTP = () => {
    const apiData = {
      country_code: route?.params?.sendOtpData?.country_code,
      phone_number: route?.params?.sendOtpData?.phone_number,
      otp,
    };
    verifyOtpForgotPassword(apiData)
      .then(res => {
        // showSuccess(res?.message)
        // console.log(res, 'ressssssss');
        setLoading(false);
        if (route?.params?.isResetPin) {
          navigation.replace(navigationString.SET_PIN_SCREEN, {
            formOtpScreen: true,
          });
        }
        if (ParamDataa == 'usernameForgot') {
          navigation.navigate(navigationString.CREATE_PASSWORD, {
            apiData,
            type: 'usernameForgot',
            response: res?.data,
          });
        } else {
          navigation.navigate(navigationString.CREATE_PASSWORD, {apiData});
        }
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };
  const verifySignupOTP = () => {
    const verifyOtpApiData = {
      country_code: route?.params?.createProfileData?.country_code,
      phone_number: route?.params?.createProfileData?.phone_number,
      otp,
    };

    verifyOtpToSignupApi(verifyOtpApiData)
      .then(res => {
        setCounter(1);
        setLoading(false);
        navigation.navigate(navigationString.CREATEPROFILE, {
          prevData: route?.params?.createProfileData,
        });
      })
      .catch(error => {
        setCounter(1);
        setLoading(false);
        showError(ApiError(error));
      });
  };

  return (
    <WrapperContainer isSafeAreaAvailable={true} >
      <HeaderComp viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }} leftIcon={imagesPath.ic_back} onPressBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        bounces={false}
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}>
        <View style={{}}>
          <View style={{marginTop: moderateScale(32)}}>
            <Text style={{...commonStyles.font_34_bold, color: theme.colors.black}}>
              {strings.Verification}
            </Text>
            <View
              style={[
                commonStyles.rowCenterAligned,
                styles.subHeadingContainer,
              ]}>
              <Text
                style={{
                  ...commonStyles.font_14_medium,
                  color: theme.colors.gray53,
                  marginLeft: moderateScale(4),
                }}>
                {strings.EnterOTPSentTo}
              </Text>
              <Text
                style={{
                  ...commonStyles.font_14_medium,
                  marginStart: moderateScale(4),
                  color: theme.colors.black,
                }}>
                {'+' + countryCode + ' ' + phoneNumber}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: moderateScale(24),
              }}></View>
          </View>

          <CustomOTPInput
            handleOtpInput={(otp1, otp2, otp3, otp4) =>
              setOtp(otp1 + '' + otp2 + '' + otp3 + '' + otp4)
            }
            onBtnPress={_verifyOtp}
            callResendApi={_sendOtp}
          />
        </View>
        {/* <Button title="Clean" onPress={() => clearAsyncStorate()} /> */}
      </KeyboardAwareScrollView>

      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

// define your styles
const getStyles = (theme) => StyleSheet.create({
  cell: {
    width: moderateScale(67),
    height: moderateScale(78),
    fontSize: moderateScale(32),
    borderWidth: moderateScale(1),
    borderColor: theme.colors.likePink,
    borderRadius: moderateScale(15),
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    marginHorizontal: moderateScale(8),
  },
  focusCell: {
    borderColor: theme.colors.themecolor2,
  },
  root: {
    flex: 1,
    padding: moderateScale(20),
  },
  edit: {
    backgroundColor: theme.colors.themecolor2,
    height: moderateScale(24),
    width: moderateScale(24),
    borderRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgStyle: {
    height: moderateScale(12),
    width: moderateScale(12),
    tintColor: theme.colors.themeColor,
  },
  subHeadingContainer: {
    marginTop: moderateScale(4),
  },
});

// make this component available to the app
export default OtpScreen;
