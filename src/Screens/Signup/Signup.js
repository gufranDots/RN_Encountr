// import liraries
import React, { useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import ButtonComp from '../../Components/ButtonComp';
import HeaderComp from '../../Components/HeaderComp';
import { Loader } from '../../Components/Loader';
import PhoneTextComp from '../../Components/PhoneTextComp';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import { sendOtpApi, socailLogin } from '../../redux/reduxActions/authActions';
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../styles/responsiveSize';
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions';
import { checkLocationSevice } from '../../utils/miscellaneous';
import { ensureFcmToken } from '../../utils/notificationServices';
import {
  checkIsEmpty,
  checkPasswordValidations,
  chekPhoneNumberValidations,
} from '../../utils/validations';
import GradientText from '../../Components/GradientText';
import { useSelector } from 'react-redux';
import BorderTextInput from '../../Components/BorderTextInput';
import SocialLoginComp from '../../Components/SocialLoginComp';
import { setItem, setUserData } from '../../utils/utils';
import { fbLogin, googleLogin, handleAppleLogin } from '../../utils/socialLogin';
import { saveUserDataToStore } from '../../redux/reduxActions/homeActions';
import { useTheme } from '../../theme/ThemeProvider';
// create a component
const Signup = ({ navigation }) => {
  const {theme, isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles)
  const fcmToken = useSelector(state => state?.authReducers?.token || null);

  const debouncingRef = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [countryCode, setCountryCode] = useState('1');
  const [countryFlag, setCountryFlag] = useState('US');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [show, setShow] = useState(true);
  const [showConfirm, setShowConfirm] = useState(true);

  // function to hide and show the password...
  const _hideShowPassword = () => {
    setShowConfirm(!showConfirm);
  };
  // hide Password
  const _hide = () => {
    setShow(!show);
  };
  const isCheckedMarked = () => {
    setIsChecked(!isChecked);
  };
  const resetStates = () => {
    setPhoneNumber(''),
      setPassword(''),
      setPasswordConfirm(''),
      setCountryCode('1'),
      setCountryFlag('US');
  };

  // Validation for checking the fields
  const _onConfirm = () => {
    if (checkIsEmpty(phoneNumber)) {
      return showError(strings.phoneNoIsRequired);
    } else if (!chekPhoneNumberValidations(phoneNumber)) {
      return showError(strings.enterValidPhoneNo);
    } else if (checkIsEmpty(password)) {
      return showError(strings.passwordIsRequired);
    } else if (!checkPasswordValidations(password)) {
      return false;
    } else if (checkIsEmpty(passwordConfirm)) {
      return showError(strings.confirmPasswordIsRequired);
    }
    else if (password != passwordConfirm) {
      return showError(strings.confirmPasswordDoesNotMatch);
    }
    else if (!isChecked) {
      return showError(strings.selectTerms_Conditiion);
    }
    else {
      _checkLocationPermission();
    }
  };

  const _checkLocationPermission = () => {
    setLoading(true);
    checkLocationSevice()
      .then(res => {
        _createProfileApi();
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const _createProfileApi = async () => {
    Keyboard.dismiss();
    setLoading(true);
    const resolvedFcmToken = fcmToken || (await ensureFcmToken());
    const createProfileData = {
      country_code: countryCode,
      country_flag: countryFlag,
      phone_number: phoneNumber,
      password,
      device_type: Platform.OS,
      device_token: resolvedFcmToken || '12345',
    };

    const sendOtpData = {
      country_code: `${countryCode}`,
      phone_number: phoneNumber,
    };

    sendOtpApi(sendOtpData)
      .then(res => {
        setLoading(false);
        showSuccess(strings.OTPSentOn + phoneNumber);
        if (isChecked) {
          setItem('phone_number', phoneNumber);
          setItem('country_code', countryCode);
          setItem('country_flag', countryFlag);
          setItem('password', password);
        } else {
          resetStates();
        }
        navigation.navigate(navigationString.OTPSCREEN, {
          createProfileData,
          sendOtpData,
        });
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const openGmailLogin = () => {
    setLoading(true)
    // updateState({ isLoading: true });
    googleLogin()
      .then((res) => {
        setLoading(false)
        if (res?.data?.user) {
          saveSocialLogin(res?.data?.user, 'google');
        } else {
          // updateState({ isLoading: false });
        }
      })
      .catch((err) => {
        // updateState({ isLoading: false });
      });
  };


  const openFacebookLogin = () => {
    setLoading(true);
    fbLogin()
      .then(res => {
        
        setLoading(false);
        if (res) {
          saveSocialLogin(res?.data?.user, 'facebook');
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.log(err, 'erorr facebook');
        setLoading(false);
      });
  };


   const openAppleLogin = () => {
     setLoading(true);
     handleAppleLogin()
       .then(res => {
 
         // return
         setLoading(true);
         if (res?.user) {
           saveSocialLogin(res, 'apple');
         } else {
           setLoading(false);
         }
       })
       .catch(err => {
         console.log(err, 'erorrr apple');
         setLoading(false);
       });
   };


  




  
  const saveSocialLogin = async (socialLoginData, type) => {
    setLoading(true);
    const resolvedFcmToken = fcmToken || (await ensureFcmToken());
    let data = {
      first_name:
        socialLoginData?.name ||
        socialLoginData?.userName || 
        socialLoginData?.fullName?.givenName,
      social_id:
        socialLoginData?.id ||
        socialLoginData?.userID ||
        socialLoginData?.user,

      email: socialLoginData?.email,
      type,
      profile_image: socialLoginData?.photo|| socialLoginData?.imageURL,
      device_type: Platform.OS,
      device_token: resolvedFcmToken || '123456',
    };

    socailLogin(data)
      .then(res => {

        setLoading(false);
        if (res.data) {
          setUserData(res.data)
            .then(() => saveUserDataToStore(res.data))
            .catch(console.log, "error in saveUserDataToStore");
        }
      })
      .catch(err => {
        showError(err.message);
        setLoading(false);
      });
  };







  //* ******************   Main Body of the Component  **************************

  return (
    <WrapperContainer isSafeAreaAvailable={true} >
      <TouchableWithoutFeedback style={{ flex: moderateScale(1) }} onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: moderateScale(9) }}>
          <HeaderComp
            viewStyle={{ marginTop: moderateScaleVertical(20) }}
            // rightText="Skip"
            leftIcon={imagesPath.ic_back}
            onPressBack={() => navigation.goBack()}
          />
          <KeyboardAwareScrollView
            bounces={false}
            keyboardShouldPersistTaps={'always'}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}>
            {/* <Text style={styles.txtStyle}>{strings.CreateProfile}</Text> */}
            <GradientText
              text={strings.Sign_UP}
              textStyle={[styles.txtStyle,{ color: isDark ? theme.colors.blackOpacity80 : theme.colors.themecolor2}]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0.5, y: 0.9 }}
            />

            <Text style={styles.enterYourTextStyle}>
              {strings.PLEASE_ENTER_YOUR_VALID_PHONE_NUMBER}
            </Text>
            <View style={styles.myCompView}>
              <PhoneTextComp
                countryCode={countryCode}
                marginBottom={26}
                countryFlag={countryFlag}
                setCountryCode={event => setCountryCode(event)}
                setCountryFlag={event => setCountryFlag(event)}
                phoneNumberVal={phoneNumber}
                onChangeText={val => {
                  const phoneNo = val.replace(/[^0-9]/g, '');
                  setPhoneNumber(phoneNo);
                }}
              />
              <BorderTextInput
                containerStyle={styles.passwordInputStyle}
                marginBottom={26}
                value={password}
                onPressRight={_hide}
                secureTextEntry={show}
                placeholder={strings.createPassword}
                onChangeText={e => setPassword(e)}
                rightIcon={
                  show ? imagesPath.ic_closeEye : imagesPath.ic_openEye
                }
                maxLength={20}
              // onSubmitEditing={_validate}
              />
              <BorderTextInput
                marginBottom={moderateScale(10)}
                value={passwordConfirm}
                onPressRight={_hideShowPassword}
                secureTextEntry={showConfirm}
                placeholder={strings.confirmPassword}
                onChangeText={e => setPasswordConfirm(e)}
                rightIcon={
                  showConfirm ? imagesPath.ic_closeEye : imagesPath.ic_openEye
                }
                maxLength={20}
              // onSubmitEditing={_validate}
              />
              <View style={styles.tickMarkView}>
                <TouchableOpacity
                  style={[commonStyles.rowCenterAligned, styles.tickIconStyle]}
                  hitSlop={hitSlopProp}
                  activeOpacity={0.9}
                  onPress={() => isCheckedMarked()}>
                  <Image
                    source={!isChecked ? imagesPath.tick : imagesPath.tick_mark}
                    style={commonStyles.iconStyle15}
                    tintColor={isDark ? theme.colors.blackOpacity80 : ''}
                  />
                </TouchableOpacity>
                <View style={styles.contentStyle}>
                  <Text
                    style={{
                      ...commonStyles.font_12_regular
                    }}>
                    {strings.I_Accept}
                  </Text>
                  <Text
                    onPress={() => navigation.navigate(
                      navigationString.TERMS_CONDITION_PRIVACY_POLICY,
                      {
                        type: 2,
                      }
                    )
                    }
                    style={[styles.underLineTxt, { color:  isDark ? theme.colors.primaryWhite : theme.colors.themecolor2 }]}>
                    {' '}
                    {`${strings.Terms_Condition} `}
                  </Text>
                  <Text
                    style={{
                      ...commonStyles.font_12_regular
                    }}>
                    {strings.HAVE_READ}
                  </Text>
                  <Text
                    onPress={() =>
                      navigation.navigate(
                        navigationString.TERMS_CONDITION_PRIVACY_POLICY,
                        {
                          type: 1,
                        }
                      )
                    }
                    style={[styles.underLineTxt, { color:  isDark ? theme.colors.primaryWhite : theme.colors.themecolor2 }]}>
                    {`${strings.PRIVACY_POLICY}`}.
                  </Text>
                </View>
              </View>
            </View>

            <ButtonComp
              btnText={strings.Get_OTP}
              onPressBtn={_onConfirm}
              btnView={styles.btnStyle}
            />
            <View style={styles.spaceBetweeenAligned}>
              <SocialLoginComp
                onPress={() => openGmailLogin()}
                // onPress={() => showSuccess("on working")}
                image={imagesPath.google}
                textlabel={strings.GOOGLE}
              />
              <View style={{ marginHorizontal: moderateScale(10) }} />
              <SocialLoginComp
                onPress={openFacebookLogin}
                image={imagesPath.facebook}
                textlabel={strings.FACEBOOK}
              />
            </View>
            {Platform.OS === 'ios' && (
              <View style = {{alignSelf:'center', marginTop:moderateScale(5)}}>
              <SocialLoginComp
              onPress={() => openAppleLogin()}
              image={imagesPath.apple}
              textlabel={strings.APPLE}
              />
              </View>
            )}

            <View style={styles.aHAccount}>
              <Text
                style={{
                  ...commonStyles.font_12_medium,
                  marginBottom: moderateScale(20),
                }}>
                {strings.AlreadyHadAnAccount}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(navigationString.LOGINSCREEN)
                }
                hitSlop={hitSlopProp}>
                <Text
                  style={{
                    ...commonStyles.font_12_SemiBold,
                    marginBottom: moderateScale(20),
                    color: theme.colors.black,
                  }}>
                  {'  ' + strings.SignIn}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </TouchableWithoutFeedback>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  underLineTxt:{
    ...commonStyles.font_12_regular, 
    textDecorationLine:'underline'
  },
  aHAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(18),
  },
  txtStyle: {
    ...commonStyles.font_34_bold,
    marginTop: moderateScale(26),
    fontSize: textScale(30),
  },
  txtStyleSignUp: {
    ...commonStyles.font_14_bold,
    color: theme.colors.black,
    fontSize: textScale(13),
    marginLeft: moderateScale(8),
  },
  imgStyle: {
    position: 'absolute',
    zIndex: 2000,
    bottom: moderateScale(-1),
    right: moderateScale(-10),
  },
  imgView: {
    height: moderateScale(100),
    width: moderateScale(100),
    borderRadius: moderateScale(24),
    borderWidth: 0.3,
  },
  birthdayView: {
    borderColor: theme.colors.likePink,
    padding: moderateScale(14),
    borderWidth: 0.5,
    height: moderateScale(58),
    borderRadius: moderateScale(12),
    marginTop: moderateScale(34),
    justifyContent: 'center',
  },
  viewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myCompView: {
    marginTop: moderateScale(32),
  },
  inputStyle: {
    borderWidth: moderateScale(0.5),
    height: moderateScale(60),
    width: '100%',
    borderRadius: moderateScale(10),
    borderColor: theme.colors.likePink,
    marginTop: moderateScale(40),
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
    color: theme.colors.grey,
    backgroundColor: theme.colors.black,
  },
  btnStyle: {
    backgroundColor: theme.colors.themecolor2,
    marginTop: moderateScale(55),
    marginBottom: moderateScale(40),
  },
  enterYourTextStyle: {
    ...commonStyles.font_14_regular,
    color: theme.colors.black,
    marginTop: moderateScale(4),
  },
  tickMarkView: {
    flexDirection: 'row',
    // alignSelf: "center",
    // justifyContent: 'space-between',
    marginHorizontal: moderateScale(4),
  },
  userView: {
    flex: moderateScale(0.5),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(20),
  },
  passwordInputStyle: {
    marginTop: moderateScale(26),
  },
  spaceBetweeenAligned: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tickIconStyle: {
    marginRight: moderateScale(8)
  },
  contentStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
});

export default Signup;
