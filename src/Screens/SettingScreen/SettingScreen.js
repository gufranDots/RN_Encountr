// import liraries
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
// import * as Zendesk from 'react-native-zendesk-messaging';
import { enableFreeze } from 'react-native-screens';
import HeaderComp from '../../Components/HeaderComp';
import { Loader } from '../../Components/Loader';
import TouchableBtn from '../../Components/TouchableBtn';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import reduxActions from '../../redux/reduxActions';
import {
  logoutApi,
  saveLoginPinToStore,
  saveLoginToStore
} from '../../redux/reduxActions/authActions';
import { deleteAccountApi } from '../../redux/reduxActions/homeActions';
import {
  changeNotificationApi
} from '../../redux/reduxActions/profileActions';
import { getCommonStyles } from '../../styles/commonStyles';
import fontFamily from '../../styles/fontFamily';
import {
  moderateScale,
  moderateScaleVertical,
  textScale
} from '../../styles/responsiveSize';
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions';
import {
  clearLoginPin,
  removeItem
} from '../../utils/utils';
import { removeZegoCloud } from '../../utils/zegoConfigureFile';
import { useTheme } from '../../theme/ThemeProvider';

enableFreeze();

const zendesk_accountKey = '4YpR9UJZSI6YZDl1DwWk1hPSkiwrxlkF';
const zendesk_app_id = '3429e6a2c41850217020abb5131b9ae7b44472e414178ddf';
const SettingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const walkSafeData = useSelector(
    state => state?.walkSafeReducers?.walkSafeUserData || null,
  );
  // console.log(userData, 'isNotified ====>>>>>>>>>>');
  const locationStatus = useSelector(
    state => state?.homeReducers?.locationStatus,
  );
  const [isLoading, setLoading] = useState(false);
  const [notificationEnabled, setIsNotificationEnabled] = useState(
    userData?.isNotified === 1,
  );
  const [hideProfilenEnabled, setHideProfilenEnabled] = useState(
    userData?.is_profile_hidden !== 0,
  );
  const [appPinEnabled, setAppPinEnabled] = useState(userData?.appPinValue);
  // const [showMyLocation, setshowMyLocation] = useState(locationStatus);
  const [showMyLocation, setshowMyLocation] = useState(
    userData?.is_location == 0 || null ? false : true,
  );
  const [showMyAge, setshowMyAge] = useState(
    userData?.is_age == 0 || null ? false : true,
  );
  const [showMyWeight, setShowMyWeight] = useState(
    userData?.is_weight_visible == 0 || null ? false : true,
  );

  useEffect(() => {
    handleLogin();
  }, []);



  const handleLogin = () => {
  };

  const _logout = () => {
    Alert.alert(strings.LogOut, strings.areYouSureYouWantToLogout, [
      {
        text: strings.yes,
        onPress: () => _hitLogoutApi(),
      },
      {
        text: strings.no,
        style: 'destructive',
      },
    ]);
  };

  const _hitLogoutApi = () => {
    // removeItem('FCM_TOKEN');
    setLoading(true);
    logoutApi()
      .then(res => {
        setLoading(false);
        // handlePressLogout();
        removeZegoCloud();
      })
      .catch(() => {
        setLoading(false);
      });
    removeZegoCloud();
  };

  const _logoutWalksafe = () => {
    const obj = {
      tokenToRevoke: walkSafeData?.accessToken,
      includeBasicAuth: true,
      sendClientId: true,
    };
    walkSafeLogoutAuth(obj);
  };

  const _CancelSub = () => {
    const url = Platform.select({
      ios: 'App-Prefs:',
      android: `market://details?id=${'com.encountr.app'}`,
    });

    Alert.alert(
      '',
      Platform.OS === 'ios'
        ? strings.CancelSubscribeMesIos
        : strings.CancelSubscribeMesAndroid,
      [
        {
          text: strings.cancel,
          style: 'cancel',
        },
        {
          text: strings.delete,
          onPress: () => {
            Linking.openURL(url);
          },
          style: 'destructive',
        },
      ],
      { cancelable: false },
    );
  };
  const _deleteAccount = () => {
    Alert.alert(strings.delete, strings.areSureYouWantToDeleteYourAccount, [
      {
        text: strings.yes,
        onPress: () => _deleteSubscription(),
      },
      {
        text: strings.no,
        style: 'destructive',
      },
    ]);
  };

  const _deleteSubscription = () => {
    Alert.alert(
      '',
      Platform.OS === 'ios'
        ? strings.CancelSubscribeMesIos
        : strings.CancelSubscribeMesAndroid,
      [
        {
          text: strings.yes,
          onPress: () => _hitDeleteAccountApi(),
        },
        {
          text: strings.no,
          style: 'destructive',
        },
      ],
    );
  };

  // delete account api

  const _hitDeleteAccountApi = () => {
    setLoading(true);
    deleteAccountApi()
      .then(res => {
        setLoading(false);
        removeItem('FCM_TOKEN');
        removeItem('walksafeUserData');
        saveLoginToStore(false);
        saveLoginPinToStore(null);
        clearLoginPin();
        _logoutWalksafe();
      })
      .catch(error => {
        setLoading(false);
        console.log('eroreroreroreror', error);
      });
  };

  const onPressSubscription = () => {
    navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
      isBack: true,
      from: 'SettingScreen',
    });
  };

  const onPressProfilePermissions = () => {
    navigation.navigate(navigationString.PROFILE_PERMISSIONS);

  };



  const _changeNotification = () => {
    const apiData = {
      is_notify: userData?.isNotified == 0 ? 1 : 0,
    };
    setIsNotificationEnabled(!notificationEnabled);
    changeNotificationApi(apiData)
      .then(res => {
      })
      .catch(error => {
        showError(ApiError(error));
      });
  };

  const changeLocationStatus = () => {
    reduxActions
      .changeLocationStatus({ type: 'Location', is_location: !showMyLocation })
      .then(res => {
        if (res?.success == true) {
          reduxActions.updateLocationStatus(!showMyLocation);
          setshowMyLocation(!showMyLocation);
          showSuccess(res?.message);
        }
      })
      .catch(error => {
        showError(ApiError(error));
      });
  };

  const changeAgeStatus = () => {
    reduxActions
      .changeLocationStatus({ type: 'Age', is_age: !showMyAge })
      .then(res => {
        if (res?.success == true) {
          reduxActions.updateAgeStatus(!showMyAge);
          setshowMyAge(!showMyAge);
          showSuccess(res?.message);
        }
      })
      .catch(error => {
        showError(ApiError(error));
      });
  };

  const changeWeightStatus = () => {
    reduxActions
      .changeWeightStatus({ is_weight_visible: !showMyWeight })
      .then(res => {
        if (res?.success) {
          reduxActions.updateWeightStatus(!showMyWeight);
          setShowMyWeight(!showMyWeight);
          showSuccess(res?.message);
        }
      })
      .catch(error => {
        showError(ApiError(error));
      });
  };



  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <View style={{ flex: 1 }}>
        <HeaderComp
          viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
          leftIcon={imagesPath.ic_back}
          onPressBack={() => navigation.goBack()}
          centerText={strings.Settings}
          centertextstyle={{ fontSize: textScale(18), fontFamily: fontFamily.bold }}
        />

        <Text
          style={{
            marginTop: moderateScaleVertical(22),
            marginBottom: moderateScaleVertical(8),
            ...commonStyles.font_12_SemiBold,
            color: theme.colors.blackOpacity50,
          }}>
          {strings.account}
        </Text>

        <View style={styles.mainView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableBtn
              imagesrc={imagesPath.ic_subscription}
              text={strings.Subscription}
              onPressBtn={onPressSubscription}
              mainContStyle={{
                marginTop: moderateScale(0),
                borderTopLeftRadius: moderateScale(12),
                borderRadius: 0,
                borderTopRightRadius: moderateScale(12),
              }}
              rightimg={imagesPath.ic_right_icon}
            />
            <View
              style={{
                height: 0.7,
                marginHorizontal: moderateScale(16),
                backgroundColor: theme.colors.grey,
              }}
            />

            <TouchableBtn
              imagesrc={imagesPath.ic_subscription}
              text={"Profile Permissions"}
              onPressBtn={onPressProfilePermissions}
              mainContStyle={{
                marginTop: moderateScale(0),
                borderRadius: 0,
              }}
              rightimg={imagesPath.ic_right_icon}
            />

            <View
              style={{
                height: 0.7,
                marginHorizontal: moderateScale(16),
                backgroundColor: theme.colors.grey,
              }}
            />

            <TouchableBtn
              imagesrc={imagesPath.contact}
              text={strings.Contactus}
              rightimg={imagesPath.ic_right_icon}
              onPressBtn={() => { navigation.navigate(navigationString.ADMIN_CONTACT) }}
              mainContStyle={{
                marginTop: moderateScale(0),
                borderRadius: moderateScale(0),
              }}

            />
            <View
              style={{
                height: 0.7,
                marginHorizontal: moderateScale(16),
                backgroundColor: theme.colors.grey,
              }}
            />

            <TouchableBtn
              rightimg={imagesPath.ic_right_icon}
              imagesrc={imagesPath.psh_notifications}
              text={strings.changePassword}
              onPressBtn={() =>
                navigation.navigate(navigationString.CHANGE_PASSWORD)
              }
              mainContStyle={{
                marginTop: moderateScale(0),
                borderRadius: moderateScale(0),
              }}
            />
            <View
              style={{
                height: 0.7,
                marginHorizontal: moderateScale(16),
                backgroundColor: theme.colors.grey,
              }}
            />

            <TouchableBtn
              rightimg={imagesPath.ic_right_icon}
              imagesrc={imagesPath.ic_user_blocked}
              text={strings.blockedUsers}
              iconStyle={{
                height: moderateScale(22),
                width: moderateScale(22),
              }}
              onPressBtn={() =>
                navigation.navigate(navigationString.BLOCKED_USERS)
              }
              mainContStyle={{
                marginTop: moderateScale(0),
                borderRadius: moderateScale(0),
              }}
            />
            <View
              style={{
                height: 0.7,
                marginHorizontal: moderateScale(16),
                backgroundColor: theme.colors.grey,
              }}
            />

            {/* Add Pin Lock */}

            {/* <TouchableBtn
            rightimg={imagesPath.ic_right_icon}
            imagesrc={imagesPath.lockIcon}
            text={strings.set_pin}
            iconStyle={{
              height: moderateScale(22),
              width: moderateScale(22),
            }}
            onPressBtn={() =>
              navigation.navigate(navigationString.SET_PIN_SCREEN)
            }
            mainContStyle={{
              marginTop: moderateScale(0),
              borderRadius: moderateScale(0),
            }}
          /> */}

            {/* <View
            style={{
              height: 0.7,
              marginHorizontal: moderateScale(16),
              backgroundColor: theme.colors.grey,
            }}
          /> */}

            <TouchableBtn
              rightimg={imagesPath.ic_right_icon}
              imagesrc={imagesPath.delete_ic}
              text={strings.DeleteAccount}
              onPressBtn={_deleteAccount}
              mainContStyle={{
                marginTop: moderateScale(0),
                borderRadius: moderateScale(0),
              }}
            />
            <View
              style={{
                height: 0.7,
                marginHorizontal: moderateScale(16),
                backgroundColor: theme.colors.grey,
              }}
            />

            <TouchableBtn
              rightimg={imagesPath.ic_right_icon}
              imagesrc={imagesPath.stop}
              iconStyle={{ width: 25, height: 25 }}
              text={'Cancel Subscription'}
              onPressBtn={_CancelSub}
              mainContStyle={{
                marginTop: moderateScale(0),
                borderRadius: moderateScale(0),
                borderBottomLeftRadius: moderateScale(12),
                borderBottomRightRadius: moderateScale(12),
              }}
            />
            <View
              style={{
                marginHorizontal: moderateScale(16),
                backgroundColor: theme.colors.grey,
                marginTop: moderateScale(30),
              }}
            />
            <TouchableBtn
              imagesrc={imagesPath.log_out}
              text={strings.LogOut}
              onPressBtn={_logout}
              mainContStyle={{
                marginTop: moderateScale(0),
                borderRadius: moderateScale(12),
              }}
            />
          </ScrollView>

        </View>
      </View>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  mainView: {
    flex: 0.84,
    justifyContent: 'space-between',
    borderRadius: 40,
  },
  viewStyle: {
    flex: 0.1,
    paddingTop: moderateScale(14),
  },
  switchStyle: {
    shadowOffset: { height: 1, width: 1 },
    shadowColor: theme.colors.themecolor2,
    shadowOpacity: 1,
  },
  container: {
    height: moderateScale(58),
    padding: moderateScale(16),
    marginTop: moderateScale(0),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
  },
  pushView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pushIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    marginRight: moderateScale(10),
    tintColor: theme.colors.black,
  },
  newlocation: {
    width: moderateScale(20),
    height: moderateScale(20),
    marginRight: moderateScale(10),
    tintColor: theme.colors.black,
  },
  pushNotification: {
    ...commonStyles.font_16_medium,
    color: theme.colors.black,
  },
  settingText: {
    ...commonStyles.font_34_bold,
    color: theme.colors.themecolor2,
  },
});

export default SettingScreen;
