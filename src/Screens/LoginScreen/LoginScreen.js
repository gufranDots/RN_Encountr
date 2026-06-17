import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { enableFreeze } from 'react-native-screens';
import BorderTextInput from '../../Components/BorderTextInput';
import ButtonComp from '../../Components/ButtonComp';
import GradientText from '../../Components/GradientText';
import HeaderComp from '../../Components/HeaderComp';
import { Loader } from '../../Components/Loader';
import SocialLoginComp from '../../Components/SocialLoginComp';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import {
  loginApi,
  getUserProfile,
  saveLoginToStore,
  saveProfileSetupDoneToStore,
  socailLogin,
} from '../../redux/reduxActions/authActions';
import { saveUserDataToStore } from '../../redux/reduxActions/homeActions';
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
  verticalScale,
} from '../../styles/responsiveSize';
import { ApiError, showError } from '../../utils/helperFunctions';
import { checkLocationSevice } from '../../utils/miscellaneous';
import { ensureFcmToken, requestUserPermission } from '../../utils/notificationServices';
import { fbLogin, googleLogin, handleAppleLogin } from '../../utils/socialLogin';
import { getItem, setItem, setUserData } from '../../utils/utils';
import { checkIsEmpty, checkLength } from '../../utils/validations';
import { isUserProfileComplete } from '../../utils/profileCompletion';
import { useTheme } from '../../theme/ThemeProvider';

enableFreeze();

