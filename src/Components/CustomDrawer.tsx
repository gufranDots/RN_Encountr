import React, {FC, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {useSelector} from 'react-redux';
import Modal from 'react-native-modal';
import {BlurView} from '@react-native-community/blur';
import CustomImage from './CustomImage';
import imagesPath from '../constants/imagesPath';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
  verticalScale,
} from '../styles/responsiveSize';
import strings from '../constants/Languages';
import colors from '../styles/colors';
import fontFamily from '../styles/fontFamily';
import {
  ApiError,
  selectSingleImage,
  showError,
  showSuccess,
} from '../utils/helperFunctions';
import {
  incognitoMode,
  uploadProfilePicApi,
} from '../redux/reduxActions/homeActions';
import {ImageEnum, navigationString} from '../constants';
import {profileImg_Approval_Status} from '../constants/Enum';
import {requestCameraPermission} from '../utils/miscellaneous';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';
import { getUserProfile } from '../redux/reduxActions/authActions';
import { Loader } from './Loader';

interface CustomDrawerProps {
  navigation?: any;
}
interface AuthReducersState {
  authReducers: {
    userData: UserData;
  };
}
interface UserData {
  profile_view_count: number;
  profile_image?: string;
  is_profile_image_approved?: number | string | null;
  first_name?: string;
  subscription?: SubScriptionPlan;
}
interface SubScriptionPlan {
  subscription_name?: string;
}

