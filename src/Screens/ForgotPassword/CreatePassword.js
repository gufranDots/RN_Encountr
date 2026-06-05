import React, {useState} from 'react';
import {Keyboard, StyleSheet, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import ButtonComp from '../../Components/ButtonComp';
import GradientText from '../../Components/GradientText';
import {Loader} from '../../Components/Loader';
import TextInputComp from '../../Components/TextInputComp';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import {createForgotPasswordApi} from '../../redux/reduxActions/authActions';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../styles/responsiveSize';
import {ApiError, showError, showSuccess} from '../../utils/helperFunctions';
// import Clipboard from '@react-native-clipboard/clipboard';
import {
  checkIsEmpty,
  checkLength,
  checkPasswordValidations,
} from '../../utils/validations';
import {enableFreeze} from 'react-native-screens';
import HeaderComp from '../../Components/HeaderComp';
import colors from '../../styles/colors';
import BorderTextInput from '../../Components/BorderTextInput';
import fontFamily from '../../styles/fontFamily';
import {CopyIcon, TickIcon} from '../../assets/svgs';
import { getCommonStyles } from '../../styles/commonStyles';
import { useTheme } from '../../theme/ThemeProvider';
enableFreeze();


const CreatePassword = props => {
  const {route, navigation} = props;
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme)
  const styles = getStyles(theme, commonStyles)

  console.log(props, 'routerouterouteroute');
  const ParamDataa = props.route.params;
  console.log(ParamDataa, 'ParamDataaParamDataa');
  const [isLoading, setLoading] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(true);
  const [confrmPass, setConfrmPass] = useState('');
  const [showConfrmPass, setShowConfrmPass] = useState(true);
  const [copy, setCopy] = useState(false);
  const _hideShowNewPass = () => {
    setShowNewPass(!showNewPass);
  };

  const _hideShowConfrmPass = () => {
    setShowConfrmPass(!showConfrmPass);
  };

  const _createPass = () => {
    if (!checkPasswordValidations(newPass)) {
      return false;
    } else if (checkIsEmpty(confrmPass)) {
      return showError(strings.pleaseConfirmPassword);
    } else if (confrmPass != newPass) {
      return showError(strings.pleaseEnterSamePassword);
    } else {
      Keyboard.dismiss();
      setLoading(true);
      _createPassApi();
    }
  };

  const _createPassApi = () => {
    const apiData = {
      country_code: route?.params?.apiData?.country_code,
      phone_number: route?.params?.apiData?.phone_number,
      password: newPass,
    };
    createForgotPasswordApi(apiData)
      .then(res => {
        showSuccess(res?.message);
        navigation.navigate(navigationString.LOGINSCREEN);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  return (
    <WrapperContainer>
      <HeaderComp
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.navigate(navigationString.LOGINSCREEN)}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={styles.mainContainer}>
        {ParamDataa?.type != 'usernameForgot' && (
          <View>
            <GradientText
              text={strings.resetPassword}
              textStyle={styles.headingTxtStyle}
              start={{x: 0, y: 0.7}}
              end={{x: 0.7, y: 0.9}}
            />
            <GradientText
              text={strings.resetYourPassword}
              textStyle={styles.subHeadingTxtStyle}
              start={{x: 0, y: 0.5}}
              end={{x: 0.5, y: 0.9}}
            />
            <BorderTextInput
              marginBottom={moderateScale(25)}
              value={newPass}
              onPressRight={_hideShowNewPass}
              secureTextEntry={showNewPass}
              placeholder={strings.createPassword}
              onChangeText={e => setNewPass(e)}
              rightIcon={
                showNewPass ? imagesPath.ic_closeEye : imagesPath.ic_openEye
              }
              maxLength={20}
            />
            <BorderTextInput
              marginBottom={moderateScale(25)}
              value={showConfrmPass}
              onPressRight={_hideShowConfrmPass}
              secureTextEntry={showConfrmPass}
              placeholder={strings.confirmPassword}
              onChangeText={e => setConfrmPass(e)}
              rightIcon={
                showConfrmPass ? imagesPath.ic_closeEye : imagesPath.ic_openEye
              }
              maxLength={20}
            />
            <ButtonComp onPressBtn={_createPass} btnText={strings.save} />
          </View>
        )}
        {ParamDataa?.type == 'usernameForgot' && (
          <View>
            <GradientText
              text={'Your UserName is:'}
              textStyle={styles.headingTxtStyle}
              start={{x: 0, y: 0.7}}
              end={{x: 0.7, y: 0.9}}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <GradientText
                text={ParamDataa?.response?.user_name}
                textStyle={{
                  // ...styles.subHeadingTxtStyle,
                  fontSize: textScale(20),
                  fontFamily: fontFamily.SemiBold,
                  alignSelf: 'center',
                  marginTop: moderateScaleVertical(10),
                }}
                start={{x: 0, y: 0.5}}
                end={{x: 0.5, y: 0.9}}
              />
              <TouchableOpacity
                style={{
                  marginTop: moderateScaleVertical(12),
                  marginLeft: moderateScale(8),
                }}
                // onPress={onClickCopy}
                >
                {copy ? <TickIcon /> : <CopyIcon />}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};
const getStyles = (theme, commonStyles) => StyleSheet.create({
  mainContainer: {
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  headingTxtStyle: {
    ...commonStyles.font_34_bold,
    marginTop: moderateScale(32),
  },
  subHeadingTxtStyle: {
    ...commonStyles.font_14_medium,
    color: theme.colors.blackOpacity70,
    marginTop: moderateScale(4),
    marginBottom: moderateScale(48),
  },
});

export default CreatePassword;