const LoginScreen = ({ navigation }) => {
  const {theme , isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const fcmToken = useSelector(state => state?.authReducers?.token || null);
  const [isLoading, setLoading] = useState(false);
  const [show, setShow] = useState(true);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    GoogleSignin.configure();
    getItem('FCM_TOKEN').then(cb => console.log(cb, 'FCM'));
    const unsubscribe = navigation.addListener('focus', () => {
      checkLocationPermission();
        requestUserPermission();
    });
    return unsubscribe;
  }, [navigation]);

  const checkLocationPermission = () => {
    checkLocationSevice()
      .then((res) => {
        console.log("redddddd", res);

        setLoading(false)
      })
      .catch(error => {
        setLoading(false);
        console.log(error, 'checkLocationSevice err');
      });
  };

  const validate = () => {
    if (checkIsEmpty(userName)) {
      showError(strings.pleaseEnterUsername);
    } else if (!checkLength(userName, 3)) {
      showError(strings.pleaseEnterValidUsername);
    } else if (checkIsEmpty(password)) {
      showError(strings.pleaseEnterPassword);
    } else if (!checkLength(password, 6)) {
      showError(strings.passwordMustMinimumCharacters);
    } else {
      Keyboard.dismiss();
      setLoading(true);
      checkLocationSevice()
        .then(hitApi)
        .catch(error => {
          setLoading(false);
          showError(strings.pleaseEnableYourLocationLogin);
        }
        );
    }
  };




  const resetStates = () => {
    setUserName('');
    setPassword('');
  };

  const hitApi = async () => {
    const resolvedFcmToken = fcmToken || (await ensureFcmToken());
    const apiData = {
      username: userName,
      password,
      device_type: Platform.OS,
      device_token: resolvedFcmToken || '123456',
    };

    loginApi(apiData)
      .then(res => {
        resetStates();
        const profileData = res?.data || {};
        if (isUserProfileComplete(profileData)) {
          saveProfileSetupDoneToStore(true);
        } else {
          saveLoginToStore(false);
        }
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
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
            .then(() => getUserProfile())
            .catch(console.log);
        }
      })
      .catch(err => {
        showError(err.message);
        setLoading(false);
      });
  };

  const openGmailLogin = () => {
    setLoading(true);
    googleLogin()
      .then(res => {
        setLoading(false);
        if (res?.data?.user) {
          saveSocialLogin(res.data?.user, 'google');
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.log(err, 'erorrrgoogle');
        setLoading(false);
      });
  };
  const openFacebookLogin = () => {
    setLoading(true);
    fbLogin()
      .then(res => {
        console.log("hghghg", res);

        setLoading(false);
        if (res) {
          saveSocialLogin(res, 'facebook');
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.log(err, 'erorrrgoogle');
        setLoading(false);
      });
  };

  const openAppleLogin = () => {

    setLoading(true);
    handleAppleLogin()
      .then(res => {
        console.log("jokoko", res);

        // return
        setLoading(true);
        if (res?.user) {
          saveSocialLogin(res, 'apple');
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.log(err, 'erorrrgoogle');
        setLoading(false);
      });
  };

  const handleForgotPassword = isFormSignIn => {
    setItem('user_name', userName);
    setItem('login_password', password);
    resetStates();
    navigation.navigate(
      isFormSignIn ? navigationString.SIGNUP : navigationString.FORGOT_PASSWORD,
    );
  };

  const handleForgotUsername = isFormSignIn => {
    setItem('user_name', userName);
    setItem('login_password', password);
    resetStates();
    navigation.navigate(
      isFormSignIn ? navigationString.SIGNUP : navigationString.FORGOT_PASSWORD,
      { type: 'username' },
    );
  };

  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <View style={{ flex: 1 }}>
        <HeaderComp
          viewStyle={{  marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
          leftIcon={imagesPath.ic_back}
          onPressBack={() => navigation.goBack()}
        />
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          enableOnAndroid
          extraScrollHeight={Platform.OS === 'android' ? moderateScaleVertical(24) : 0}
          keyboardDismissMode="on-drag"
          bounces={false}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: moderateScaleVertical(24) }}>
            <View style={styles.firstView}>
              <GradientText
                text={strings.LOG_IN}
                textStyle={{ ...commonStyles.font_34_bold, color: isDark ? theme.colors.blackOpacity80 : theme.colors.themecolor2 }}
                start={{ x: 0, y: 0.3 }}
                end={{ x: 0.3, y: 0.5 }}
              />

              <Text style={styles.enterYourTextStyle}>
                {strings.PLEASE_ENTER_YOUR_USER_ID}
              </Text>
            </View>
            <View>
              <BorderTextInput
                value={userName}
                onChangeText={setUserName}
                placeholder={strings.EnterUserId}
              />
              <BorderTextInput
                marginBottom={12}
                value={password}
                onPressRight={() => setShow(!show)}
                secureTextEntry={show}
                placeholder="Enter Password"
                onChangeText={setPassword}
                rightIcon={
                  show ? imagesPath.ic_closeEye : imagesPath.ic_openEye
                }
                maxLength={20}
                onSubmitEditing={validate}
              />
              <View style={styles.tickMarkView}>
                <TouchableOpacity
                  hitSlop={hitSlopProp}
                  activeOpacity={0.9}
                  onPress={() => handleForgotPassword(false)}>
                  <Text style={styles.forgotPasswordStyle}>
                    {strings.forgotPassword}?
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{
                  marginTop: moderateScaleVertical(10),
                  alignSelf: 'flex-end',
                }}
                hitSlop={hitSlopProp}
                activeOpacity={0.9}
                onPress={() => handleForgotUsername(false)}>
                <Text style={styles.forgotPasswordStyle}>
                  {'Forgot Username'}?
                </Text>
              </TouchableOpacity>
              <ButtonComp
                btnText={strings.continue}
                onPressBtn={validate}
                btnStyle={styles.btnStyle}
              />
            </View>
            <View style={{ marginTop: moderateScale(52) }}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginBottom: verticalScale(10),
                  }}>
                  <SocialLoginComp
                    onPress={openGmailLogin}
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
                  <SocialLoginComp
                    onPress={openAppleLogin}
                    image={imagesPath.apple}
                    textlabel={strings.APPLE}
                  />
                )}
              </View>
              <View style={styles.userView}>
                <Text
                  style={{
                    ...commonStyles.font_12_regular,
                    fontSize: textScale(13),
                  }}>
                  {strings.DontHaveAnAccount}
                </Text>
                <TouchableOpacity
                  onPress={() => handleForgotPassword(true)}
                  activeOpacity={0.9}
                  hitSlop={hitSlopProp}>
                  <Text style={styles.txtStyle}>{strings.Sign_UP}</Text>
                </TouchableOpacity>
              </View>
            </View>
        </KeyboardAwareScrollView>
      </View>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

const getStyles = (theme, commonStyles) => StyleSheet.create({
  firstView: {
    justifyContent: 'flex-end',
    paddingTop: moderateScale(32),
    paddingBottom: moderateScale(24),
  },
  forgotPasswordStyle: {
    ...commonStyles.font_12_medium,
    color: theme.colors.black,
    marginLeft: moderateScale(7),
  },
  userView: {
    height: height / 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(20),
  },
  txtStyle: {
    ...commonStyles.font_14_bold,
    color: theme.colors.black,
    fontSize: textScale(13),
    marginLeft: moderateScale(8),
  },
  btnStyle: {
    marginTop: moderateScale(52),
    marginHorizontal: moderateScale(0),
  },
  enterYourTextStyle: {
    ...commonStyles.font_14_medium,
    color: theme.colors.blackOpacity70,
    marginTop: moderateScale(2),
  },
  tickMarkView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: moderateScale(4),
  },
});

export default LoginScreen;