const CustomDrawer: FC<CustomDrawerProps> = ({navigation, ...props}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [profilePic, setProfilePic] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  const userData = useSelector<AuthReducersState, UserData>(
    state => state?.authReducers?.userData || {},
  );

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const approvalStatus = userData?.is_profile_image_approved;
  const isPendingApproval =
    approvalStatus === null ||
    String(approvalStatus) === String(profileImg_Approval_Status.Pending);
  const isRejectedApproval =
    String(approvalStatus) === String(profileImg_Approval_Status.Rejected);
  const approvalText = isPendingApproval
    ? strings.waitingForApproval
    : isRejectedApproval
      ? strings.rejectedByAdmin
      : '';

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleIncognitoMode = (
    mode: string,
    index: React.SetStateAction<number>,
  ) => {
    console.log('hhh', selectedIndex, index);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    if (selectedIndex !== index) {
      const apiPayload = mode;
      incognitoMode(apiPayload)
        .then(res => {
          setSelectedIndex(index);
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          showError(ApiError(error));
          if (mode === 'on' && error?.success === false) {
            navigation.navigate(navigationString.SUBSCRIPTION_SCREEN);
          }
        });
    }
  };

  const saveImageApi = (data: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: data?.path,
      name: 'image.png',
      fileName: 'filename',
      type: 'image/png',
    });
    uploadProfilePicApi(formData)
      .then((res: any) => {
        showSuccess(res?.message);
        getUserProfile()
          .then(() => {
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const selectImage = async () => {
    await requestCameraPermission();
    const res = await selectSingleImage();
    saveImageApi(res);
    setProfilePic(res);
  };

  const showAlert = () => {
    Alert.alert(
      '',
      'EXPLICIT CONTENT PROHIBITED!',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK', onPress: selectImage},
      ],
      {cancelable: true},
    );
  };
//  Alert.alert("EXPLICIT CONTENT PROHIBITED");
  const renderMenuButton = (
    icon: any,
    text: string,
    status: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[commonStyles.rowCenterAligned, styles.screenBtnStyle]}>
      <View style={commonStyles.rowCenterAligned}>
        <Image
          source={icon}
          style={{...commonStyles.iconStyle20, marginRight: verticalScale(10)}}
          tintColor={text == strings.set_pin ? '' : theme.colors.black}
        />
        <Text style={commonStyles.font_14_regular}>{text}</Text>
      </View>
      {status == true && (
        <Text style={styles.planTxtStyle}>
          {userData.subscription?.subscription_name}
        </Text>
      )}
      <Image
        source={imagesPath.ic_right_icon}
        style={{...commonStyles.iconStyle11, tintColor: theme.colors.blackOpacity50}}
      />
    </TouchableOpacity>
  );
  const isInteractionRestricted = () => {
    return userData?.subscription?.subscription_name != 'Free';
  };

  return (
    <>
    <DrawerContentScrollView
      {...props}
      showsVerticalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={commonStyles.drawerRoundUserIcon}>
        <CustomImage
          source={
            profilePic
              ? {uri: profilePic?.path}
              : {
                  uri:
                    userData?.profile_image ||
                    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png',
                }
          }
        />
        {approvalText && (profilePic || userData?.profile_image) ? (
          <View style={styles.approvalOverlayContainer}>
            {Platform.OS === 'ios' ? (
              <BlurView
                style={styles.approvalOverlayBlur}
                blurType="dark"
                blurAmount={4}
                reducedTransparencyFallbackColor={theme.colors.blackOpacity60}
              />
            ) : (
              <View
                style={[
                  styles.approvalOverlayBlur,
                  {backgroundColor: theme.colors.blackOpacity60},
                ]}
              />
            )}
            <Text style={styles.approvalOverlayText}>{approvalText}</Text>
          </View>
        ) : null}
        <TouchableOpacity onPress={showAlert}>
          <Image source={imagesPath.editIcon} style={styles.editIconStyle} />
        </TouchableOpacity>
      </TouchableOpacity>
      <Text style={{...commonStyles.font_16_medium, ...styles.marginTop10}}>
        {userData?.first_name}
      </Text>

      <Animated.View
        style={[
          commonStyles.rowCenterAligned,
          styles.btnContainerStyle,
          {
            marginBottom: moderateScale(15),
            transform: [{scale: scaleAnim}],
            opacity: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            commonStyles.rowCenterAligned,
            selectedIndex === 0
              ? styles.activeBtnStyle
              : styles.inactiveBtnStyle,
          ]}
          onPress={() => handleIncognitoMode('off', 0)}>
          <Image
            source={imagesPath.dotIcon}
            style={{...commonStyles.iconStyle8, ...styles.iconStyle}}
          />
          <Text style={styles.btnTxtStyle}>{strings.online}</Text>
        </TouchableOpacity>
        {isInteractionRestricted() && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              commonStyles.rowCenterAligned,
              selectedIndex === 1
                ? styles.activeBtnStyle
                : styles.inactiveBtnStyle,
            ]}
            onPress={() => handleIncognitoMode('on', 1)}>
            <Image
              source={imagesPath.incognitoIcon}
              style={{...commonStyles.iconStyle12, ...styles.iconStyle}}
            />
            <Text style={styles.btnTxtStyle}>{strings.incoginto}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {renderMenuButton(imagesPath.drawerUserIcon, strings.profile, false, () =>
        navigation.navigate(navigationString.PROFILESCREEN),
      )}
      {renderMenuButton(
        imagesPath.drawerAlbumIcon,
        strings.myAlbums,
        false,
        () =>
          navigation.navigate(navigationString.ALL_GALLERY_IMAGES, {
            showBottomBtn: true,
          }),
      )}
      {/* {renderMenuButton()} */}
      {renderMenuButton(
        imagesPath.drawerAlbumIcon,
        strings.changePassword,
        false,
        () => navigation.navigate(navigationString.CHANGE_PASSWORD),
      )}
      {renderMenuButton(
        imagesPath.drawerDaimondIcon,
        strings.Subscription,
        true,
        () =>
          navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
            isBack: true,
            from: 'CustomDrawer',
          }),
      )}
      {renderMenuButton(
        imagesPath.drawerSettingIcon,
        strings.Settings,
        false,
        () => navigation.navigate(navigationString.SETTINGSCREEN),
      )}
      {renderMenuButton(imagesPath.ic_tapsUserIcon, strings.tapsHistory, false, () =>
        navigation.navigate(navigationString.TAPS_HISTORY),
      )}
      {renderMenuButton(imagesPath.lockIcon, strings.set_pin, false, () =>
        navigation.navigate(navigationString.SET_PIN_SCREEN),
      )}
      {renderMenuButton(imagesPath.mpox, strings.mpox, false, () =>
        navigation.navigate(navigationString.TERMS_CONDITION_PRIVACY_POLICY, {
          type: 3,
        }),
      )}
      {renderMenuButton(imagesPath.faq, strings.sexual_helth_faq, false, () =>
        navigation.navigate(navigationString.TERMS_CONDITION_PRIVACY_POLICY, {
          type: 4,
        }),
      )}
      {renderMenuButton(
        imagesPath.drawerPrivacyIcon,
        strings.privacyPolicy,
        false,
        () =>
          navigation.navigate(navigationString.TERMS_CONDITION_PRIVACY_POLICY, {
            type: 1,
          }),
      )}

      {renderMenuButton(
        imagesPath.drawerTermsConditionIcon,
        strings.Terms_Condition,
        false,
        () =>
          navigation.navigate(navigationString.TERMS_CONDITION_PRIVACY_POLICY, {
            type: 2,
          }),
      )}

      <Modal
        isVisible={comingSoon}
        onBackdropPress={() => setComingSoon(false)}
        style={styles.modalStyle}>
        <Image source={imagesPath.out_of_swipes} style={styles.modalImage} />
        <Text style={styles.modalTitle}>Feature Coming soon!!</Text>
        <Text style={styles.modalText}></Text>
      </Modal>
    </DrawerContentScrollView>
    <Loader isLoading={isLoading} message="" />
    </>
  );
};

