import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
// constants
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import colors from '../../styles/colors';
import { height, moderateScale, width } from '../../styles/responsiveSize';

// components
import MultiSliderComp from '../../Components/MultiSliderComp';
import ButtonComp from '../../Components/ButtonComp';
import HeaderComp from '../../Components/HeaderComp';
import SelectSliderComp from '../../Components/SelectSliderComp';
import SingleSlider from '../../Components/SingleSlider';
import ToggleComp from '../../Components/ToggleComp';
import WrapperContainer from '../../Components/WrapperContainer';
import {
  ApiError,
  GetAddressFromCoordinates,
  showError,
} from '../../utils/helperFunctions';
import navigationString from '../../constants/navigationString';
import { setPreferances } from '../../redux/reduxActions/authActions';
import { Loader } from '../../Components/Loader';
import BonkerBonksFilter, {
  SetLocationFilter,
} from '../../Components/BonkerBonksFilter';
import { useSelector } from 'react-redux';
import { LOOKING_FOR, MAX_AGE, MIN_AGE } from '../../utils/staticData';
import {
  BonkersFilterValidations,
  BonksFilterValidations,
} from '../../utils/validations';
import {
  setBonkersFiltersApi,
  setBonkFiltersApi,
} from '../../redux/reduxActions/homeActions';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle } from '../../constants/googleMapCredentials';
import GradientText from '../../Components/GradientText';
import FastImage from '../../utils/FastImageCompat';
import TextInputComp from '../../Components/TextInputComp';
import { getCommonStyles } from '../../styles/commonStyles';

