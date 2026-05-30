// import liraries
import React, {useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ButtonComp from '../../Components/ButtonComp';
import DropDownComp from '../../Components/DropDownComp';
import GradientText from '../../Components/GradientText';
import HeaderComp from '../../Components/HeaderComp';
import {Loader} from '../../Components/Loader';
import WrapperContainer from '../../Components/WrapperContainer';
import {CountriesAndStates} from '../../constants/CountriesAndStates';

import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';

import {height, moderateScale, width} from '../../styles/responsiveSize';
import {ApiError, showError} from '../../utils/helperFunctions';
import {
  createNewProfileApi,
  getOccupationSuggestions,
} from '../../redux/reduxActions/authActions';
import {setItem} from '../../utils/utils';
import {uploadProfilePicApi} from '../../redux/reduxActions/homeActions';
import {
  BODY_TYPE,
  EDUCATION,
  LOOKING_FOR,
  MAX_HEIGHT,
  MIN_HEIGHT,
  RELATIONSHIP_STATUS,
} from '../../utils/staticData';
import SingleSlider from '../../Components/SingleSlider';
import SelectSliderComp from '../../Components/SelectSliderComp';
import TextInputComp from '../../Components/TextInputComp';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SelectTextInputComp from '../../Components/SelectTextInputComp';
import {checkIsEmpty, checkLength} from '../../utils/validations';
import {enableFreeze} from 'react-native-screens';
import { getCommonStyles } from '../../styles/commonStyles';
import { useTheme } from '../../theme/ThemeProvider';
enableFreeze();
const AdditionalDetails = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyle(theme, commonStyles)
  const {navigation} = props;
  // const [suggestions, setSuggestions] = useState([])
  const [suggestionsData, setSuggestionsData] = useState({
    church_name: [],
    church_role: [],
    occupation: [],
  });
  const [churchSuggestions, setChurchSuggestions] = useState([]);
  const [churchRoleSuggestions, setChurchRoleSuggestions] = useState([]);
  const [occupationSuggestions, setOccupationSuggestions] = useState([]);
  const [searching, setSearching] = useState({
    church_name: false,
    church_role: false,
    occupation: false,
  });
  const [church, setChurch] = useState('');
  const [churchRole, setChurchRole] = useState('');
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [bodyType, setBodyType] = useState([
    {name: BODY_TYPE[0]},
    {name: BODY_TYPE[1]},
    {name: BODY_TYPE[2]},
    {name: BODY_TYPE[3]},
    {name: BODY_TYPE[4]},
    {name: BODY_TYPE[5]},
    {name: BODY_TYPE[6]}
    // { name: BODY_TYPE[4] }
  ]);
  const [maxHeight, setMaxHeight] = useState(4);
  const [bodyTypeValue, setBodyTypeValue] = useState({});
  const [educationValue, setEducationValue] = useState({});
  const [lookingForValue, setLookingForValue] = useState({});
  const [maritalStatusValue, setMaritalStatusValue] = useState({});
  const [isChildrenValue, setIsChildrenValue] = useState({});

  const [educationState, setEducationState] = useState([
    {name: EDUCATION[0]},
    {name: EDUCATION[1]},
    {name: EDUCATION[2]},
    {name: EDUCATION[3]},
    {name: EDUCATION[4]},
    {name: EDUCATION[5]},
    {name: EDUCATION[6]},
    {name: EDUCATION[7]},
    {name: EDUCATION[8]},
    // { name: EDUCATION[9] }
  ]);

  const [lookingFor, setLookingFor] = useState([
    {name: LOOKING_FOR[0]},
    {name: LOOKING_FOR[1]},
    {name: LOOKING_FOR[2]},
    {name: LOOKING_FOR[3]},
    {name: LOOKING_FOR[4]},
    {name: LOOKING_FOR[5]},
    {name: LOOKING_FOR[6]},
    // { name: LOOKING_FOR[3] }
  ]);

  const [maritalStatus, setMaritalStatus] = useState([
    {id:1,name: RELATIONSHIP_STATUS[0]},
    {id:2,name: RELATIONSHIP_STATUS[1]},
    {id:3,name: RELATIONSHIP_STATUS[2]},
    {id:4,name: RELATIONSHIP_STATUS[3]},
    {id:5, name: RELATIONSHIP_STATUS[4]},
    {id:6,name: RELATIONSHIP_STATUS[5]},
    {id:7,name: RELATIONSHIP_STATUS[6]},
    {id:8,name: RELATIONSHIP_STATUS[7]},
    {id:9,name: RELATIONSHIP_STATUS[8]}
  ]);

  const [isChildren, setIsChildren] = useState([{name: 'Yes'}, {name: 'No'}]);

  const _onContinue = () => {
    if (checkIsEmpty(church)) {
      return showError('Please enter church name');
    }
    if (checkIsEmpty(bio)) {
      return showError(strings.bioIsRequired);
    }
    if (checkLength(bio, 20) === false) {
      return showError(strings.EnterAtleast20WordsInBio);
    }
    if (checkIsEmpty(occupation)) {
      return showError(strings.OccupationIsRequired);
    }
    if (!bodyTypeValue?.name) {
      showError('Please select your body type');
      return;
    }
    if (!educationValue?.name) {
      showError('Please select your highest education level');
      return;
    }
    if (!lookingForValue?.name) {
      showError('Please select looking for');
      return;
    }
    if (!maritalStatusValue?.name) {
      showError('Please select relationship status');
      return;
    }
    if (!isChildrenValue?.name) {
      showError('Please select kids status');
      return;
    }
    if (height === 0) {
      showError('Your height must be greater than zero');
      return;
    }

    const prevData = {
      ...props?.route?.params?.prevData,
      body_type: bodyTypeValue?.name,
      education: educationValue?.name,
      looking_for: lookingForValue?.name,
      height: maxHeight,
      bio,
      occupation,
      church_role: churchRole,
      church_name: church,
      married_status: maritalStatusValue?.id,
      having_kids: isChildrenValue?.name,
      country: currCountry,
      state: selectedState
    };

    // _hitApi(prevData)

    navigation.navigate(navigationString.PREFERENCES_SCREEN, {
      prevData,
    });
  };

  const _hitApi = prevData => {
    const apiData = {
      church_name: prevData?.church_name || '',
      church_role: prevData?.church_role || '',
      first_name: prevData?.name || '',
      user_name: prevData?.user_name || '',
      email: prevData?.email || '',
      country_code: prevData?.country_code || '',
      country_flag: prevData?.country_flag || '',
      phone_number: prevData?.phone_number || '',
      password: prevData?.password || '',
      dob: prevData?.dob || '',
      country: prevData?.country || '',
      city: prevData?.state || '',
      user_type: 1,
      device_type: Platform.OS,
      device_token: '12345',
      bio: prevData?.bio || '',
      occupation: prevData?.occupation || '',
      gender:
        prevData?.gender.toLowerCase() === 'men'
          ? '2'
          : prevData?.gender.toLowerCase() === 'women'
          ? '1'
          : '3' || 2,
      body_type: prevData?.body_type,
      education: prevData?.education,
      looking_for: prevData?.looking_for,
      height: prevData?.height,
    };
    console.log(apiData, 'resresresresresres');
    return;
  };

  const _updateProfilePic = prevData => {
    const _formData = new FormData();
    _formData.append('image', {
      uri: prevData?.profile_image?.path,
      name: 'image.png',
      fileName: 'filename',
      type: 'image/png',
    });
    _formData.append('with_thumb', true);

    setItem('PROFILE_BASE_64', prevData?.profile_image?.data);

    uploadProfilePicApi(_formData)
      .then(res => {
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const onChangeBio = val => {
    let text = val;
    text = text.replace(/[0-9]/g, '');
    text = text.replace(
      /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g,
      '',
    );
    setBio(text);
  };

  const getSuggestions = (val, search) => {
    setSearching({...searching, ...(searching[val] = true)});
    const apiData = {
      search,
      type: val,
    };
    if (val === 'occupation') {
      setOccupation(search);
    } else if (val === 'church_name') {
      setChurch(search);
    } else if (val === 'church_role') {
      setChurchRole(search);
    }
    if (search) {
      getOccupationSuggestions(apiData)
        .then(res => {
          console.log(res);
          if (val === 'occupation') {
            setChurchSuggestions([]);
            setOccupationSuggestions(res?.data);
            setChurchRoleSuggestions([]);
          } else if (val === 'church_name') {
            setChurchSuggestions(res?.data);
            setOccupationSuggestions([]);
            setChurchRoleSuggestions([]);
          } else if (val === 'church_role') {
            setChurchSuggestions([]);
            setOccupationSuggestions([]);
            setChurchRoleSuggestions(res?.data);
          }
          setSearching({...searching, ...(searching[val] = false)});
        })
        .catch(err => {
          console.log(err);
          setChurchSuggestions([]);
          setOccupationSuggestions([]);
          setChurchRoleSuggestions([]);
          setSearching({...searching, ...(searching[val] = false)});
        });
    } else {
      setChurchSuggestions([]);
      setOccupationSuggestions([]);
      setChurchRoleSuggestions([]);
      setSearching({...searching, ...(searching[val] = false)});
    }
  };

  console.log(suggestionsData, 'seracginf ===>>>>plplpl');

  const _anotherComp = () => {
    return (
      <ActivityIndicator
        color={theme.colors.themecolor2}
        style={{paddingRight: moderateScale(12)}}
      />
    );
  };

  return (
    <WrapperContainer paddingAvailable={false}>
      <KeyboardAwareScrollView
        bounces={false}
        keyboardShouldPersistTaps={'always'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        <View style={{paddingHorizontal: moderateScale(16)}}>
          <HeaderComp
            onPressBack={() => navigation.goBack()}
            leftIcon={imagesPath.ic_back}
            onPressRightText={() =>
              navigation.navigate(navigationString.SETTINGSCREEN)
            }
          />
          <View style={{marginHorizontal: moderateScale(10)}}>
            {/* <Text style={styles.headerText}>{strings.Location}</Text> */}
            <GradientText
              text={'Additional Details'}
              textStyle={styles.headerText}
              start={{x: 0, y: 0.5}}
              end={{x: 0.5, y: 0.7}}
            />
            <Text
              style={{
                ...commonStyles.font_14_medium,
                paddingVertical: moderateScale(4),
              }}>
              Just a few more details to create your profile.
            </Text>
          </View>
        </View>
        <View style={{paddingHorizontal: moderateScale(4)}}>
          <SingleSlider
            sliderHeaderText={'Your Height'}
            // isRequired
            sliderMinValue={MIN_HEIGHT}
            sliderMaxValue={MAX_HEIGHT}
            rangeText={'ft'}
            sliderValue={maxHeight}
            setSliderValueFromChild={val => setMaxHeight(val)}
            sliderWidth={width - moderateScale(50)}
            textHeaderStyle={{paddingHorizontal: moderateScale(4)}}
          />

          <View style={{paddingHorizontal: moderateScale(16)}}>
            <TextInputComp
              inputText={'Church'}
              // keyboardType="email-address"
              value={church}
              placeholder={'Enter church name'}
              maxLength={60}
              suggestionsData={churchSuggestions}
              onPressSuggestion={val => {
                setChurch(val);
                setChurchSuggestions([]);
                setOccupationSuggestions([]);
                setChurchRoleSuggestions([]);
                setSearching({
                  ...searching,
                  ...(searching.church_role = false),
                });
              }}
              onChangeText={e => {
                // setOccupation(e), getSuggestions('occupation')
                getSuggestions('church_name', e);
              }}
              // onChangeText={e => setChurch(e)}
              _anotherComp={searching.church_name && _anotherComp()}
            />
            <TextInputComp
              inputText={'Church worker role'}
              // keyboardType="email-address"
              value={churchRole}
              placeholder={'Enter church worker role (Optional)'}
              maxLength={60}
              onChangeText={e => {
                // setOccupation(e), getSuggestions('occupation')
                getSuggestions('church_role', e);
              }}
              onPressSuggestion={val => {
                setChurchRole(val);
                setChurchSuggestions([]);
                setOccupationSuggestions([]);
                setChurchRoleSuggestions([]);
                setSearching({
                  ...searching,
                  ...(searching.church_role = false),
                });
              }}
              // onChangeText={e => setChurchRole(e)}
              suggestionsData={churchRoleSuggestions}
              _anotherComp={searching.church_role && _anotherComp()}
            />

            <TextInputComp
              inputText={strings.Bio}
              value={bio}
              multiline={true}
              textInputStyle={{
                minHeight: moderateScale(80),
                marginVertical: moderateScale(10),
              }}
              maxLength={500}
              placeholder={'Enter bio'}
              onChangeText={e => onChangeBio(e)}
            />

            <TextInputComp
              inputText={strings.occupation}
              value={occupation}
              maxLength={100}
              placeholder={'Enter your occupation'}
              onPressSuggestion={val => {
                setOccupation(val);
                setChurchSuggestions([]);
                setOccupationSuggestions([]);
                setChurchRoleSuggestions([]);
                setSearching({...searching, ...(searching.occupation = false)});
              }}
              onChangeText={e => {
                // setOccupation(e), getSuggestions('occupation')
                getSuggestions('occupation', e);
              }}
              suggestionsData={occupationSuggestions}
              _anotherComp={searching.occupation && _anotherComp()}
            />

            <SelectTextInputComp
              title={'Your Body Type'}
              value={bodyTypeValue?.name}
              bottomSheetHeader={'Select Body Type'}
              flatListData={bodyType}
              setFlatListFromChild={data => setBodyType(data)}
              setValueFromChild={val => setBodyTypeValue(val)}
            />

            <SelectTextInputComp
              title={'Your Education'}
              value={educationValue?.name}
              bottomSheetHeader={'Select Education Level'}
              flatListData={educationState}
              setFlatListFromChild={data => setEducationState(data)}
              setValueFromChild={val => setEducationValue(val)}
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
              title={strings.relationShipStatus}
              value={maritalStatusValue?.name}
              bottomSheetHeader={strings.selectRelationStatus}
              flatListData={maritalStatus}
              setFlatListFromChild={data => setMaritalStatus(data)}
              setValueFromChild={val => setMaritalStatusValue(val)}
            />

            <SelectTextInputComp
              title={'Do you have kids'}
              value={isChildrenValue?.name}
              bottomSheetHeader={'Do you have kids'}
              flatListData={isChildren}
              setFlatListFromChild={data => setIsChildren(data)}
              setValueFromChild={val => setIsChildrenValue(val)}
            />
          </View>
        </View>

        {/* <View style={styles.btnStyle}>
        <DropDownComp
          label={strings.country}
          fetchData={fetchStates}
          value={currCountry}
          dropDownData={allCountries}
          centerText={strings.selectYourCountry}
          onPressItem={(item, name) => onPressItem(item, name)}
          name={strings.countries}
          placeholder={strings.selectYourCountry}
        />
        <DropDownComp
          label={strings.state}
          value={selectedState}
          dropDownData={currentCountryStates}
          centerText={strings.selectYourState}
          onPressItem={(item, name) => setSelectedState(item?.name)}
          name={strings.state}
          placeholder={strings.selectYourState}
        />
      </View> */}
        <View style={styles.btnView}>
          <ButtonComp
            onPressBtn={_onContinue}
            btnText={strings.continue}
            btnView={styles.continueView}
            btnStyle={{
              marginHorizontal: moderateScale(16),
              marginTop: moderateScale(40),
            }}
          />
        </View>
      </KeyboardAwareScrollView>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

const getStyle = (theme, commonStyles) => StyleSheet.create({
  continueView: {
    position: 'absolute',
  },
  headerText: {
    ...commonStyles.font_34_bold,
    marginTop: moderateScale(32),
  },
  btnStyle: {
    marginTop: moderateScale(48),
    marginHorizontal: moderateScale(4),
  },
  btnView: {
    flex: 1,
    marginBottom: moderateScale(110),
    justifyContent: 'flex-end',
  },
});

// make this component available to the app
export default AdditionalDetails;