const getStyles = (theme: any) => {
  const commonStyles = getCommonStyles(theme);
  return (
    StyleSheet.create({
      contentContainer: {
        paddingTop: moderateScale(44),
        alignItems: 'center',
      },
      marginTop10: {
        marginTop: moderateScale(10),
      },
      editIconStyle: {
        height: scale(34),
        width: scale(34),
        resizeMode: ImageEnum.contain,
        position: 'absolute',
        bottom: 0,
        right: 0,
      },
      approvalOverlayContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: moderateScale(80),
        overflow: 'hidden',
      },
      approvalOverlayBlur: {
        ...StyleSheet.absoluteFillObject,
      },
      approvalOverlayText: {
        ...commonStyles.font_12_SemiBold,
        color: theme.colors.activeTintColor,
        textAlign: 'center',
        paddingHorizontal: moderateScale(8),
        zIndex: 2,
      },
      iconStyle: {
        marginRight: verticalScale(4),
      },
      btnContainerStyle: {
        marginTop: moderateScale(12),
        width: '65%',
        backgroundColor: theme.colors.lightGray,
        borderRadius: moderateScale(10),
        justifyContent: 'center',
      },
      inactiveBtnStyle: {
        flex: 5,
        paddingVertical: moderateScale(10),
        justifyContent: 'center',
      },
      activeBtnStyle: {
        flex: 5,
        paddingVertical: moderateScale(10),
        justifyContent: 'center',
        borderRadius: moderateScale(10),
        backgroundColor: theme.colors.lightGreen,
      },
      btnTxtStyle: {
        ...commonStyles.font_12_medium,
        color: theme.colors.blackOpacity50,
      },
      screenBtnStyle: {
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(18),
        borderRadius: moderateScale(12),
        justifyContent: 'space-between',
        backgroundColor: theme.colors.blackOpacity0,
        width: '90%',
        marginBottom: moderateScale(12),
      },
      modalStyle: {
        marginHorizontal: moderateScale(40),
        flex: 0.4,
        borderRadius: moderateScale(16),
        backgroundColor: theme.colors.white,
        marginTop: moderateScaleVertical(height / 2.5),
        padding: 0,
      },
      modalImage: {
        height: moderateScaleVertical(50),
        width: moderateScale(50),
        alignSelf: 'center',
      },
      modalTitle: {
        fontSize: textScale(18),
        alignSelf: 'center',
        marginTop: moderateScaleVertical(8),
        color: theme.colors.black,
        fontFamily: fontFamily.bold,
      },
      modalText: {
        fontSize: textScale(14),
        alignSelf: 'center',
        textAlign: 'center',
        marginTop: moderateScaleVertical(4),
        color: theme.colors.black,
        marginHorizontal: moderateScale(10),
        fontFamily: fontFamily.regular,
      },
      planTxtStyle: {
        ...commonStyles.font_14_regular,
        color: theme.colors.themecolor2,
        marginLeft: verticalScale(40),
      },
    })
  );
} 


export default CustomDrawer;
