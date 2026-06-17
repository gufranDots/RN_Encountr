// import liraries
import moment from 'moment';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector } from 'react-redux';

import AddMediaImageView from '../../Components/AddMediaImageView';
import ButtonComp from '../../Components/ButtonComp';
import DobComp from '../../Components/DobComp';
import GradientText from '../../Components/GradientText';
import HeaderComp from '../../Components/HeaderComp';
import { Loader } from '../../Components/Loader';
import TextInputComp from '../../Components/TextInputComp';
import UploadPicView from '../../Components/UploadPicView';
import WrapperContainer from '../../Components/WrapperContainer';
import { CountriesAndStates } from '../../constants/CountriesAndStates';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import {
  getCities,
  getOccupationSuggestions,
} from '../../redux/reduxActions/authActions';
import {
  deleteGalleryImageApi,
  uploadProfilePicApi,
} from '../../redux/reduxActions/homeActions';
import { updateProfileApi } from '../../redux/reduxActions/profileActions';
import colors from '../../styles/colors';
import fontFamily from '../../styles/fontFamily';
import { moderateScale, moderateScaleVertical, textScale, width } from '../../styles/responsiveSize';
import {
  ApiError,
  selectSingleImage,
  showError,
  showSuccess,
} from '../../utils/helperFunctions';
import { requestCameraPermission } from '../../utils/miscellaneous';
import { stableKeyExtractor } from '../../utils/stableKeyExtractor';
import { checkIsEmpty, checkLength } from '../../utils/validations';
import SelectTextInputComp from '../../Components/SelectTextInputComp';
import {
  BODY_TYPE,
  EDUCATION,
  ENCOUNTR_POSITION,
  HAS_PHOTOS,
  LOOKING_FOR,
  MAX_HEIGHT,
  MEET_AT,
  MIN_HEIGHT,
  RELATIONSHIP_STATUS,
  SEXUALITY,
  HIV_STATUS,
  VACCINATIONS,
  TRIBES,
  ACCEPT_NSFW_PICS,
  EXPECTATIONS
} from '../../utils/staticData';
import { enableFreeze } from 'react-native-screens';
import SingleSlider from '../../Components/SingleSlider';
import { setItem } from '../../utils/utils';
import { useTheme } from '../../theme/ThemeProvider';
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles';
enableFreeze();
// create a component
const CreateProfile = props => {
  const { theme, isDark } = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles, isDark);
  const { navigation } = props;
  const [imageObject, setImageObject] = useState();
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const [churchSuggestions, setChurchSuggestions] = useState([]);
  const [churchRoleSuggestions, setChurchRoleSuggestions] = useState([]);
  const [occupationSuggestions, setOccupationSuggestions] = useState([]);
  const [church, setChurch] = useState(userData?.church_name);
  const [churchRole, setChurchRole] = useState(userData?.church_role);
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState(userData?.first_name || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    userData?.dob ? moment(userData?.dob).format('yyyy-MM-DD') : '',
  );
  const [lastTestedDate, setLastTestedDate] = useState(
    userData?.last_tested
      ? moment(userData?.last_tested).format('yyyy-MM-DD')
      : '',
  );
  const [remindTestedDate, setRemindTestedDate] = useState(
    userData?.remind_me_to_get_tested
      ? moment(userData?.remind_me_to_get_tested).format('yyyy-MM-DD')
      : '',
  );
  const [dobEdit, setDobEdit] = useState(userData?.is_dob_edited || false);
  const [bio, setBio] = useState(userData?.bio);
  const [occupation, setOccupation] = useState(userData?.occupation);
  const [aboutMe, setAboutMe] = useState(userData?.about_me);
  const [faceBookLink, setFaceBookLink] = useState(userData?.facebook);
  const [instagramLink, setInstagramLink] = useState(userData?.instagram);
  const [linkdinLink, setLinkdinLink] = useState(userData?.linkedin);
  const [twitterLink, setTwitterLink] = useState(userData?.twitter);
  const [weight, setWeight] = useState(userData?.weight);
  const [currCountry, setcurrCountry] = useState(userData?.country);
  const [currentCountryStates, setSelectedCountryStates] = useState([]);
  const [selectedState, setSelectedState] = useState(userData?.city);
  const [maritalStatusValue, setMaritalStatusValue] = useState({
    id:
      typeof userData?.married_status === 'number'
        ? userData?.married_status
        : RELATIONSHIP_STATUS.findIndex(x => x === userData?.married_status) +
        1 || 1,
    name:
      typeof userData?.married_status === 'number'
        ? RELATIONSHIP_STATUS[userData?.married_status - 1 || 1]
        : userData?.married_status,
    isSelected: true,
  });
  const regexPattern = /^[a-zA-Z0-9]*$/;

  const [maritalStatus, setMaritalStatus] = useState([
    { id: 1, name: RELATIONSHIP_STATUS[0] },
    { id: 2, name: RELATIONSHIP_STATUS[1] },
    { id: 3, name: RELATIONSHIP_STATUS[2] },
    { id: 4, name: RELATIONSHIP_STATUS[3] },
    { id: 5, name: RELATIONSHIP_STATUS[4] },
    { id: 6, name: RELATIONSHIP_STATUS[5] },
    { id: 7, name: RELATIONSHIP_STATUS[6] },
    { id: 8, name: RELATIONSHIP_STATUS[7] },
    { id: 9, name: RELATIONSHIP_STATUS[8] },
  ]);
  const [HIV_Status, setHIV_Status] = useState([
    { id: 1, name: HIV_STATUS[0] },
    { id: 2, name: HIV_STATUS[1] },
    { id: 3, name: HIV_STATUS[2] },
  ]);

  const [NSFWValue, setNSFWValue] = useState(userData?.nsfw)
  const [NSFW, setNSFW] = useState([
    { id: 1, name: ACCEPT_NSFW_PICS[0] },
    { id: 2, name: ACCEPT_NSFW_PICS[1] },
    { id: 3, name: ACCEPT_NSFW_PICS[2] },
    { id: 4, name: ACCEPT_NSFW_PICS[3] },
  ]);

  const [ExpectationsValue, setExpectationsValue] = useState(userData.expectations)
  const [Expectations, setExpectations] = useState([
    { id: 1, name: EXPECTATIONS[0] },
    { id: 2, name: EXPECTATIONS[1] },
    { id: 3, name: EXPECTATIONS[2] },
    { id: 4, name: EXPECTATIONS[3] },
    { id: 5, name: EXPECTATIONS[4] },
    { id: 6, name: EXPECTATIONS[5] },
    { id: 7, name: EXPECTATIONS[6] },
    { id: 8, name: EXPECTATIONS[7] },
  ]);

  const [tribes, setTribes] = useState(() => {
    const tribesArray = [
      { id: 1, name: TRIBES[0] },
      { id: 2, name: TRIBES[1] },
      { id: 3, name: TRIBES[2] },
      { id: 4, name: TRIBES[3] },
      { id: 5, name: TRIBES[4] },
      { id: 6, name: TRIBES[5] },
      { id: 7, name: TRIBES[6] },
      { id: 8, name: TRIBES[7] },
      { id: 9, name: TRIBES[8] },
      { id: 10, name: TRIBES[9] },
      { id: 11, name: TRIBES[10] },
      { id: 12, name: TRIBES[11] },
      { id: 13, name: TRIBES[12] },
      { id: 14, name: TRIBES[13] },
      { id: 15, name: TRIBES[14] },
      { id: 16, name: TRIBES[15] },
      { id: 17, name: TRIBES[16] },
      { id: 18, name: TRIBES[17] },
    ];

    // Mark selected tribes
    if (userData?.tribes) {
      const selectedTribes = Array.isArray(userData.tribes) ? userData.tribes : [userData.tribes];
      tribesArray.forEach(tribe => {
        tribe.isSelected = selectedTribes.includes(tribe.name);
      });
    }

    return tribesArray;
  });

  const [vaccinations_Status, setVaccinationsStatus] = useState([
    { id: 1, name: VACCINATIONS[0] },
    { id: 2, name: VACCINATIONS[1] },
  ]);

  const [positionType, setpositionType] = useState([
    { img: imagesPath.upward, name: ENCOUNTR_POSITION[0] },
    { img: imagesPath.verstop, name: ENCOUNTR_POSITION[1] },
    { img: imagesPath.verticalSwipeIcon, name: ENCOUNTR_POSITION[2] },
    { img: imagesPath.tiltedBottomArrow, name: ENCOUNTR_POSITION[3] },
    { img: imagesPath.bottom, name: ENCOUNTR_POSITION[4] },
    { img: imagesPath.horizontalSwipeIcon, name: ENCOUNTR_POSITION[5] },
    { img: imagesPath.bottom, name: ENCOUNTR_POSITION[6] },
    { img: imagesPath.bottom, name: ENCOUNTR_POSITION[7] },
    { img: imagesPath.bottom, name: ENCOUNTR_POSITION[8] },
    { img: imagesPath.bottom, name: ENCOUNTR_POSITION[9] },
  ]);
  const [photoData, setphotoData] = useState([
    { img: imagesPath.photonew, name: HAS_PHOTOS[0], value: 'has_photo' },
    { img: imagesPath.albumIcon, name: HAS_PHOTOS[1], value: 'has_album' },
  ]);

  const [isChildren, setIsChildren] = useState([{ name: 'Yes' }, { name: 'No' }]);

  const [bodyType, setBodyType] = useState([
    { name: BODY_TYPE[0] },
    { name: BODY_TYPE[1] },
    { name: BODY_TYPE[2] },
    { name: BODY_TYPE[3] },
    { name: BODY_TYPE[4] },
    { name: BODY_TYPE[5] },
    { name: BODY_TYPE[6] },
  ]);
  const [bodyTypeValue, setBodyTypeValue] = useState({
    name: userData?.body_type,
  });
  const [lookingForValue, setLookingForValue] = useState({
    name: userData?.looking_for,
  });
  const [meetUpValue, setMeetUpValue] = useState(userData?.meet_at);
  const [tribeValue, setTribeValue] = useState(() => {
    if (!userData?.tribes) return [];

    if (Array.isArray(userData.tribes)) {
      return userData.tribes;
    } else {
      return [userData.tribes];
    }
  });

  const [positionValue, setPositionValue] = useState(userData?.position);
  const [hivValue, setHivValue] = useState(userData?.hiv_status);
  const [vaccinationsValue, setVaccinationsValue] = useState(
    userData?.vaccination,
  );






  const [lookingFor, setLookingFor] = useState([
    { name: LOOKING_FOR[0] },
    { name: LOOKING_FOR[1] },
    { name: LOOKING_FOR[2] },
    { name: LOOKING_FOR[3] },
    { name: LOOKING_FOR[4] },
    { name: LOOKING_FOR[5] },
    { name: LOOKING_FOR[6] },
  ]);
  const [meetUpStates, setMeetUpStates] = useState([
    { name: MEET_AT[0] },
    { name: MEET_AT[1] },
    { name: MEET_AT[2] },
    { name: MEET_AT[3] },
    { name: MEET_AT[4] },
    { name: MEET_AT[5] },
  ]);

  const [searching, setSearching] = useState({
    church_name: false,
    church_role: false,
    occupation: false,
  });

  const [maxHeight, setMaxHeight] = useState(Number(userData?.height));

  useLayoutEffect(() => {
    if (userData?.country) {
      CountriesAndStates.map(val => {
        if (val?.name === userData?.country) {
          setSelectedCountryStates(val?.states || []);
        }
      });
    }
  }, []);


  const renderGalleryImages = useCallback(
    ({ item, index }) => {
      if (index > 3) {
        return;
      }
      return (
        <AddMediaImageView
          size={userData?.photos.length || 0}
          indexData={index || 0}
          itemData={item}
          onPressCross={() => _askToDeleteImage(item, index)}
        />
      );
    },
    [userData?.photos],
  );
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

  const _askToDeleteImage = (item, index) => {
    if (userData?.photos.length === 1) {
      return showError(strings.cantDeleteAllPhotos);
    }
    Alert.alert(strings.delete, strings.deletePicture, [
      {
        text: strings.yes,
        style: 'destructive',
        onPress: () => _deleteImage(item, index),
      },
      {
        text: strings.no,
      },
    ]);
  };

  const _deleteImage = (item, index) => {
    const _restImages = userData.photos.filter(val => val.id !== item.id);

    setLoading(true);
    const arr = [item?.id || -1];
    const _formData = new FormData();
    _formData.append('image_ids', arr);
    deleteGalleryImageApi(_formData, _restImages)
      .then(res => {
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const _selectImage = async () => {
    await requestCameraPermission().then(res => {
      selectSingleImage().then(res => {
        setLoading(true);
        setImageObject(res);
        _updateProfilePic(res);
      });
    });
  };



  const _onSave = () => {
    if (
      dateOfBirth == 'Invalid date' ||
      dateOfBirth == null ||
      dateOfBirth == undefined
    ) {
      return showError(strings.PLEASE_SELECT_DATE);
    }
    if (checkIsEmpty(name)) {
      return showError(strings.nameIsRequired);
    } else if (checkIsEmpty(dateOfBirth)) {
      return showError(strings.dobIsRequired);
    } else {
      setLoading(true);
      _updateProfile();
    }
  };

  const _updateProfile = () => {
    const adjustedDob = moment(dateOfBirth).add(1, 'days').format('YYYY-MM-DD');

    Keyboard.dismiss();

    const apiData = {
      facebook: faceBookLink,
      instagram: instagramLink,
      linkedin: linkdinLink,
      twitter: twitterLink,
      about_me: aboutMe,
      first_name: name,
      country: currCountry,
      city: selectedState,
      occupation: occupation || '',
      bio: bio || '',
      dob: adjustedDob,
      device_type: Platform.OS,
      gender: userData?.gender || 1,
      church_name: church || '',
      church_role: churchRole || '',
      body_type: bodyTypeValue?.name,
      tribes: tribeValue && tribeValue.length > 0 ? tribeValue.map(tribe => typeof tribe === 'string' ? tribe : tribe.name) : [],
      meet_at: meetUpValue?.name || meetUpValue,
      position: positionValue?.name || positionValue,
      looking_for: lookingForValue?.name,
      preference: userData?.preference,
      is_dob_edited: dobEdit,
      height: String(maxHeight),
      weight,
      married_status: maritalStatusValue?.id || maritalStatusValue,
      hiv_status: hivValue?.name || hivValue,
      last_tested: lastTestedDate,
      remind_me_to_get_tested: remindTestedDate,
      vaccination: vaccinationsValue?.name || vaccinationsValue,
      nsfw: NSFWValue?.name || NSFWValue,
      expectations: ExpectationsValue?.name || ExpectationsValue
    };



    updateProfileApi(apiData)
      .then(res => {
        setLoading(false);
        navigation.goBack();
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };


  const showAlert = () => {
    Alert.alert(
      '',
      'EXPLICIT CONTENT PROHIBITED', // Message of the alert
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel button pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: _selectImage,
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flex: 1 }}>
          <HeaderComp
            viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
            leftIcon={imagesPath.ic_back}
            onPressBack={() => navigation.goBack()}
          />
          <View style={styles.rowAlignedStyle}>
            <GradientText
              text={strings.editProfile}
              textStyle={styles.txtStyle}
              start={{ x: 0, y: 0.4 }}
              end={{ x: 0.4, y: 0.5 }}
            />
            <ButtonComp
              btnText={strings.save}
              onPressBtn={_onSave}
              btnView={{
                marginRight: moderateScale(20),
              }}
              btnStyle={{
                alignSelf: 'center',
                justifyContent: 'center',
                width: width / 2.5,
              }}
            />
          </View>
          <FlatList
            keyboardShouldPersistTaps={'always'}
            showsHorizontalScrollIndicator={false}
            ListHeaderComponent={
              <KeyboardAwareScrollView
                bounces={false}
                keyboardShouldPersistTaps={'always'}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}>
                <UploadPicView
                  selectImage={() => showAlert()}
                  profilePic={userData?.profile_image}
                />
                <TextInputComp
                  inputText={strings.name}
                  keyboardType="email-address"
                  value={name}
                  maxLength={20}
                  onChangeText={e => setName(e)}
                />

                <DobComp
                  isBack={props?.route?.params?.isBack}
                  value={dateOfBirth}
                  onPressDob={true}
                  onSelect={val => {
                    setDateOfBirth(val), setDobEdit(true);
                  }}
                  label={strings.dob}
                />

                <SingleSlider
                  sliderHeaderText={'Your Height'}
                  // isRequired
                  sliderMinValue={MIN_HEIGHT}
                  sliderMaxValue={MAX_HEIGHT}
                  rangeText={'ft'}
                  sliderValue={maxHeight}
                  setSliderValueFromChild={val => setMaxHeight(val)}
                  sliderWidth={width - moderateScale(100)}
                  textHeaderStyle={{ paddingHorizontal: moderateScale(4) }}
                />

                <TouchableOpacity
                  style={{
                    borderWidth: moderateScale(1.2),
                    width: '100%',
                    borderRadius: moderateScale(10),
                    borderColor: theme.colors.likePink,
                    marginTop: moderateScale(24),
                    paddingStart: moderateScale(16),
                    paddingEnd: moderateScale(16),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: moderateScale(0),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.8}
                  onPress={() => { }}>
                  <Text
                    style={{
                      ...commonStyles.font_14_medium,
                      textAlignVertical: 'center',
                      position: 'absolute',
                      top: moderateScale(-16),
                      left: moderateScale(24),
                      padding: moderateScale(6),
                      color: theme.colors.blackOpacity40,
                      backgroundColor: theme.colors.white,
                    }}>
                    {strings.ACCORDING_TO_ME}
                  </Text>
                  <TextInput
                    style={{
                      width: '100%',
                      minHeightheight: moderateScale(60),
                      marginTop: moderateScale(10),
                      paddingBottom: moderateScale(20),
                      color: theme.colors.black,
                      fontSize: moderateScale(15),
                    }}
                    placeholder="According to me"
                    multiline={true}
                    maxLength={150}
                    keyboardType="default"
                    value={aboutMe}
                    onChangeText={e => {
                      setAboutMe(e);
                    }}></TextInput>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    borderWidth: moderateScale(1.2),
                    width: '100%',
                    borderRadius: moderateScale(10),
                    borderColor: theme.colors.likePink,
                    marginTop: moderateScale(24),
                    paddingStart: moderateScale(16),
                    paddingEnd: moderateScale(16),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: moderateScale(0),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.8}
                  onPress={() => { }}>
                  <Text
                    style={{
                      ...commonStyles.font_14_medium,
                      textAlignVertical: 'center',
                      position: 'absolute',
                      top: moderateScale(-16),
                      left: moderateScale(24),
                      padding: moderateScale(6),
                      color: theme.colors.blackOpacity40,
                      backgroundColor: theme.colors.white,
                    }}>
                    Weight
                  </Text>
                  <TextInput
                    style={{
                      width: '100%',
                      minHeightheight: moderateScale(60),
                      marginTop: moderateScale(10),
                      paddingBottom: moderateScale(20),
                      color: theme.colors.black,
                      fontSize: moderateScale(15),
                    }}
                    placeholder="Enter your Weight in Pounds"
                    multiline={true}
                    maxLength={3}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={e => {
                      const formattedText = e.replace(/[^\w]/g, '');
                      setWeight(formattedText);
                    }}></TextInput>
                </TouchableOpacity>

                <SelectTextInputComp
                  title={'Your Body Type'}
                  value={bodyTypeValue?.name}
                  bottomSheetHeader={'Select Body Type'}
                  flatListData={bodyType}
                  setFlatListFromChild={data => setBodyType(data)}
                  setValueFromChild={val => setBodyTypeValue(val)}
                />

                <SelectTextInputComp
                  title={strings.relationShipStatus}
                  value={maritalStatusValue?.name}
                  bottomSheetHeader={strings.selectRelationStatus}
                  flatListData={maritalStatus}
                  setFlatListFromChild={data => setMaritalStatus(data)}
                  setValueFromChild={val => setMaritalStatusValue(val)}
                />

                <SelectTextInputComp
                  title={'Looking for'}
                  value={lookingForValue?.name}
                  bottomSheetHeader={'Select Looking For'}
                  flatListData={lookingFor}
                  setFlatListFromChild={data => setLookingFor(data)}
                  setValueFromChild={val => setLookingForValue(val)}
                />

                <SelectTextInputComp
                  title={'Preferences'}
                  value={positionValue?.name || positionValue}
                  bottomSheetHeader={'Select Position'}
                  flatListData={positionType}
                  setFlatListFromChild={data => setpositionType(data)}
                  setValueFromChild={val => setPositionValue(val)}
                />

                <SelectTextInputComp
                  title={'HIV Status'}
                  value={hivValue?.name || hivValue}
                  bottomSheetHeader={'Select HIV Status'}
                  flatListData={HIV_Status}
                  setFlatListFromChild={data => setHIV_Status(data)}
                  setValueFromChild={val => setHivValue(val)}
                />

                <SelectTextInputComp
                  title={'Tribes'}
                  value={
                    tribeValue && tribeValue.length > 0
                      ? (Array.isArray(tribeValue)
                        ? tribeValue.map(tribe => {
                          if (typeof tribe === 'string') {
                            // Clean up the string by removing brackets, quotes, slashes, and backslashes
                            return tribe
                              .replace(/[\[\]"]/g, '') // Remove brackets and quotes
                              .replace(/[\/\\]/g, '') // Remove forward and backward slashes
                              .replace(/\|/g, ', ') // Replace pipe with comma and space
                              .replace(/,+/g, ', ') // Replace multiple commas with single comma
                              .replace(/^,\s*/, '') // Remove leading comma and space
                              .replace(/,\s*$/, '') // Remove trailing comma and space
                              .trim(); // Remove extra whitespace
                          } else if (tribe && typeof tribe === 'object' && tribe.name) {
                            return tribe.name;
                          }
                          return '';
                        }).filter(tribe => tribe !== '').join(', ')
                        : typeof tribeValue === 'string'
                          ? tribeValue
                            .replace(/[\[\]"]/g, '') // Remove brackets and quotes
                            .replace(/[\/\\]/g, '') // Remove forward and backward slashes
                            .replace(/\|/g, ', ') // Replace pipe with comma and space
                            .replace(/,+/g, ', ') // Replace multiple commas with single comma
                            .replace(/^,\s*/, '') // Remove leading comma and space
                            .replace(/,\s*$/, '') // Remove trailing comma and space
                            .trim() // Remove extra whitespace
                          : tribeValue.name || 'Select Tribes')
                      : 'Select Tribes'
                  }
                  bottomSheetHeader={'Tribes'}
                  flatListData={tribes}
                  setFlatListFromChild={data => setTribes(data)}
                  setValueFromChild={val => setTribeValue(val)}
                  multiSelect={true}
                />

                {/* Meet at */}
                <SelectTextInputComp
                  title={'Meet At'}
                  value={meetUpValue?.name || meetUpValue}
                  bottomSheetHeader={'Meet At'}
                  flatListData={meetUpStates}
                  setFlatListFromChild={data => setMeetUpStates(data)}
                  setValueFromChild={val => setMeetUpValue(val)}
                />


                <SelectTextInputComp
                  title={'Accept NSFW Pics'}
                  value={NSFWValue?.name || NSFWValue}
                  bottomSheetHeader={'Accept NSFW Pics'}
                  flatListData={NSFW}
                  setFlatListFromChild={data => setNSFW(data)}
                  setValueFromChild={val => setNSFWValue(val)}
                />
                <SelectTextInputComp
                  title={'Expectations'}
                  value={ExpectationsValue?.name || ExpectationsValue}
                  bottomSheetHeader={'Expectations'}
                  flatListData={Expectations}
                  setFlatListFromChild={data => setExpectations(data)}
                  setValueFromChild={val => setExpectationsValue(val)}
                />

                <DobComp
                  isBack={props?.route?.params?.isBack}
                  value={lastTestedDate}
                  onPressDob={true}
                  minimumAge={0}
                  maximumAge={10}
                  placeholder="Select Last Tested Date"
                  onSelect={val => {
                    setLastTestedDate(val);
                  }}
                  label={'Last Tested'}
                />
                <DobComp
                  isBack={props?.route?.params?.isBack}
                  value={remindTestedDate}
                  onPressDob={true}
                  minimumAge={0}
                  maximumAge={10}
                  placeholder="Select When Remind Tested"
                  onSelect={val => {
                    setRemindTestedDate(val);
                  }}
                  label={'Remind me to get tested'}
                />

                <SelectTextInputComp
                  title={'Vaccinations'}
                  value={vaccinationsValue?.name || vaccinationsValue}
                  bottomSheetHeader={'Select Vaccinations'}
                  flatListData={vaccinations_Status}
                  setFlatListFromChild={data => setVaccinationsStatus(data)}
                  setValueFromChild={val => setVaccinationsValue(val)}
                />

                <TouchableOpacity
                  style={{
                    borderWidth: moderateScale(1.2),
                    width: '100%',
                    borderRadius: moderateScale(10),
                    borderColor: theme.colors.likePink,
                    marginTop: moderateScale(24),
                    paddingStart: moderateScale(16),
                    paddingEnd: moderateScale(16),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: moderateScale(0),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.8}
                  onPress={() => { }}>
                  <Text
                    style={{
                      ...commonStyles.font_14_medium,
                      textAlignVertical: 'center',
                      position: 'absolute',
                      top: moderateScale(-16),
                      left: moderateScale(24),
                      padding: moderateScale(6),
                      color: theme.colors.blackOpacity40,
                      backgroundColor: theme.colors.white,
                    }}>
                    Facebook Link
                  </Text>
                  <TextInput
                    style={{
                      width: '100%',
                      minHeightheight: moderateScale(60),
                      marginTop: moderateScale(10),
                      paddingBottom: moderateScale(20),
                      color: theme.colors.black,
                      fontSize: moderateScale(15),
                    }}
                    placeholder="Facebook Link"
                    multiline={true}
                    maxLength={100}
                    keyboardType="url"
                    value={faceBookLink}
                    onChangeText={e => {
                      setFaceBookLink(e);
                    }}></TextInput>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    borderWidth: moderateScale(1.2),
                    width: '100%',
                    borderRadius: moderateScale(10),
                    borderColor: theme.colors.likePink,
                    marginTop: moderateScale(24),
                    paddingStart: moderateScale(16),
                    paddingEnd: moderateScale(16),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: moderateScale(0),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.8}
                  onPress={() => { }}>
                  <Text
                    style={{
                      ...commonStyles.font_14_medium,
                      textAlignVertical: 'center',
                      position: 'absolute',
                      top: moderateScale(-16),
                      left: moderateScale(24),
                      padding: moderateScale(6),
                      color: theme.colors.blackOpacity40,
                      backgroundColor: theme.colors.white,
                    }}>
                    Instagram Link
                  </Text>
                  <TextInput
                    style={{
                      width: '100%',
                      minHeightheight: moderateScale(60),
                      marginTop: moderateScale(10),
                      paddingBottom: moderateScale(20),
                      color: theme.colors.black,
                      fontSize: moderateScale(15),
                    }}
                    placeholder="Instagram Link"
                    multiline={true}
                    maxLength={100}
                    keyboardType="default"
                    value={instagramLink}
                    onChangeText={e => {
                      setInstagramLink(e);
                    }}></TextInput>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    borderWidth: moderateScale(1.2),
                    width: '100%',
                    borderRadius: moderateScale(10),
                    borderColor: theme.colors.likePink,
                    marginTop: moderateScale(24),
                    paddingStart: moderateScale(16),
                    paddingEnd: moderateScale(16),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: moderateScale(0),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.8}
                  onPress={() => { }}>
                  <Text
                    style={{
                      ...commonStyles.font_14_medium,
                      textAlignVertical: 'center',
                      position: 'absolute',
                      top: moderateScale(-16),
                      left: moderateScale(24),
                      padding: moderateScale(6),
                      color: theme.colors.blackOpacity40,
                      backgroundColor: theme.colors.white,
                    }}>
                    {strings.LINKEDIN_LINK}
                  </Text>
                  <TextInput
                    style={{
                      width: '100%',
                      minHeightheight: moderateScale(60),
                      marginTop: moderateScale(10),
                      paddingBottom: moderateScale(20),
                      color: theme.colors.black,
                      fontSize: moderateScale(15),
                    }}
                    placeholder="Linkedin Link"
                    multiline={true}
                    maxLength={100}
                    keyboardType="default"
                    value={linkdinLink}
                    onChangeText={e => {
                      setLinkdinLink(e);
                    }}></TextInput>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    borderWidth: moderateScale(1.2),
                    width: '100%',
                    borderRadius: moderateScale(10),
                    borderColor: theme.colors.likePink,
                    marginTop: moderateScale(24),
                    paddingStart: moderateScale(16),
                    paddingEnd: moderateScale(16),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: moderateScale(0),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.8}
                  onPress={() => { }}>
                  <Text
                    style={{
                      ...commonStyles.font_14_medium,
                      textAlignVertical: 'center',
                      position: 'absolute',
                      top: moderateScale(-16),
                      left: moderateScale(24),
                      padding: moderateScale(6),
                      color: theme.colors.blackOpacity40,
                      backgroundColor: theme.colors.white,
                    }}>
                    Twitter Link
                  </Text>
                  <TextInput
                    style={{
                      width: '100%',
                      minHeightheight: moderateScale(60),
                      marginTop: moderateScale(10),
                      paddingBottom: moderateScale(20),
                      color: theme.colors.black,
                      fontSize: moderateScale(15),
                    }}
                    placeholder="Twitter Link"
                    multiline={true}
                    maxLength={100}
                    keyboardType="default"
                    value={twitterLink}
                    onChangeText={e => {
                      setTwitterLink(e);
                    }}></TextInput>
                </TouchableOpacity>

                {/* <SelectTextInputComp
              title={'Photos'}
              value={photoValue?.name || photoValue }
              bottomSheetHeader={'Select Photo Type'}
              flatListData={photoData}
              setFlatListFromChild={data => setphotoData(data)}
              setValueFromChild={val => setPhotoValue(val)}
            /> */}

                {/* <SelectTextInputComp
              title={'Do you have kids'}
              value={isChildrenValue?.name || isChildrenValue}
              bottomSheetHeader={'Do you have kids'}
              flatListData={isChildren}
              setFlatListFromChild={data => setIsChildren(data)}
              setValueFromChild={val => setIsChildrenValue(val)}
            /> */}

                <View style={styles.galleryView}>
                  <Text
                    style={{
                      ...commonStyles.font_14_bold,
                      color: theme.colors.black,
                    }}>
                    {strings.gallery}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(navigationString.ALL_GALLERY_IMAGES, {
                        showBottomBtn: true,
                      })
                    }
                    activeOpacity={0.9}
                    hitSlop={hitSlopProp}>
                    <Text style={styles.addStyle}>
                      {userData && userData?.photos && userData?.photos.length
                        ? strings.seeAll
                        : strings.add}
                    </Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAwareScrollView>
            }
            data={userData?.photos || []}
            extraData={userData?.photos || []}
            renderItem={renderGalleryImages}
            numColumns={2}
            keyExtractor={stableKeyExtractor}
            style={styles.flatListStyle}
            columnWrapperStyle={styles.flatListWrapperStyle}
            contentContainerStyle={{ paddingBottom: moderateScale(60) }}
          />
          <Loader isLoading={isLoading} />
        </KeyboardAwareScrollView>
      </View>
    </WrapperContainer>
  );
};

// define your styles
const getStyles = (theme, commonStyles, isDark) => StyleSheet.create({
  headerStyle: {
    paddingHorizontal: moderateScale(20),
  },
  container: {
    flexGrow: 1,
  },
  flatListWrapperStyle: {
    marginTop: moderateScale(14),
    justifyContent: 'space-around',
  },
  flatListStyle: {
    paddingHorizontal: moderateScale(16),
  },
  txtStyle: {
    ...commonStyles.font_26_bold,
    margin: moderateScale(16),
    color: isDark ? theme.colors.blackOpacity80 : theme.colors.themecolor2,
  },
  imgStyle: {
    position: 'absolute',
    zIndex: 2000,
    bottom: moderateScale(-6),
    right: moderateScale(-6),
  },
  imgView: {
    height: moderateScale(100),
    width: moderateScale(100),
    borderRadius: moderateScale(20),
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
    position: 'absolute',
    top: moderateScale(-16),
    left: moderateScale(24),
    padding: moderateScale(6),
    color: theme.colors.grey,
    fontSize: textScale(12),
    backgroundColor: 'white',
    fontFamily: fontFamily.medium,
  },
  crossView: {
    height: moderateScale(38),
    width: moderateScale(38),
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(24),
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  galleryView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: moderateScale(24),
    alignItems: 'center',
  },
  imageStyle: {
    height: moderateScale(190),
    width: moderateScale(142),
    borderRadius: moderateScale(8),
  },
  addStyle: {
    ...commonStyles.font_14_bold,
    color: theme.colors.black,
  },
  dobView: {
    borderColor: theme.colors.likePink,
    padding: moderateScale(14),
    borderWidth: moderateScale(1),
    height: moderateScale(58),
    borderRadius: moderateScale(12),
    marginTop: moderateScale(34),
    justifyContent: 'center',
  },
  dobHeader: {
    ...commonStyles.font_14_medium,
    position: 'absolute',
    top: moderateScale(-16),
    left: moderateScale(24),
    padding: moderateScale(6),
    color: theme.colors.themecolor2,
    backgroundColor: theme.colors.white,
    textTransform: 'uppercase',
  },
  dobValText: {
    ...commonStyles.font_14_medium,
    marginStart: moderateScale(12),
  },
  rowAlignedStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});

// make this component available to the app
export default CreateProfile;