const SetPreferencesAuth = ({ navigation, route }) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const selectedProfile = route?.params?.value;

  const userData = useSelector(state => state?.authReducers?.userData || {});
  const coords = useSelector(state => state?.authReducers?.coordinates || {});


  const [coordinates, setCoordinates] = useState(
    coords || {
      latitude: 30.7191,
      latitudeDelta: 0.03276390890841441,
      longitude: 76.8103,
      longitudeDelta: 0.042099952697753906,
    },
  );
  const [selectedAddress, setSelectedAddress] = useState('');
  const [fetchingAddLoader, setFetchingAddLoader] = useState(false);

  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [maxDistance, setMaxDistance] = useState(0);
  const [age, setAge] = useState([MIN_AGE, MAX_AGE]);
  const [maxHeight, setMaxHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [globalMatchingValue, setGlobalMatchingValue] = useState(false);
  const [bodyTypeValue, setBodyTypeValue] = useState({});
  // const [preferredGenderValue, setPreferredGenderValue] = useState({})
  const [smokersValue, setSmokersValue] = useState(false);
  const [sexualityValue, setSexualityValue] = useState({
    id: 2,
    isSelected: true,
    name: 'Straight',
  });
  const [tribesValue, setTribesValue] = useState({});
  const [nsfwValue, setNSFWValue] = useState({});
  const [meetUp, setMeetUp] = useState({});
  const [hairValue, setHairValue] = useState({});
  const [piercingValue, setPiercingValue] = useState(false);
  const [bedRoomAnticsValue, setBedRoomAnticsValue] = useState({});
  const [ink, setInk] = useState({});
  const [education, setEducation] = useState({});
  const [occupation, setOccupation] = useState({});
  const [children, setChildren] = useState({});
  const [pets, setPets] = useState(false);
  const [religion, setReligion] = useState({});
  const [foodie, setFoodie] = useState(false);
  const [drinking, setDrinking] = useState({});
  const [fitness, setFitness] = useState({});
  const [lifestyle, setLifeStyle] = useState({});
  const [drivingLicense, setDrivingLicense] = useState(false);
  const [personality, setPersonality] = useState({});
  const [languages, setLangugaes] = useState([]);
  const [hobies, setHobies] = useState([]);
  const [favPlaces, setFavPlaces] = useState([]);
  const [interests, setInterests] = useState([]);
  const [cuisin, setCuisin] = useState([]);
  const [isSmoker, setIsSmoker] = useState(false);
  const [starSign, setStarSign] = useState({});
  const [lookingFor, setLookingFor] = useState({});
  const [position, setPosition] = useState([]);
  const [fantasy, setFantasy] = useState([]);
  const [kink, setkink] = useState([]);
  const [maritalStatusValue, setMaritalStatusValue] = useState("");
  const [isChildrenValue, setIsChildrenValue] = useState("");
  const [maritalStatus, setMaritalStatus] = useState([
    { id: 1, name: 'Single' },
    {
      id: userData?.gender === 2 ? 2 : 3,
      name: userData?.gender === 2 ? 'Widow' : 'Widower',
    },
    { id: 4, name: 'Divorced' },
    { id: 5, name: 'Any' },
  ]);

  const _increase = () => {
   
    // if (maxDistance === 0) {
    //   showError('Please select your maximum distance preferences');
    //   return;
    // }
    _callApiFnc();
  };

  const _decrease = () => {
    if (index === 0) {
      navigation.goBack();
    } else {
      setIndex(index - 1);
    }
  };

  const _validations = () => {
    if (userData?.user_type == 1) {
      if (
        !BonkersFilterValidations(
          maxDistance,
          maxHeight,
          // preferredGenderValue,
          sexualityValue,
          bodyTypeValue,
          lookingFor,
          education,
          maritalStatusValue,
          tribesValue,
          nsfwValue,
          meetUp,
          weight,
          isChildrenValue
          // lifestyle
          // ink,
          // education,
          // occupation,
          // children,
          // religion
          // drinking,
          // fitness,
          // lifestyle,
          // personality,
          // languages,
          // hobies,
          // favPlaces,
          // interests,
          // cuisin,
          // starSign
        )
      ) {
        return;
      }
      return true;
    } else {
      if (
        !BonksFilterValidations(
          maxHeight,
          // weight,
          sexualityValue,
          lookingFor,
          // ink,
          // education,
          // occupation,
          // children,
          religion,
          position,
          fantasy,
          kink,
        )
      ) {
        return;
      }
      return true;
    }
  };

  const _callApiFnc = () => {
    const isValid = _validations();
    if (!isValid) return;

    const apiData = new FormData();
    apiData.append('looking_for', lookingFor?.name || LOOKING_FOR[0]);
    apiData.append('distance', maxDistance.toString());
    apiData.append('from_age', age[0]?.toString());
    apiData.append('to_age', age[1]?.toString());
    // apiData.append('is_location', globalMatchingValue ? 1 : 2 || 1)
    apiData.append('maximum_height', maxHeight);
    // apiData.append('ink', ink?.name || '')
    apiData.append('education', education?.name || '');
    apiData.append('occupation', occupation?.name || '');
    apiData.append('meet_at', meetUp?.name || '');
    apiData.append('nsfw_pics', nsfwValue?.name || '');
    apiData.append('weight', Number(weight) || '');
    apiData.append('tribes', tribesValue?.name || '');
    // apiData.append('children', children?.name || '')
    // apiData.append('pets', Number(pets))
    apiData.append('religion', 'any');
    // apiData.append('is_smoker', Number(isSmoker))
    // apiData.append('sexuality', sexualityValue?.id || '')
    // apiData.append('piercing', piercingValue ? 1 : 2)
    apiData.append('location', selectedAddress);
    apiData.append('lat', coordinates?.latitude || null);
    apiData.append('long', coordinates?.longitude || null);
    apiData.append('body_type', bodyTypeValue?.name || null);
    apiData.append('interested_in', userData?.gender === 1 ? 2 : 1);
    apiData.append('lifestyle', lifestyle?.id || '');
    apiData.append('sexuality', sexualityValue?.id || '');
    apiData.append(
      'married_status',
      Number(maritalStatusValue?.id )|| maritalStatusValue
    );
    apiData.append(
      'having_kids',
      isChildrenValue?.name || isChildrenValue
    );
    // return console.log(apiData, "returnreturnreturnreturnreturn");

    // const apiData = {
    //   interested_in: preferredGenderValue?.id,
    //   looking_for: userData?.filters?.looking_for || LOOKING_FOR[0],
    //   distance: maxDistance.toString(),
    //   from_age: age[0].toString(),
    //   to_age: age[1].toString(),
    //   is_location: globalMatchingValue ? '1' : '2',
    //   maximum_height: maxHeight,
    //   weight: Number(weight),
    //   body_type: bodyTypeValue?.name,
    //   is_smoker: smokersValue ? '1' : '2',
    //   tribes: tribesValue?.name,
    //   hair: hairValue?.name,
    //   sexuality: sexualityValue?.id,
    //   piercing: piercingValue ? '1' : '2',
    //   bedroom_antics: bedRoomAnticsValue?.id,
    // };

    // return console.log(apiData, 'api data im sending ======>>>>>>>>>>>>');
    navigation.navigate(navigationString.SETUP_COMPLETED,apiData)
    // setLoading(true);

    // const API_TYPE =
    //   userData?.user_type === 1
    //     ? setBonkersFiltersApi(apiData)
    //     : setBonkFiltersApi(apiData);

    // API_TYPE.then(res => {
    //   setLoading(false);
    //   navigation.navigate(navigationString.SETUP_COMPLETED)
    // }).catch(err => {
    //   console.log(err);
    //   showError(err?.message);
    //   setLoading(false);
    // });

    // setLoading(true);
    // setPreferances(apiData)
    //   .then(res => {
    //     console.log(res, 'response from api data ===>>>>>>>');
    // setLoading(false);
    // navigation.navigate(navigationString.SETUP_COMPLETED);
    //   })
    //   .catch(err => {
    //     showError(ApiError(err));
    //     console.log(err, 'error from api data ===>>>>>>>');
    //     setLoading(false);
    //   });
  };

  // useEffect(() => {
  //   GetAddressFromCoordinates(coordinates).then((res) => {
  //     setSelectedAddress(res)
  //     setFetchingAddLoader(false)
  //   }).catch((error) => {
  //     setFetchingAddLoader(false)
  //   })
  // }, [coordinates])

  const _indexOneView = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <BonkerBonksFilter
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          globalMatchingValue={globalMatchingValue}
          setGlobalMatchingValue={val => setGlobalMatchingValue(val)}
        />
        {/* <View style={{ paddingHorizontal: moderateScale(16) }}>
          <TextInputComp
            inputText={'Church'}
            // keyboardType="email-address"
            value={church}
            placeholder={'Enter church name'}
            maxLength={60}
            onChangeText={e => setChurch(e)}
          />
          <View style={{ height: 10 }} />
          <TextInputComp
            inputText={'Church worker role'}
            // keyboardType="email-address"
            value={churchRole}
            placeholder={'Enter church worker role'}
            maxLength={60}
            onChangeText={e => setChurchRole(e)}
          />
        </View> */}

        {/* <SetLocationFilter
          selectAddressFromChild={(address) => setSelectedAddress(address)}
          setCoordinatesFromChild={(coords) => setCoordinates(coords)}
        /> */}

        {/* <View>
          <Text style={{
            ...commonStyles.font_14_bold,
            width: '44%',
            color: colors.themecolor2,
            marginHorizontal: moderateScale(24),
            marginTop: moderateScale(24)
          }}>{'Set Location'}</Text>

          <View>
            <MapView
              initialRegion={coordinates}
              style={{
                marginHorizontal: moderateScale(24),
                marginTop: moderateScale(10),
                height: height / 2.5
              }}
              provider={PROVIDER_GOOGLE}
              customMapStyle={mapStyle}
              onRegionChange={() => {
                setSelectedAddress('')
                setFetchingAddLoader(true)
              }}
              onRegionChangeComplete={(cb) => {
                console.log(cb, 'onRegionChange')
                setCoordinates(cb)
              }}
            />

            <Image
              source={imagesPath.map_pin_pink}
              style={{
                marginTop: (height / 2.1) / 2.6,
                alignSelf: 'center',
                position: 'absolute'
              }}
            />
          </View>

          <View style={{
            marginHorizontal: moderateScale(24),
            borderWidth: 1,
            borderColor: colors.likePink,
            padding: moderateScale(12),
            borderRadius: moderateScale(8),
            marginTop: moderateScale(16),
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Image
              source={imagesPath.map_pin_pink}
            />

            {fetchingAddLoader
              ? <View style={{
              }}>
                <ActivityIndicator
                  size={'small'}
                  animating={fetchingAddLoader}
                  color={colors.likePink}
                  style={{ marginStart: width / 3.3 }}
                />
              </View>
              : <Text style={{
                ...commonStyles.font_14_SemiBold,
                color: colors.themecolor2,
                marginStart: moderateScale(8),
                width: '88%'
              }}>{selectedAddress}</Text>
            }
          </View>
        </View> */}
      </View>
    );
  };

  const _indexTwoView = () => {
    return (
      <View>
        <BonkerBonksFilter
          age={age}
          setAge={val => setAge(val)}
          maxHeight={maxHeight}
          maxDistance={maxDistance}
          weight={weight}
          setWeight={val => setWeight(val)}
          tribesValue={tribesValue}
          nsfwPicsValue={nsfwValue}
          setNsfwPicsValue={val => setNSFWValue(val) }
          setTribesValue={val => setTribesValue(val)}
          setMaxDistance={val => setMaxDistance(val)}
          setMaxHeight={val => setMaxHeight(val)}
          education={education}
          setEducation={val => setEducation(val)}
          meetUp={meetUp}
          setMeetUp={val => setMeetUp(val)}
          setChildren={val => setChildren(val)}
          bodyTypeValue={bodyTypeValue}
          setBodyTypeValue={val => setBodyTypeValue(val)}
          lookingFor={lookingFor}
          setLookingFor={val => setLookingFor(val)}
          martitalStatusArr={maritalStatus}
          maritalStatus={maritalStatusValue}
          setMaritalStatus={val => setMaritalStatusValue(val)}
          isChildren={isChildrenValue}
          setIsChildren={val => setIsChildrenValue(val)}
        />
      </View>
    );
  };

  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <HeaderComp
        leftIcon={imagesPath.ic_back}
        onPressBack={_decrease}
        viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
      />

      {/* <View
        style={{
          marginTop: moderateScale(32),
          // marginHorizontal: moderateScale(16),
          flexDirection: 'row',
          alignItems: 'center',
        }}> */}
        {/* <FastImage
          source={imagesPath.ic_appIcon}
          style={{
            height: moderateScale(50),
            width: width / 4,
          }}
          resizeMode={'contain'}
        /> */}
        {/* <GradientText
          text={userData?.user_type === 2
            ? strings.casualFun
            : strings.longtermDating}
          textStyle={{ ...commonStyles.font_14_SemiBold }}
          start={{ x: 0, y: 0.8 }}
          end={{ x: 0.8, y: 0.9 }}
        /> */}
      {/* </View> */}

      {/* <Text style={styles.topHeaderText}>
        {userData?.user_type === 2 ? strings.bonk : strings.bonkers} -{' '}
        <Text style={{ ...commonStyles.font_14_SemiBold, color: colors.themecolor2, opacity: 0.9 }}>
          {userData?.user_type === 2
            ? strings.casualFun
            : strings.longtermDating}
        </Text>
      </Text> */}

      {/* <Text style={styles.headerText}>{userData?.first_name + "'s " + strings.Preferences}</Text> */}
      <GradientText
        text={strings.set+ strings.Preferences}
        textStyle={styles.headerText}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.5, y: 0.9 }}
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
        style={styles.scrollViewStyle}>
        {_indexTwoView()}
      </ScrollView>
      <View style={styles.btnView}>
        <ButtonComp
          btnText={strings.set_preferances}
          onPressBtn={_increase}
          btnView={{backgroundColor: theme.colors.greenTheme}}
          txtStyle={{ color: theme.colors.primaryTxt }}
        />
      </View>
      <Loader isLoading={loading} />
    </WrapperContainer>
  );
};

export default SetPreferencesAuth;

const getStyles = (theme, commonStyles) => StyleSheet.create({
  scrollViewStyle: {
    flex: 1,
  },
  topHeaderText: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.blackOpacity90,
    marginTop: moderateScale(30),
    marginHorizontal: moderateScale(16),
    color: theme.colors.themecolor2,
  },
  headerText: {
    ...commonStyles.font_22_bold,
    marginTop: moderateScale(54),
    marginBottom: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    color: theme.colors.likePink,
  },
  btnView: {
    paddingBottom:
      Platform.OS === 'ios' ? moderateScale(30) : moderateScale(20),
    marginHorizontal: moderateScale(16),
  },
  contentContainerStyle: {
    // marginHorizontal: moderateScale(16),
    paddingBottom: moderateScale(30),
  },
});
