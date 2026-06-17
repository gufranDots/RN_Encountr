// import liraries
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import ButtonComp from '../../Components/ButtonComp';
import DobComp from '../../Components/DobComp';
import HeaderComp from '../../Components/HeaderComp';
import {Loader} from '../../Components/Loader';
import PhoneTextComp from '../../Components/PhoneTextComp';
import TextInputComp from '../../Components/TextInputComp';
import UploadPicView from '../../Components/UploadPicView';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import Geocoder from 'react-native-geocoding';
// import FaceDetection, {
//   FaceDetectorContourMode,
//   FaceDetectorLandmarkMode,
// } from 'react-native-face-detection';
import {
  checkEmailApi,
  checkUserNameApi,
  createNewProfileApi,
  getStaticDataApi,
  sendOtpApi,
} from '../../redux/reduxActions/authActions';
import colors from '../../styles/colors';
import {moderateScale, moderateScaleVertical, width} from '../../styles/responsiveSize';
import {
  ApiError,
  selectSingleImage,
  showError,
  showSuccess,
} from '../../utils/helperFunctions';
import {
  checkLocationSevice,
  requestCameraPermission,
} from '../../utils/miscellaneous';
import {ensureFcmToken} from '../../utils/notificationServices';
import {
  checkIsEmpty,
  checkLength,
  checkPasswordValidations,
  chekPhoneNumberValidations,
  isValidEmail,
} from '../../utils/validations';
import GradientText from '../../Components/GradientText';
import {useSelector} from 'react-redux';
import SelectTags from '../SelectTags/SelectTags';
import {setItem} from '../../utils/utils';
import {uploadProfilePicApi} from '../../redux/reduxActions/homeActions';
import { useTheme } from '../../theme/ThemeProvider';
import { getCommonStyles } from '../../styles/commonStyles';

