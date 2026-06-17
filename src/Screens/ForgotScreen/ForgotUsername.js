import React, {useState} from 'react';
import {Keyboard, Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import ButtonComp from '../../Components/ButtonComp';
import CountryCodePicker from '../../Components/CountryCodePicker';
import CustomOTPInput from '../../Components/CustomOTPInput';
import GradientText from '../../Components/GradientText';
import HeaderComp from '../../Components/HeaderComp';
import {Loader} from '../../Components/Loader';
import PhoneTextComp from '../../Components/PhoneTextComp';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import {
  forgotPasswordSendOtp,
  forgotUsername,
  getLoginDetailsSendOtp,
  verifyOtpForgotPassword,
  verifyOtpGetLoginDetails,
} from '../../redux/reduxActions/authActions';
import colors from '../../styles/colors';
import {moderateScale, moderateScaleVertical} from '../../styles/responsiveSize';
import {ApiError, showError, showSuccess} from '../../utils/helperFunctions';
import {
  checkIsEmpty,
  checkLength,
  chekPhoneNumberValidations,
} from '../../utils/validations';
import {enableFreeze} from 'react-native-screens';
import { useTheme } from '../../theme/ThemeProvider';
import { getCommonStyles } from '../../styles/commonStyles';
enableFreeze();
const ForgotUsername = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme)
  const styles = getStyles(theme, commonStyles)
  const {navigation, route} = props;

  const {type} = route?.params;
  const [isLoading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('44');
  const [countryFlag, setCountryFlag] = useState('GB');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentSuccess, setOtpSentSuccess] = useState(false);

  const _sendOtp = () => {
    Keyboard.dismiss();
    if (!chekPhoneNumberValidations(phoneNumber)) {
      return;
    }
    setLoading(true);
    const apiData = {
      country_code: countryCode,
      phone_number: phoneNumber,
    };

    _forgotUsername(apiData);
  };

  const _forgotUsername = apiData => {
    forgotUsername(apiData)
      .then(res => {
        setLoading(false);
        navigation.navigate(navigationString.LOGINSCREEN);
        // showSuccess(otpSentSuccess ? 'OTP resent successfully' : 'OTP sent')
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <HeaderComp
      viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(20) : 0 }}
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={{
          justifyContent: 'space-between',
          flexGrow: 1,
        }}>
        <View>
          <GradientText
            text={'Forgot Username'}
            textStyle={{
              ...commonStyles.font_24_SemiBold,
              marginVertical: moderateScale(16),
            }}
            start={{x: 0, y: 0.5}}
            end={{x: 0.5, y: 0.9}}
          />

          <PhoneTextComp
            countryCode={countryCode}
            countryFlag={countryFlag}
            setCountryCode={event => setCountryCode(event)}
            setCountryFlag={event => setCountryFlag(event)}
            setPhoneNumber={val => setPhoneNumber(val)}
          />

          {otpSentSuccess ? (
            <View style={{marginVertical: moderateScale(16)}}>
              <GradientText
                text={'Enter OTP'}
                textStyle={commonStyles.font_24_SemiBold}
                start={{x: 0, y: 0.5}}
                end={{x: 0.5, y: 0.9}}
              />
              <CustomOTPInput
                handleOtpInput={(otp1, otp2, otp3, otp4) =>
                  setOtp(otp1 + '' + otp2 + '' + otp3 + '' + otp4)
                }
              />
            </View>
          ) : null}
        </View>

        <View
          style={{
            justifyContent: 'space-between',
            marginBottom: '10%',
            marginBottom: moderateScale(24),
            // flexDirection: "row",
          }}>
          <ButtonComp onPressBtn={_sendOtp} btnText={'Continue'} />
        </View>
      </KeyboardAwareScrollView>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  inputStyle: {
    borderWidth: moderateScale(0.5),
    height: moderateScale(60),
    width: '100%',
    borderRadius: moderateScale(10),
    borderColor: theme.colors.likePink,
    marginTop: moderateScale(24),
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textStyle: {
    ...commonStyles.font_12_medium,
    position: 'absolute',
    top: moderateScale(-16),
    left: moderateScale(24),
    padding: moderateScale(6),
    color: theme.colors.black,
    backgroundColor: theme.colors.black,
  },
});

export default ForgotUsername;
