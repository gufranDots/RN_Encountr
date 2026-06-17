import {View, Text, StyleSheet, Keyboard, Platform} from 'react-native';
import React, {useRef} from 'react';
import {WrapperContainer} from '../../Components';
import HeaderComp from '../../Components/HeaderComp';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import {
  moderateScale,
  scale,
  textScale,
  verticalScale,
  moderateScaleVertical,
} from '../../styles/responsiveSize';
import fontFamily from '../../styles/fontFamily';
import {OtpInput} from 'react-native-otp-entry';
import colors from '../../styles/colors';
import ButtonComp from '../../Components/ButtonComp';
import {showError, showSuccess} from '../../utils/helperFunctions';
import {
  enableDesableProfilePinApi,
  removeProfilePinApi,
  setProfilePinApi,
} from '../../redux/reduxActions/chatActions';
import {navigationString} from '../../constants';
import {useSelector} from 'react-redux';
import {Switch} from 'react-native-switch';
import {Loader} from '../../Components/Loader';
import { useTheme } from '../../theme/ThemeProvider';

const SetPin = ({navigation, route}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme)
  const [code, setCode] = React.useState('');
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const otpScreenRef = useRef(null);
  const [isEnable, setIsEnable] = React.useState(
    !!userData?.is_pin_enable || false,
  );
  const [loding, setLoding] = React.useState(false);

  const onSetPinPressed = async () => {
    if (code?.length < 4) {
      return showError('Invalid Code');
    }
    try {
      setLoding(true);
      const response = await setProfilePinApi({
        pin: code,
      });
      if (response?.success) {
        if (route?.params?.formOtpScreen) {
          showSuccess('Profile Pin Reset Successfully...');
          return navigation?.replace(navigationString.DrawerStack);
        }
        showSuccess('Profile Pin Added Successfully..');
        otpScreenRef.current.clear();
        setCode('');
        // navigation?.replace(navigationString.DrawerStack);
        onPressEnableDesablePin();
      }
    } catch (error) {
      showError(error || 'Something went wrong');
    } finally {
      setLoding(false);
    }
  };

  const onPressRemovePin = async () => {
    try {
      setLoding(true);
      const response = await removeProfilePinApi({});
      if (response?.success) {
        showSuccess('Profile Pin Removed Successfully..');
        navigation?.replace(navigationString.DrawerStack);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoding(false);
    }
  };
  const onPressEnableDesablePin = async () => {
    try {
      setLoding(true);
      const response = await enableDesableProfilePinApi({});
      if (response?.success) {
        setIsEnable(!isEnable);
        navigation?.replace(navigationString.DrawerStack);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoding(false);
    }
  };
  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <HeaderComp
        viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation?.replace(navigationString.DrawerStack)}
        centerText={strings.set_pin}
        centertextstyle={{fontSize: textScale(18), fontFamily: fontFamily.bold}}
      />
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>{strings.set_your_login_pin}</Text>
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
              accessibilityLabel: 'Set Your Login PIN',
            }}
            theme={{
              containerStyle: styles.pinContainer,
              pinCodeContainerStyle: styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusStickStyle: styles.focusStick,
              focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            }}
          />
          {/* Enable & Desable Profile Pin */}
          <View style={styles.switchConatiner}>
            <Text style={styles.switchText}>{strings.enablePin}</Text>
            <Switch
              onValueChange={onPressEnableDesablePin}
              value={isEnable}
              circleSize={20}
              backgroundActive={theme.colors.themecolor2}
              backgroundInactive={theme.colors.lightgreynew}
              circleInActiveColor={theme.colors.toggle}
              renderActiveText={false}
              renderInActiveText={false}
            />
          </View>
        </View>
        <View>
          {userData?.pin && (
            <ButtonComp
              onPressBtn={onPressRemovePin}
              btnText={'Remove PIN'}
              btnView={styles.deleteButtonStyle}
            />
          )}
          <ButtonComp onPressBtn={onSetPinPressed} btnText={'Submit'} />
        </View>
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
  },
  title: {
    fontSize: textScale(20),
    fontFamily: fontFamily.bold,
    marginBottom: moderateScale(20),
    marginBottom: verticalScale(40),
    color: theme.colors.black
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
  deleteButtonStyle: {
    backgroundColor: theme.colors.red,
    marginBottom: verticalScale(20),
  },
  switchConatiner: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  switchText: {
    marginRight: scale(10),
    fontSize: textScale(14),
    fontWeight: '500',
    color: theme.colors.darkBlack,
  },
});
export default SetPin;
