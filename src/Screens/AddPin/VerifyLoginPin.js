import {View, Text, StyleSheet, Keyboard} from 'react-native';
import React, {useRef} from 'react';
import {WrapperContainer} from '../../Components';
import HeaderComp from '../../Components/HeaderComp';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import {
  moderateScale,
  textScale,
  verticalScale,
} from '../../styles/responsiveSize';
import fontFamily from '../../styles/fontFamily';
import {OtpInput} from 'react-native-otp-entry';
import colors from '../../styles/colors';
import ButtonComp from '../../Components/ButtonComp';
import {ApiError, showError, showSuccess} from '../../utils/helperFunctions';
import {verifyProfilePinApi} from '../../redux/reduxActions/chatActions';
import {Loader} from '../../Components/Loader';
import {navigationString} from '../../constants';
import {forgotPasswordSendOtp} from '../../redux/reduxActions/authActions';
import { useTheme } from '../../theme/ThemeProvider';

const VerifyLoginPin = ({navigation, route}) => {
  const {theme} = useTheme()
  const styles = getStyles(theme)
  const [code, setCode] = React.useState('');
  const [loding, setLoding] = React.useState(false);
  const otpScreenRef = useRef(null);

  const onSetPinPressed = async () => {
    if (code?.length < 4) {
      return showError('Invalid Code');
    }
    try {
      setLoding(true);
      const response = await verifyProfilePinApi({
        pin: code,
      });
      console.log('Set OTP Response: ' + JSON.stringify(response));
      if (response?.success) {
        otpScreenRef.current.clear();
        setCode('');
        navigation?.replace(navigationString.DrawerStack);
      }
    } catch (error) {
      showError(error?.error || 'Something went wrong');
      console.log(error);
    } finally {
      setLoding(false);
    }
  };
  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <HeaderComp
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
        centerText={strings.login_pin}
        centertextstyle={{fontSize: textScale(18), fontFamily: fontFamily.bold}}
        showBackButton={false}
      />
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>{strings.verify_your_login_pin}</Text>
          <OtpInput
            numberOfDigits={4}
            ref={otpScreenRef}
            onTextChange={text => {
              setCode(text);
            }}
            focusColor={theme.colors.greenTheme}
            focusStickBlinkingDuration={500}
            onFilled={() => Keyboard.dismiss()}
            textInputProps={{
              accessibilityLabel: 'Please Verify Your Login Pin',
            }}
            theme={{
              containerStyle: styles.pinContainer,
              pinCodeContainerStyle: styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusStickStyle: styles.focusStick,
              focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            }}
          />
          <Text
            style={styles.forgotPinText}
            onPress={() => {
              const apiData = {
                country_code: route?.params?.userData?.country_code,
                phone_number: route?.params?.userData?.phone_number,
              };

              forgotPasswordSendOtp(apiData)
                .then(res => {
                  setLoding(false);
                  showSuccess(strings.otpSendSuccess);
                  navigation.navigate(navigationString.OTPSCREEN, {
                    sendOtpData: apiData,
                    type: '_FORGOT_PASSWORD',
                    isResetPin: true,
                  });
                })
                .catch(error => {
                  setLoding(false);
                  showError(ApiError(error));
                });
            }}>
            Forgot Pin ?
          </Text>
        </View>
        <ButtonComp onPressBtn={onSetPinPressed} btnText={'Submit'} />
      </View>
      <Loader isLoading={loding} />
    </WrapperContainer>
  );
};
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(20),
    justifyContent: 'space-between',
    paddingVertical: verticalScale(40),
    marginVertical: verticalScale(20),
  },
  title: {
    fontSize: textScale(20),
    fontFamily: fontFamily.bold,
    marginBottom: moderateScale(20),
    marginBottom: verticalScale(40),
    color: theme.colors.blackOpacity80,
  },
  pinContainer: {},
  pinCodeContainer: {
    width: moderateScale(70),
    height: moderateScale(70),
  },
  pinCodeText: {
    fontSize: textScale(22),
    color: theme.colors.black,
    fontWeight: '600',
  },
  focusStick: {},
  activePinCodeContainer: {
    borderWidth: moderateScale(3),
  },
  forgotPinText: {
    textAlign: 'right',
    marginTop: verticalScale(15),
    fontSize: textScale(14),
    color: theme.colors.blue,
  },
});
export default VerifyLoginPin;
