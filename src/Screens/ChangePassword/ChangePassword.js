import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import ButtonComp from '../../Components/ButtonComp'
import GradientText from '../../Components/GradientText'
import HeaderComp from '../../Components/HeaderComp'
import { Loader } from '../../Components/Loader'
import TextInputComp from '../../Components/TextInputComp'
import WrapperContainer from '../../Components/WrapperContainer'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import { changePasswordApi } from '../../redux/reduxActions/profileActions'

import colors from '../../styles/colors'
import { moderateScale } from '../../styles/responsiveSize'
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions'
import { checkPasswordValidations } from '../../utils/validations'
import { getCommonStyles } from '../../styles/commonStyles'
import { useTheme } from '../../theme/ThemeProvider'

const ChangePassword = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles)
  const { navigation } = props

  const [isLoading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [showPassword1, setShowPassword1] = useState(true)
  const [showPassword2, setShowPassword2] = useState(true)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const _hideShowPassword = () => {
    setShowPassword(!showPassword)
  }
  const _hideShowPassword1 = () => {
    setShowPassword1(!showPassword1)
  }
  const _hideShowPassword2 = () => {
    setShowPassword2(!showPassword2)
  }

  const _checkValidations = () => {
    if (!checkPasswordValidations(oldPassword, strings.old)) {

    } else if (!checkPasswordValidations(newPassword, strings.new)) {

    } else if (
      !checkPasswordValidations(confirmNewPassword, strings.Confirm?.toLowerCase())
    ) {

    } else if (newPassword != confirmNewPassword) {
      return showError(strings.passwordDoesntMatch)
    } else {
      _changePassword()
    }
  }

  const _changePassword = () => {
    setLoading(true)
    const apiData = {
      old_password: oldPassword,
      password: newPassword
    }
    changePasswordApi(apiData)
      .then(res => {
        setLoading(false)
        showSuccess(res?.message)
        navigation.goBack()
      })
      .catch(error => {
        setLoading(false)
        showError(ApiError(error))
      })
  }

  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <HeaderComp
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
        centerText={strings.changePassword}
      />

      {/* <Text style={styles.header}>{strings.changePassword}</Text> */}

      <GradientText
        text={strings.newPasswordMustBeDifferent}

        textStyle={styles.header}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.5, y: 1 }}
      />

      <KeyboardAwareScrollView
        bounces={false}
        keyboardShouldPersistTaps={'always'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        <View style={{ flex: 0.94 }}>
          <TextInputComp
            inputView={{ marginTop: moderateScale(16) }}
            inputText={strings.oldPassword}
            onPress={_hideShowPassword}
            placeholder={'Old password'}
            secureTextEntry={showPassword}
            onChangeText={e => setOldPassword(e)}
            textInputStyle={{ width: '90%' }}
            maxLength={20}
            image={showPassword ? imagesPath.ic_closeEye : imagesPath.ic_openEye}
            rightImageStyle={commonStyles.iconStyle24}
          />

          <TextInputComp
            inputText={strings.newPassword}
            onPress={_hideShowPassword1}
            placeholder={'New password'}
            secureTextEntry={showPassword1}
            onChangeText={e => setNewPassword(e)}
            textInputStyle={{ width: '90%' }}
            maxLength={20}
            image={showPassword1 ? imagesPath.ic_closeEye : imagesPath.ic_openEye}
            rightImageStyle={commonStyles.iconStyle24}
          />

          <TextInputComp
            inputText={strings.confirmNewPassword}
            onPress={_hideShowPassword2}
            placeholder={'Confirm new password'}
            secureTextEntry={showPassword2}
            onChangeText={e => setConfirmNewPassword(e)}
            textInputStyle={{ width: '90%' }}
            maxLength={20}
            image={showPassword2 ? imagesPath.ic_closeEye : imagesPath.ic_openEye}
            rightImageStyle={commonStyles.iconStyle24}
          />
        </View>
        <ButtonComp
          btnText={strings.save}
          onPressBtn={_checkValidations}
          btnStyle={{ marginTop: moderateScale(20) }}
        />
      </KeyboardAwareScrollView>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles) => StyleSheet.create({
  container: {
    flexGrow: 1
  },
  header: {
    ...commonStyles.font_16_medium,
    marginVertical: moderateScale(24),
    color: theme.colors.black
  }
})

export default ChangePassword
