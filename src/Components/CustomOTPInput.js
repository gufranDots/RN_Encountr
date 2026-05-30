import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View, TouchableOpacity} from "react-native";
import colors from "../styles/colors";
import { moderateScale, textScale, width } from "../styles/responsiveSize";
import strings from "../constants/Languages";
import fontFamily from "../styles/fontFamily";
import ButtonComp from "./ButtonComp";
import { getCommonStyles } from "../styles/commonStyles";
import { useTheme } from "../theme/ThemeProvider";

const CustomOTPInput = ({
  onVerifyOtp,
  handleOtpInput,
  resendCode,
  mainViewStyle,
  onBtnPress,
  btnTitle= strings.Verify,
  callResendApi
}) => {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const [otp1, setOtp1] = useState(null);
  const [otp2, setOtp2] = useState(null);
  const [otp3, setOtp3] = useState(null);
  const [otp4, setOtp4] = useState(null);

  const [otp1Focus, setOtp1Focus] = useState(true);
  const [otp2Focus, setOtp2Focus] = useState(false);
  const [otp3Focus, setOtp3Focus] = useState(false);
  const [otp4Focus, setOtp4Focus] = useState(false);

  const otp1Ref = useRef(null);
  const otp2Ref = useRef(null);
  const otp3Ref = useRef(null);
  const otp4Ref = useRef(null);



  useEffect(() => {
    handleOtpInput(otp1, otp2, otp3, otp4);
  }, [otp1, otp2, otp3, otp4]);

const clearOTPFields = () =>{
  setOtp1(null);
  setOtp2(null);
  setOtp3(null);
  setOtp4(null);
  setOtp1Focus(true);
  setOtp2Focus(false);
  setOtp3Focus(false);
  setOtp4Focus(false);
  otp1Ref.current.focus();
}   

const onResetBtnPress = () =>{
  clearOTPFields(),
  callResendApi()
}

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: moderateScale(26),
          width: width - moderateScale(40),
          alignSelf: "center",
          ...mainViewStyle,

        }}
      >
        <TextInput
          ref={otp1Ref}
          style={{
            ...styles.textInputStyle,
            backgroundColor: otp1 ? theme.colors.themecolor2 : theme.colors.white,
            color: otp1 ? theme.colors.btnTxtColor : theme.colors.black,
            borderWidth: otp1Focus ? 1 : 1,
             // borderWidth: otp2Focus ? 0.5 : 0.3,
             borderColor:theme.colors.white_234_1
          }}
          placeholder={"1"}
          autoFocus={true}
          value={otp1}
          keyboardType="numeric"
          returnKeyType={"done"}
          maxLength={1}
          placeholderTextColor={theme.colors.grey}
          onChangeText={(val) => {
            const otpText = val.replace(/[^0-9]/g, "");

            setOtp1(otpText);
            if (otpText !== "") {
              setOtp1Focus(false);
              otp2Ref.current.focus();
            }
          }}
          onFocus={() => {
            setOtp1Focus(true);
            setOtp2Focus(false);
            setOtp3Focus(false);
            setOtp4Focus(false);
          }}
          onSubmitEditing={() => {
            setOtp1Focus(false);
            otp2Ref.current.focus();
          }}
          textAlign={"center"}
        />
        <TextInput
          ref={otp2Ref}
          value={otp2}
          placeholder={"2"}
          style={{
            ...styles.textInputStyle,
            backgroundColor: otp2 ? theme.colors.themecolor2 : theme.colors.white,
            color: otp2 ? theme.colors.btnTxtColor : theme.colors.black,
            // borderWidth: otp2Focus ? 0.5 : 0₹3,
            borderWidth: otp2Focus ? 1 : 1,
            borderColor: theme.colors.white_234_1
          }}
          keyboardType="numeric"
          returnKeyType={"done"}
          maxLength={1}
          placeholderTextColor={theme.colors.grey}
          onChangeText={(val) => {
            const otpText = val.replace(/[^0-9]/g, "");
            setOtp2(otpText);
            if (otpText !== "") {
              setOtp2Focus(false);
              otp3Ref.current.focus();
            }
          }}
          onFocus={() => {
            setOtp1Focus(false);
            setOtp2Focus(true);
            setOtp3Focus(false);
            setOtp4Focus(false);
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && otp2 === "") {
              setOtp2Focus(false);
              otp1Ref.current.focus();
              setOtp1("");
            }
          }}
          onSubmitEditing={() => {
            setOtp2Focus(false);
            otp3Ref.current.focus();
          }}
          textAlign={"center"}
        />
        <TextInput
          ref={otp3Ref}
          value={otp3}
          placeholder={"3"}
          style={{
            ...styles.textInputStyle,
            backgroundColor: otp3 ? theme.colors.themecolor2 : theme.colors.white,
            color: otp3 ? theme.colors.btnTxtColor : theme.colors.black,
            // borderWidth: otp3Focus ? 0.5 : 0.3,
            borderWidth: otp3Focus ? 1 : 1,
            borderColor:theme.colors.white_234_1
          }}
          keyboardType="numeric"
          returnKeyType={"done"}
          placeholderTextColor={theme.colors.grey}
          maxLength={1}
          onChangeText={(val) => {
            const otpText = val.replace(/[^0-9]/g, "");
            setOtp3(otpText);
            if (otpText !== "") {
              setOtp3Focus(false);
              otp4Ref.current.focus();
            }
          }}
          onFocus={() => {
            setOtp1Focus(false);
            setOtp2Focus(false);
            setOtp3Focus(true);
            setOtp4Focus(false);
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && otp3 === "") {
              setOtp3Focus(false);
              otp2Ref.current.focus();
              setOtp2("");
            }
          }}
          onSubmitEditing={() => {
            setOtp3Focus(false);
            otp4Ref.current.focus();
          }}
          textAlign={"center"}
        />

        <TextInput
          ref={otp4Ref}
          placeholder={"4"}
          style={{
            ...styles.textInputStyle,
            backgroundColor: otp4 ? theme.colors.themecolor2 : theme.colors.white,
            color: otp4 ? theme.colors.btnTxtColor : theme.colors.black,
            // borderWidth: otp4Focus ? 0.5 : 0.3,
            borderWidth: otp4Focus ? 1 : 1,
            borderColor:theme.colors.white_234_1
            
          }}
          placeholderTextColor={theme.colors.grey}
          value={otp4}
          keyboardType="numeric"
          returnKeyType={"done"}
          maxLength={1}
          onChangeText={(val) => {
            const otpText = val.replace(/[^0-9]/g, "");
            setOtp4(otpText);
            if (otpText !== "") {
              setOtp4Focus(false);
              Keyboard.dismiss();
            }
          }}
          onFocus={() => {
            setOtp1Focus(false);
            setOtp2Focus(false);
            setOtp3Focus(false);
            setOtp4Focus(true);
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && otp4 === "") {
              setOtp4Focus(false);
              otp3Ref.current.focus();
              setOtp3("");
            }
          }}
          textAlign={"center"}
        />
      </View>
      <View
          style={{
            marginBottom: moderateScale(32),
            marginTop: moderateScale(44),
          }}
        >
          <ButtonComp onPressBtn={onBtnPress} btnText={btnTitle} />
          <Text style={styles.dontText}>{strings.DidntrecievetheOTP}</Text>
          <TouchableOpacity
            style={{
              // padding: 0,
              // borderWidth: 1,
              // borderColor: colors.themecolor2,
              // width: width / 2,
              alignSelf: "center",
              // borderRadius: moderateScale(16)
            }}
          >
            <Text style={styles.resendText} onPress={onResetBtnPress}>
              {strings.ResendOTP}
            </Text>
          </TouchableOpacity>
        </View>
    </View>
  );
};

const getStyles = (theme, isDark) => {
  const commonStyles = getCommonStyles(theme);
  return (
    StyleSheet.create({
      textInputStyle: {
        ...commonStyles.font_24_regular,
        backgroundColor: theme.colors.white_234_1,
        paddingVertical: moderateScale(8),
        height: moderateScale(65),
        width: moderateScale(65),
        color: theme.colors.black,
        borderRadius: moderateScale(8),
        paddingHorizontal: moderateScale(14),
        alignSelf: "stretch",
      },
      dontText: {
        alignSelf: "center",
        marginTop: moderateScale(22),
        fontSize: textScale(14),
        color: theme.colors.black,
        fontFamily: fontFamily.regular,
      },
      resendText: {
        ...commonStyles.font_12_SemiBold,
        textAlign: "center",
        marginVertical: moderateScale(0),
        color: isDark ? theme.colors.primaryWhite : theme.colors.themecolor2,
      }
    })

  );
}
  
export default CustomOTPInput;