// create a component
const CreateProfile = ({navigation, route, ...props}) => {
  const {theme, isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles, isDark)
  Geocoder.init('AIzaSyAbOOVcvW6QObCxDywVynr6vz6s5KuWzn0');
  const fcmToken = useSelector(state => state?.authReducers?.token || null);
  const coords = useSelector(state => state?.authReducers?.coordinates || {});
  const debouncingRef = useRef(null);
  const [profileApproved, setProfileApproved] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [imageObject, setImageObject] = useState();
  const [startUserNameSearch, setStartUserNameSearch] = useState(false);
  const [userNameAvail, setUserNameAvail] = useState(false);
  const [userNameSearching, setUserNameSearching] = useState(false);

  const [countryCode, setCountryCode] = useState(
    route?.params?.prevData?.country_code,
  );
  const [countryFlag, setCountryFlag] = useState(
    route?.params?.prevData?.country_flag,
  );
  const [phoneNumber, setPhoneNumber] = useState(
    route?.params?.prevData?.phone_number,
  );
  const [password, setPassword] = useState(route?.params?.prevData?.password);
  const [show, setShow] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [genderOptions, setGenderOptions] = useState([]);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [genderError, setGenderError] = useState(false);

  const isGenderSelected =
    gender !== '' && gender !== null && gender !== undefined;

  const selectedGenderLabel =
    genderOptions.find(item => item.key === gender)?.label || '';

  const _onSelectGender = item => {
    setGender(item.key);
    setGenderError(false);
    setGenderDropdownOpen(false);
  };

  useEffect(() => {
    _fetchStaticData();
  }, []);

  const _fetchStaticData = () => {
    getStaticDataApi()
      .then(res => {
        const genders = res?.data?.GENDERS || [];
        const mapped = genders.map(item => ({
          key: item?.id,
          label: item?.name,
        }));
        setGenderOptions(mapped);
      })
      .catch(error => {
        console.log(error, 'GET_STATIC_DATA error');
      });
  };

  function calculateImageSize(originalWidth, originalHeight) {
    const ratio = originalWidth / originalHeight;

    const w = originalWidth > width ? width : originalWidth;
    const h = w / ratio;

    return {
      width: w,
      height: h,
      originalWidth,
      originalHeight,
    };
  }

  function calculateFaceRectInsideImage(boundingBox, imageSize) {
    const wRatio = imageSize.originalWidth / imageSize.width;
    const hRatio = imageSize.originalHeight / imageSize.height;

    const faceX = boundingBox[0] / wRatio;
    const faceY = boundingBox[1] / hRatio;

    const faceWidth = boundingBox[2] / wRatio - faceX;
    const faceHeight = boundingBox[3] / hRatio - faceY;

    return {
      x: faceX,
      y: faceY,
      width: Math.ceil(faceWidth),
      height: Math.ceil(faceHeight),
    };
  }



  //* ********   Select the Image   ********************* */

  const _selectImage = async () => {
    await requestCameraPermission().then(res => {
      selectSingleImage().then(res => {
        console.log(res, 'resresresresresCreateProfileee');
        setProfilePic(res);
        setImageObject(res);
      });
    });
  };

  const _onConfirm = () => {
    if (!profilePic?.path) {
      return showError(strings.pleaseSelectYourProfilePic);
    }
    // else if (!profileApproved) {
    //   return showError(strings.youCannotProceedWithThisProfilePic);
    // }
    else if (checkIsEmpty(name)) {
      return showError(strings.NameIsRequired);
    } else if (checkIsEmpty(userName)) {
      return showError(strings.UserNameIsRequired);
    } else if (checkIsEmpty(dateOfBirth)) {
      return showError(strings.DateOfBirthIsRequired);
    } else if (!isGenderSelected) {
      setGenderError(true);
      return showError(strings.pleaseSelectYourGender);
    // } else if (!isValidEmail(email)) {
    //   return showError(strings.EnterValidEmail);
    } else {
      // _checkLocationPermission();
      _createProfileApi()
      

    }
  };


  const _checkLocationPermission = () => {
    checkLocationSevice()
      .then(res => {
        _createProfileApi()
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const _createProfileApi = async () => {
    Keyboard.dismiss();
    if (userNameAvail) {
      setLoading(true);
      const resolvedFcmToken = fcmToken || (await ensureFcmToken());
      const createProfileData = {
        profile_image: profilePic,
        name,
        user_name: userName,
        email: email.toLowerCase(),
        country_code: countryCode,
        country_flag: countryFlag,
        phone_number: phoneNumber,
        password,
        dob: dateOfBirth,
        gender,
        device_type: Platform.OS,
        device_token: resolvedFcmToken || '12345',
      };
      // navigateToNextScreen(createProfileData);
      hitCreateProfileApi(null, null, createProfileData, resolvedFcmToken);
    } else {
      setLoading(false);
      showError('Please enter username which is available');
    }
  };
  const navigateToNextScreen = createProfileData => {

    Geocoder.from(coords.latitude, coords.longitude)
      .then(json => {
        const addressComponent = json.results[0].address_components;
        let countryComponent = addressComponent.filter(val =>
          val?.types.includes('country'),
        );
        let cityComponent = addressComponent.filter(val =>
          val?.types.includes('administrative_area_level_1'),
        );
        countryComponent = countryComponent[0].long_name;
        cityComponent = cityComponent[0].long_name;
        hitCreateProfileApi(countryComponent, cityComponent);
      })
      .catch(error => console.warn(error, 'err'));

    // setLoading(false)
    // navigation.navigate(navigationString.SELECTGENDER,
    //   {
    //   prevData: createProfileData
    // }
    // )
    // navigation.navigate(SelectTags)
  };
  const hitCreateProfileApi = (city, country, _createProfileData, prefetchedToken) => {
    const apiData = {
      first_name: name || '',
      user_name: userName || '',
      email: email || 'testapp@gmail.com',
      country_code: countryCode || '',
      country_flag: countryFlag || '',
      phone_number: phoneNumber || '',
      password: password || '',
      dob: dateOfBirth || '',
      gender: gender || '',
      country: country || 'United Kingdom',
      city: city || 'London',
      user_type: 1,
      device_type: Platform.OS,
      device_token: prefetchedToken || fcmToken || '123456',
    };
    console.log(apiData, 'api data ========>>>');
    setLoading(true);
    createNewProfileApi(apiData)
      .then(res => {
        console.log(res, 'resresresresresres');
        _updateProfilePic(profilePic);
        setLoading(false);
        // navigation.navigate(SelectTags)
      })
      .catch(error => {
        console.log(error, 'errrrrrrrrrrr');
        setLoading(false);
        showError(ApiError(error));
      });
  };
  const _updateProfilePic = profilePic => {
    const _formData = new FormData();
    _formData.append('image', {
      uri: profilePic?.path,
      name: 'image.png',
      fileName: 'filename',
      type: 'image/png',
    });
    _formData.append('with_thumb', true);

    setItem('PROFILE_BASE_64', profilePic?.data);

    uploadProfilePicApi(_formData)
      .then(res => {
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  // check the username if  it exits

  const _checkUserName = text => {
    if (text.includes(' ')) {
      text = text.replace(' ', '');
    }
    clearTimeout(debouncingRef.current);
    setUserName(text);
    debouncingRef.current = setTimeout(() => {
      _checkUserNameExists(text);
    }, 1000);
  };

  const _checkUserNameExists = text => {
    const apiData = {
      user_name: text,
    };
    setStartUserNameSearch(true);
    setUserNameSearching(true);
    checkUserNameApi(apiData)
      .then(res => {
        console.log(res, 'resesresrs');
        setUserNameAvail(true);
        setUserNameSearching(false);
      })
      .catch(error => {
        // setUserName('')
        setUserNameAvail(false);
        setUserNameSearching(false);
        showError(ApiError(error));
      });
  };

  //* ******************   Main Body of the Component  **************************

  return (
    <WrapperContainer  isSafeAreaAvailable={true}>
        <View style={{flex: 1}}>
          <HeaderComp
            viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
            // rightText="Skip"
            leftIcon={imagesPath.ic_back}
            onPressBack={() =>
              navigation.navigate(navigationString.LOGINSCREEN)
            }
          />
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            enableOnAndroid
            extraScrollHeight={Platform.OS === 'android' ? moderateScaleVertical(24) : 0}
            keyboardDismissMode="on-drag"
            bounces={false}
            keyboardShouldPersistTaps={'always'}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}>
            {/* <Text style={styles.txtStyle}>{strings.CreateProfile}</Text> */}
            <GradientText
              text={strings.CreateProfile}
              textStyle={styles.txtStyle}
              start={{x: 0, y: 0.5}}
              end={{x: 0.5, y: 0.9}}
            />
            <UploadPicView
              selectImage={_selectImage}
              profilePic={profilePic?.path}
            />

            <TextInputComp
              inputView={{marginTop: moderateScale(42)}}
              inputText={strings.name}
              // keyboardType="email-address"
              value={name}
              placeholder={'Enter name'}
              maxLength={60}
              onChangeText={e => setName(e)}
            />

            <TextInputComp
              inputText={strings.UserName}
              placeholder={'Enter username'}
              // keyboardType="email-address"
              value={userName}
              maxLength={30}
              image={
                startUserNameSearch
                  ? userNameSearching
                    ? ''
                    : userNameAvail
                    ? imagesPath.ic_greenTick
                    : imagesPath.ic_cross
                  : ''
              }
              onChangeText={_checkUserName}
              _anotherComp={
                startUserNameSearch ? (
                  <ActivityIndicator
                    animating={userNameSearching}
                    color={theme.colors.blackOpacity90}
                    style={{marginEnd: moderateScale(8)}}
                  />
                ) : (
                  <></>
                )
              }
              textInputStyle={{width: '84%'}}
            />

            {startUserNameSearch ? (
              !userNameSearching ? (
                <Text
                  style={{
                    ...commonStyles.font_14_medium,
                    marginTop: moderateScale(16),
                    color: userNameAvail ? theme.colors.seaGreen : theme.colors.red,
                    textAlign: 'right',
                  }}>
                  {userNameAvail
                    ? strings.UsernameAvailable
                    : strings.UsernameDoesntExists}
                </Text>
              ) : (
                <></>
              )
            ) : (
              <></>
            )}

            <DobComp onSelect={val => setDateOfBirth(val)} />

            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>{strings.gender}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setGenderError(false);
                  setGenderDropdownOpen(true);
                }}
                style={[
                  styles.dropdownTrigger,
                  genderError && styles.dropdownTriggerError,
                ]}>
                <Text
                  style={[
                    styles.dropdownValue,
                    !selectedGenderLabel && styles.dropdownPlaceholder,
                  ]}>
                  {selectedGenderLabel || strings.pleaseSelectYourGender}
                </Text>
                <Image
                  source={imagesPath.ic_down}
                  style={styles.dropdownIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {genderError && (
                <Text style={styles.dropdownErrorText}>
                  {strings.pleaseSelectYourGender}
                </Text>
              )}
            </View>

            <Modal
              transparent
              visible={genderDropdownOpen}
              animationType="slide"
              onRequestClose={() => setGenderDropdownOpen(false)}>
              <TouchableWithoutFeedback
                onPress={() => setGenderDropdownOpen(false)}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalCard}>
                      <View style={styles.modalHandle} />
                      <Text style={styles.modalTitle}>{strings.gender}</Text>
                      {genderOptions.map((item, index) => {
                        const isSelected = gender === item.key;
                        return (
                          <TouchableOpacity
                            key={String(item?.key ?? index)}
                            activeOpacity={0.7}
                            onPress={() => _onSelectGender(item)}
                            style={[
                              styles.modalItem,
                              isSelected && styles.modalItemSelected,
                            ]}>
                            <Text
                              style={[
                                styles.modalItemText,
                                isSelected && styles.modalItemTextSelected,
                              ]}>
                              {item.label}
                            </Text>
                            {isSelected && (
                              <View style={styles.modalItemDot} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            <TextInputComp
              inputView={{marginTop: moderateScale(25)}}
              inputText={strings.email}
              placeholder={'Enter email'}
              keyboardType="email-address"
              value={email}
              onChangeText={e => setEmail(e)}
            />
            <ButtonComp
              btnText={strings.Confirm}
              onPressBtn={_onConfirm}
              btnView={styles.btnStyle}
            />
          </KeyboardAwareScrollView>
       
      </View>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

// define your styles
const getStyles = (theme, commonStyles, isDark) => StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: moderateScaleVertical(24),
  },
  txtStyle: {
    ...commonStyles.font_34_bold,
    marginTop: moderateScale(32),
    color: isDark ? theme.colors.blackOpacity80 :theme.colors.themecolor2,
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
    marginTop: moderateScale(38),
    marginBottom: moderateScale(48),
  },
  genderContainer: {
    marginTop: moderateScale(10),
  },
  genderLabel: {
    ...commonStyles.font_14_medium,
    color: theme.colors.blackOpacity40,
    marginBottom: moderateScale(12),
    marginLeft: moderateScale(4),
  },
  dropdownTrigger: {
    height: moderateScale(58),
    borderWidth: 0.5,
    borderColor: theme.colors.likePink,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerError: {
    borderColor: theme.colors.red,
    borderWidth: 1,
  },
  dropdownErrorText: {
    ...commonStyles.font_12_medium,
    color: theme.colors.red,
    marginTop: moderateScale(6),
    marginLeft: moderateScale(4),
  },
  dropdownValue: {
    ...commonStyles.font_14_medium,
    color: theme.colors.black,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: theme.colors.blackOpacity40,
  },
  dropdownIcon: {
    height: moderateScale(14),
    width: moderateScale(14),
    marginLeft: moderateScale(8),
    tintColor: theme.colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: isDark ? theme.colors.bgGrey : theme.colors.white,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(28),
    paddingHorizontal: moderateScale(8),
  },
  modalHandle: {
    alignSelf: 'center',
    width: moderateScale(44),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: theme.colors.blackOpacity30,
    marginBottom: moderateScale(12),
  },
  modalTitle: {
    ...commonStyles.font_16_SemiBold,
    color: theme.colors.black,
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(8),
  },
  modalItem: {
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemSelected: {
    backgroundColor: isDark
      ? theme.colors.blackOpacity10
      : 'rgba(229,168,200,0.15)',
  },
  modalItemText: {
    ...commonStyles.font_14_medium,
    color: theme.colors.black,
  },
  modalItemTextSelected: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.likePink,
  },
  modalItemDot: {
    height: moderateScale(8),
    width: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: theme.colors.likePink,
  },
});

export default CreateProfile;
