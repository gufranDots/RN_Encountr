import React, { useState } from 'react'
import { Keyboard, Platform, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ButtonComp from '../../Components/ButtonComp'
import GradientText from '../../Components/GradientText'
import HeaderComp from '../../Components/HeaderComp'
import { Loader } from '../../Components/Loader'
import PhoneTextComp from '../../Components/PhoneTextComp'
import WrapperContainer from '../../Components/WrapperContainer'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import { forgotPasswordSendOtp, getLoginDetailsSendOtp, verifyOtpForgotPassword, verifyOtpGetLoginDetails } from '../../redux/reduxActions/authActions'
import colors from '../../styles/colors'
import { moderateScale, moderateScaleVertical, textScale } from '../../styles/responsiveSize'
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions'
import { checkIsEmpty, checkLength, chekPhoneNumberValidations } from '../../utils/validations'
import { enableFreeze } from 'react-native-screens'
import BorderTextInput from '../../Components/BorderTextInput'
import { getCommonStyles } from '../../styles/commonStyles'
import { useTheme } from '../../theme/ThemeProvider'
enableFreeze()
const ForgotPassword = (props) => {
  const { navigation } = props
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme)
  const styles = getStyles(theme, commonStyles)
  const [isLoading, setLoading] = useState(false)
  const [countryCode, setCountryCode] = useState('1')
  const [countryFlag, setCountryFlag] = useState('US')
  const [phoneNumber, setPhoneNumber] = useState('')
const ParamDataa=props.route.params
console.log(ParamDataa,'Paramdataaaa');
  const _sendOtp = () => {
    Keyboard.dismiss()
    if (!chekPhoneNumberValidations(phoneNumber)) {
      return
    }
    setLoading(true)
    const apiData = {
      country_code: countryCode,
      phone_number: phoneNumber
    }
    _forgotPassSendOtp(apiData)
  }

  const _forgotPassSendOtp = (apiData) => {
    forgotPasswordSendOtp(apiData).then((res) => {
      setLoading(false)
      showSuccess(strings.otpSendSuccess)
      if(ParamDataa?.type=='username'){
        navigation.navigate(navigationString.OTPSCREEN,{sendOtpData:apiData,  type: 'usernameForgot',})
      }
      else{
        navigation.navigate(navigationString.OTPSCREEN,{sendOtpData:apiData,  type: '_FORGOT_PASSWORD',})
      }
    
    }).catch((error) => {
      setLoading(false)
      showError(ApiError(error))
    })
  }


  return (
        <WrapperContainer isSafeAreaAvailable={true}>
            <HeaderComp
            viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
                leftIcon={imagesPath.ic_back}
                onPressBack={() => navigation.goBack()}
            />
            <KeyboardAwareScrollView bounces={false}
                keyboardShouldPersistTaps={'always'}
                contentContainerStyle={styles.mainContainer}
            >
                <View>
                    <GradientText
                        text={ParamDataa?.type=='username'?strings.forgot_username:strings.forgotPassword}
                        textStyle={styles.headingTxtStyle}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 0.5, y: 0.9 }}
                    />
                      <GradientText
                        text={strings.PLEASE_ENTER_YOUR_VALID_PHONE_NUMBER}
                        textStyle={styles.subHeadingTxtStyle}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 0.5, y: 0.9 }}
                    />
                    <PhoneTextComp
                        countryCode={countryCode}
                        countryFlag={countryFlag}
                        setCountryCode={event => setCountryCode(event)}
                        setCountryFlag={event => setCountryFlag(event)}
                        phoneNumberVal={phoneNumber}
                        onChangeText={(val) => {
                          const phoneNo = val.replace(/[^0-9]/g, '')
                          setPhoneNumber(phoneNo)
                        }}
                    />
                    <ButtonComp
                      btnStyle={{marginTop:moderateScale(31)}}
                      onPressBtn={_sendOtp}
                      btnText={strings.Get_OTP}
                    />
                </View>
            </KeyboardAwareScrollView>
            <Loader isLoading={isLoading} />
        </WrapperContainer>
  )
}

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  mainContainer:{
    justifyContent: 'space-between',
    flexGrow: 1
  },
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
    justifyContent: 'space-between'
  },
  textStyle: {
    ...commonStyles.font_12_medium,
    position: 'absolute',
    top: moderateScale(-16),
    left: moderateScale(24),
    padding: moderateScale(6),
    color: theme.colors.black,
    backgroundColor: theme.colors.darkBlack
  },
  headingTxtStyle:{
    ...commonStyles.font_34_bold,
    marginTop: moderateScale(32)
  },
  subHeadingTxtStyle:{
    ...commonStyles.font_14_medium,
    color: theme.colors.blackOpacity70,
    marginTop: moderateScale(4),
    marginBottom:moderateScale(7)
  }
})

export default ForgotPassword
