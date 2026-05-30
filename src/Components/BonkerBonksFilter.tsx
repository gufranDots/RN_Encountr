import React, {useCallback, useEffect, useState, FC} from 'react';
import {ActivityIndicator, Image, Keyboard, Text, View, TouchableOpacity} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {useSelector} from 'react-redux';
import {GOOGLE_MAPS_KEY, mapStyle} from '../constants/googleMapCredentials';
import imagesPath from '../constants/imagesPath';
import strings from '../constants/Languages';
import colors from '../styles/colors';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
  width,
} from '../styles/responsiveSize';
import {GetAddressFromCoordinates} from '../utils/helperFunctions';
import {
  BODY_TYPE,
  CHILDREN,
  CUISIN,
  DRINKING,
  EDUCATION,
  ENCOUNTR_POSITION,
  FANTASY,
  FAVOURITE_PLACE,
  FITNESS,
  GENDERS,
  HAIRS,
  HAS_PHOTOS,
  HOBBIES,
  INK,
  INTERESTS,
  KINK,
  LANGUAGES,
  LIFE_STYLE,
  LOOKING_FOR,
  MAX_AGE,
  MAX_DISTANCE,
  MAX_HEIGHT,
  MAX_WEIGHT,
  MEET_AT,
  MIN_AGE,
  MIN_DISTANCE,
  MIN_HEIGHT,
  MIN_WEIGHT,
  NSFW_PICS,
  OCCUPATION,
  PERSONALITY,
  POSITIONS,
  PREFERENCES,
  RELATIONSHIP_STATUS,
  RELIGION,
  SEXUALITY,
  ZODIAC_SIGN,
} from '../utils/staticData';
import MultiSliderComp from './MultiSliderComp';
import SelectSliderComp from './SelectSliderComp';
import SingleSlider from './SingleSlider';
import ToggleComp from './ToggleComp';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import SelectPositionComp from './SelectPositionComp';
import fontFamily from '../styles/fontFamily';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

interface BonkerBonksFilterProps {
  maxDistance?: number;
  setMaxDistance?: (value: number) => void;
  globalMatchingValue?: number;
  setGlobalMatchingValue?: (value: number) => void;
  age?: [number, number];
  setAge?: (value: any) => void;
  maxHeight?: [number, number];
  setMaxHeight?: (value: any) => void;
  weight?: [number, number];
  setWeight?: (value: any) => void;
  bodyTypeValue?: any[];
  setBodyTypeValue?: (value: any) => void;
  preferredGenderValue?: any[];
  setPreferredGenderValue?: (value: any) => void;
  smokersValue?: any[];
  setSmokersValue?: (value: any) => void;
  sexualityValue?: any[];
  setSexualityValue?: (value: any) => void;
  tribesValue?: any[];
  setTribesValue?: (value: any) => void;
  nsfwPicsValue?: any[];
  setNsfwPicsValue?: (value: any) => void;
  hairValue?: any[];
  setHairValue?: (value: any) => void;
  piercingValue?: any[];
  setPiercingValue?: (value: any) => void;
  bedRoomAnticsValue?: any[];
  setBedRoomAnticsValue?: (value: any) => void;
  lookingFor?: any[];
  setLookingFor?: (value: any) => void;
  ink?: any[];
  setInk?: (value: any) => void;
  education?: any[];
  setEducation?: (value: any) => void;
  meetUp?: any[];
  setMeetUp?: (value: any) => void;
  occupation?: any[];
  setOccupation?: (value: any) => void;
  children?: any[];
  setChildren?: (value: any) => void;
  pets?: any[];
  setPets?: (value: any) => void;
  religion?: any[];
  setReligion?: (value: any) => void;
  isSmoker?: any[];
  setIsSmoker?: (value: any) => void;
  position?: any[];
  setPosition?: (value: any) => void;
  fantasy?: any[];
  setFantasy?: (value: any) => void;
  kink?: any[];
  setkink?: (value: any) => void;
  foodie?: any[];
  setFoodie?: (value: any) => void;
  drinking?: any[];
  setDrinking?: (value: any) => void;
  fitness?: any[];
  setFitness?: (value: any) => void;
  lifestyle?: any[];
  setLifeStyle?: (value: any) => void;
  drivingLicense?: any[];
  setDrivingLicense?: (value: any) => void;
  personality?: any[];
  setPersonality?: (value: any) => void;
  languages?: any[];
  setLanguages?: (value: any) => void;
  hobies?: any[];
  setHobies?: (value: any) => void;
  favPlaces?: any[];
  setFavPlaces?: (value: any) => void;
  interests?: any[];
  setInterests?: (value: any) => void;
  cuisin?: any[];
  setCuisin?: (value: any) => void;
  starSign?: any[];
  setStarSign?: (value: any) => void;
  preference?: any[];
  setPreference?: (value: any) => void;
  maritalStatus?: any[];
  setMaritalStatus?: (value: any) => void;
  isChildren?: any[];
  setIsChildren?: (value: any) => void;
  martitalStatusArr?: any[];
  isChildrenStatusArr?: any[];
  encountrPosition?: any[];
  setEncountrPosition?: (value: any) => void;
  hasPhotos?: any[];
  setHasPhotos?: (value: any) => void;
}

const BonkerBonksFilter: FC<BonkerBonksFilterProps> = ({
  maxDistance,
  setMaxDistance,

  globalMatchingValue,
  setGlobalMatchingValue,

  age,
  setAge,

  maxHeight,
  setMaxHeight,

  weight,
  setWeight,

  bodyTypeValue,
  setBodyTypeValue,

  preferredGenderValue,

  setPreferredGenderValue,

  smokersValue,
  setSmokersValue,

  sexualityValue,
  setSexualityValue,

  tribesValue,
  setTribesValue,

  nsfwPicsValue,
  setNsfwPicsValue,

  hairValue,
  setHairValue,

  piercingValue,
  setPiercingValue,

  bedRoomAnticsValue,
  setBedRoomAnticsValue,

  lookingFor,
  setLookingFor,

  ink,
  setInk,

  education,
  setEducation,

  meetUp,
  setMeetUp,

  occupation,
  setOccupation,

  children,
  setChildren,

  pets,
  setPets,

  religion,
  setReligion,

  isSmoker,
  setIsSmoker,

  position,
  setPosition,

  fantasy,
  setFantasy,

  kink,
  setkink,

  foodie,
  setFoodie,

  drinking,
  setDrinking,

  fitness,
  setFitness,

  lifestyle,
  setLifeStyle,

  drivingLicense,
  setDrivingLicense,

  personality,
  setPersonality,

  languages,
  setLanguages,

  hobies,
  setHobies,

  favPlaces,
  setFavPlaces,

  interests,
  setInterests,

  cuisin,
  setCuisin,

  starSign,
  setStarSign,

  preference,
  setPreference,

  maritalStatus,
  setMaritalStatus,

  isChildren,
  setIsChildren,

  martitalStatusArr,
  isChildrenStatusArr,
  encountrPosition,
  setEncountrPosition,
  hasPhotos,
  setHasPhotos
}) => {
  const {theme} = useTheme();
  const [bodyType, setBodyType] = useState([
    {name: BODY_TYPE[0]},
    {name: BODY_TYPE[1]},
    {name: BODY_TYPE[2]},
    {name: BODY_TYPE[3]},
    {name: BODY_TYPE[4]},
    {name: BODY_TYPE[5]},
    {name: BODY_TYPE[6]},
  ]);
  const [preferredGender, setPreferredGender] = useState([
    {id: 1, name: GENDERS[0]},
    {id: 2, name: GENDERS[1]},
    {id: 3, name: GENDERS[2]},
    {id: 4, name: GENDERS[3]},
  ]);
  const [sexuality, setSexuality] = useState([
    {id: 1, name: SEXUALITY[0]},
    {id: 2, name: SEXUALITY[1]},
    {id: 3, name: SEXUALITY[2]},
    {id: 4, name: SEXUALITY[3]},
    {id: 5, name: SEXUALITY[4]},
    {id: 6, name: SEXUALITY[5]},
    {id: 7, name: SEXUALITY[6]},
    {id: 8, name: SEXUALITY[7]},
    {id: 9, name: SEXUALITY[8]},
    // { id: 10, name: SEXUALITY[9] },
    // { id: 11, name: SEXUALITY[10] },
  ]);
  const [NSFWArray, setNSFWArray] = useState([
    {id: 1, name: NSFW_PICS[0]},
    {id: 2, name: NSFW_PICS[1]},
    {id: 3, name: NSFW_PICS[2]},
    {id: 4, name: NSFW_PICS[3]},
  ]);
  const [bedRoomAntics, setBedRoomAntics] = useState([
    {id: 1, name: SEXUALITY[0]},
    {id: 2, name: SEXUALITY[1]},
    {id: 3, name: SEXUALITY[2]},
    {id: 4, name: SEXUALITY[3]},
  ]);
  const [tribes, setTribes] = useState([
    {id: 1, name: SEXUALITY[0]},
    {id: 2, name: SEXUALITY[1]},
    {id: 3, name: SEXUALITY[2]},
    {id: 4, name: SEXUALITY[3]},
    {id: 5, name: SEXUALITY[4]},
    {id: 6, name: SEXUALITY[5]},
    {id: 7, name: SEXUALITY[6]},
    {id: 8, name: SEXUALITY[7]},
    {id: 9, name: SEXUALITY[8]},
    {id: 10, name: SEXUALITY[9]},
    {id: 11, name: SEXUALITY[10]},
    {id: 12, name: SEXUALITY[11]},
    {id: 13, name: SEXUALITY[12]},
    {id: 14, name: SEXUALITY[13]},
    {id: 15, name: SEXUALITY[14]},
    {id: 16, name: SEXUALITY[15]},
    {id: 17, name: SEXUALITY[16]},
    {id: 18, name: SEXUALITY[17]},
    {id: 19, name: SEXUALITY[18]},
    {id: 20, name: SEXUALITY[19]},
  ]);
  const [hair, setHairs] = useState([{name: HAIRS[0]}, {name: HAIRS[1]}]);
  const [lookingForState, setLookingForState] = useState([
    {name: LOOKING_FOR[0]},
    {name: LOOKING_FOR[1]},
    {name: LOOKING_FOR[2]},
    {name: LOOKING_FOR[3]},
    {name: LOOKING_FOR[4]},
    {name: LOOKING_FOR[5]},
    {name: LOOKING_FOR[6]},
  ]);
  const [inkState, setInkState] = useState([
    {name: INK[0]},
    {name: INK[1]},
    {name: INK[2]},
  ]);
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
    {name: EDUCATION[9]},
  ]);
  const [occupState, setOccupState] = useState([
    {name: OCCUPATION[0]},
    {name: OCCUPATION[1]},
    {name: OCCUPATION[2]},
    {name: OCCUPATION[3]},
  ]);
  const [child, setChild] = useState([
    {name: CHILDREN[0]},
    {name: CHILDREN[1]},
    {name: CHILDREN[2]},
    {name: CHILDREN[3]},
  ]);
  const [religionVal, setReligionVal] = useState([
    {name: RELIGION[0]},
    {name: RELIGION[1]},
    {name: RELIGION[2]},
    {name: RELIGION[3]},
    {name: RELIGION[4]},
    {name: RELIGION[5]},
    {name: RELIGION[6]},
    {name: RELIGION[7]},
    {name: RELIGION[8]},
    {name: RELIGION[9]},
    {name: RELIGION[10]},
    {name: RELIGION[11]},
    {name: RELIGION[12]},
    {name: RELIGION[13]},
    {name: RELIGION[14]},
    {name: RELIGION[15]},
    {name: RELIGION[16]},
    {name: RELIGION[17]},
    {name: RELIGION[18]},
    {name: RELIGION[19]},
    {name: RELIGION[20]},
  ]);
  const [positionVal, setPositionVal] = useState([
    {id: 1, name: POSITIONS[0]},
    {id: 2, name: POSITIONS[1]},
    {id: 3, name: POSITIONS[2]},
    {id: 4, name: POSITIONS[3]},
    {id: 5, name: POSITIONS[4]},
    {id: 6, name: POSITIONS[5]},
    {id: 7, name: POSITIONS[6]},
    {id: 8, name: POSITIONS[7]},
    {id: 9, name: POSITIONS[8]},
  ]);
  
  const [fantasyVal, setFantasyVal] = useState([
    {id: 1, name: FANTASY[0]},
    {id: 2, name: FANTASY[1]},
    {id: 3, name: FANTASY[2]},
    {id: 4, name: FANTASY[3]},
    {id: 5, name: FANTASY[4]},
    {id: 6, name: FANTASY[5]},
    {id: 7, name: FANTASY[6]},
    {id: 8, name: FANTASY[7]},
    {id: 9, name: FANTASY[8]},
  ]);
  const [kinkVal, setKinkVal] = useState([
    {id: 1, name: KINK[0]},
    {id: 2, name: KINK[1]},
    {id: 3, name: KINK[2]},
    {id: 4, name: KINK[3]},
    {id: 5, name: KINK[4]},
    {id: 6, name: KINK[5]},
    {id: 7, name: KINK[6]},
    {id: 8, name: KINK[7]},
  ]);
  const [drinkingVal, setDrinkingVal] = useState([
    {id: 1, name: DRINKING[0]},
    {id: 2, name: DRINKING[1]},
    {id: 3, name: DRINKING[2]},
    {id: 4, name: DRINKING[3]},
    {id: 4, name: DRINKING[4]},
  ]);
  const [fitnessVal, setFitnessVal] = useState([
    {id: 1, name: FITNESS[0]},
    {id: 2, name: FITNESS[1]},
    {id: 3, name: FITNESS[2]},
    {id: 4, name: FITNESS[3]},
  ]);
  const [lifeStyleVal, setlifeStyleVal] = useState([
    {id: 1, name: LIFE_STYLE[0]},
    {id: 2, name: LIFE_STYLE[1]},
    {id: 3, name: LIFE_STYLE[2]},
    {id: 4, name: LIFE_STYLE[3]},
    {id: 5, name: LIFE_STYLE[4]},
    {id: 6, name: LIFE_STYLE[5]},
  ]);
  const [personalityVal, setPersonalityVal] = useState([
    {id: 1, name: PERSONALITY[0]},
    {id: 2, name: PERSONALITY[1]},
    {id: 3, name: PERSONALITY[2]},
    {id: 4, name: PERSONALITY[3]},
  ]);
  const [languagesVal, setLanguagesVal] = useState([
    {id: 1, name: LANGUAGES[0]},
    {id: 2, name: LANGUAGES[1]},
    {id: 3, name: LANGUAGES[2]},
    {id: 4, name: LANGUAGES[3]},
    {id: 5, name: LANGUAGES[4]},
    {id: 6, name: LANGUAGES[5]},
    {id: 7, name: LANGUAGES[6]},
    {id: 8, name: LANGUAGES[7]},
    {id: 9, name: LANGUAGES[8]},
    {id: 10, name: LANGUAGES[9]},
    {id: 11, name: LANGUAGES[10]},
    {id: 12, name: LANGUAGES[11]},
    {id: 13, name: LANGUAGES[12]},
    {id: 14, name: LANGUAGES[13]},
    {id: 15, name: LANGUAGES[14]},
    {id: 16, name: LANGUAGES[15]},
    {id: 17, name: LANGUAGES[16]},
    {id: 18, name: LANGUAGES[17]},
    {id: 19, name: LANGUAGES[18]},
    {id: 20, name: LANGUAGES[19]},
    {id: 21, name: LANGUAGES[20]},
    {id: 22, name: LANGUAGES[21]},
    {id: 23, name: LANGUAGES[22]},
    {id: 24, name: LANGUAGES[23]},
    {id: 25, name: LANGUAGES[24]},
  ]);
  const [hobbiesVal, setHobbiesVal] = useState([
    {id: 1, name: HOBBIES[0]},
    {id: 2, name: HOBBIES[1]},
    {id: 3, name: HOBBIES[2]},
    {id: 4, name: HOBBIES[3]},
    {id: 5, name: HOBBIES[4]},
    {id: 6, name: HOBBIES[5]},
    {id: 7, name: HOBBIES[6]},
    {id: 8, name: HOBBIES[7]},
    {id: 9, name: HOBBIES[8]},
    {id: 10, name: HOBBIES[9]},
    {id: 11, name: HOBBIES[10]},
    {id: 12, name: HOBBIES[11]},
    {id: 13, name: HOBBIES[12]},
    {id: 14, name: HOBBIES[13]},
    {id: 15, name: HOBBIES[14]},
    {id: 16, name: HOBBIES[15]},
  ]);
  const [favPlacesVal, setFavPlacesVal] = useState([
    {id: 1, name: FAVOURITE_PLACE[0]},
    {id: 2, name: FAVOURITE_PLACE[1]},
    {id: 3, name: FAVOURITE_PLACE[2]},
    {id: 4, name: FAVOURITE_PLACE[3]},
    {id: 5, name: FAVOURITE_PLACE[4]},
    {id: 6, name: FAVOURITE_PLACE[5]},
    {id: 7, name: FAVOURITE_PLACE[5]},
    {id: 8, name: FAVOURITE_PLACE[6]},
    {id: 9, name: FAVOURITE_PLACE[7]},
    {id: 10, name: FAVOURITE_PLACE[8]},
    {id: 11, name: FAVOURITE_PLACE[9]},
    {id: 12, name: FAVOURITE_PLACE[10]},
    {id: 13, name: FAVOURITE_PLACE[11]},
  ]);
  const [interestsVal, setInterestsVal] = useState([
    {id: 0, name: INTERESTS[0]},
    {id: 1, name: INTERESTS[1]},
    {id: 2, name: INTERESTS[2]},
    {id: 3, name: INTERESTS[3]},
    {id: 4, name: INTERESTS[4]},
    {id: 5, name: INTERESTS[5]},
    {id: 6, name: INTERESTS[6]},
    {id: 7, name: INTERESTS[7]},
    {id: 8, name: INTERESTS[8]},
    {id: 9, name: INTERESTS[9]},
    {id: 10, name: INTERESTS[10]},
    {id: 11, name: INTERESTS[11]},
    {id: 12, name: INTERESTS[12]},
    {id: 13, name: INTERESTS[13]},
    {id: 14, name: INTERESTS[14]},
    {id: 15, name: INTERESTS[15]},
  ]);
  const [cuisineVal, setCuisineVal] = useState([
    {id: 0, name: CUISIN[0]},
    {id: 1, name: CUISIN[1]},
    {id: 2, name: CUISIN[2]},
    {id: 3, name: CUISIN[3]},
    {id: 4, name: CUISIN[4]},
    {id: 5, name: CUISIN[5]},
    {id: 6, name: CUISIN[6]},
    {id: 7, name: CUISIN[7]},
    {id: 8, name: CUISIN[8]},
    {id: 9, name: CUISIN[9]},
    {id: 10, name: CUISIN[10]},
    {id: 11, name: CUISIN[11]},
    {id: 12, name: CUISIN[12]},
    {id: 13, name: CUISIN[13]},
    {id: 14, name: CUISIN[14]},
    {id: 15, name: CUISIN[15]},
  ]);
  const [starSignVal, setStarSignVal] = useState([
    {id: 0, name: ZODIAC_SIGN[0]},
    {id: 1, name: ZODIAC_SIGN[1]},
    {id: 2, name: ZODIAC_SIGN[2]},
    {id: 3, name: ZODIAC_SIGN[3]},
    {id: 4, name: ZODIAC_SIGN[4]},
    {id: 5, name: ZODIAC_SIGN[5]},
    {id: 6, name: ZODIAC_SIGN[6]},
    {id: 7, name: ZODIAC_SIGN[7]},
    {id: 8, name: ZODIAC_SIGN[8]},
    {id: 9, name: ZODIAC_SIGN[9]},
    {id: 10, name: ZODIAC_SIGN[10]},
    {id: 11, name: ZODIAC_SIGN[11]},
    {id: 12, name: ZODIAC_SIGN[12]},
  ]);

  const [preferenceVal, setPreferenceVal] = useState([
    {id: 1, name: PREFERENCES[0]},
    {id: 2, name: PREFERENCES[1]},
    {id: 3, name: PREFERENCES[2]},
    {id: 4, name: PREFERENCES[3]},
    {id: 5, name: PREFERENCES[4]},
    {id: 6, name: PREFERENCES[5]},
  ]);

  const [isChildrenVal, setIsChildrenVal] = useState([
    {id: 1, name: 'Yes'},
    {id: 2, name: 'No'},
    {id: 3, name: 'Any'},
  ]);

  const [maritalStatusArray, setMaritalStatusArray] = useState([
    {id: 1, name: RELATIONSHIP_STATUS[0]},
    {id: 2, name: RELATIONSHIP_STATUS[1]},
    {id: 3, name: RELATIONSHIP_STATUS[2]},
    {id: 4, name: RELATIONSHIP_STATUS[3]},
    {id: 5, name: RELATIONSHIP_STATUS[4]},
    {id: 6, name: RELATIONSHIP_STATUS[5]},
    {id: 7, name: RELATIONSHIP_STATUS[6]},
    {id: 8, name: RELATIONSHIP_STATUS[7]},
    {id: 9, name: RELATIONSHIP_STATUS[8]},
  ]);
  const [meetUpStates, setMeetUpStates] = useState([
    {name: MEET_AT[0]},
    {name: MEET_AT[1]},
    {name: MEET_AT[2]},
    {name: MEET_AT[3]},
    {name: MEET_AT[4]},
    {name: MEET_AT[5]},
  ]);
  const [positionType, setpositionType] = useState([
    {img: imagesPath.upward, name: ENCOUNTR_POSITION[0]},
    {img: imagesPath.verstop, name: ENCOUNTR_POSITION[1]},
    {img: imagesPath.verticalSwipeIcon, name:ENCOUNTR_POSITION[2]},
    {img: imagesPath.tiltedBottomArrow, name: ENCOUNTR_POSITION[3]},
    {img: imagesPath.bottom, name: ENCOUNTR_POSITION[4]},
    {img: imagesPath.horizontalSwipeIcon, name: ENCOUNTR_POSITION[5]},
    {img: imagesPath.bottom, name: ENCOUNTR_POSITION[6]},
    {img: imagesPath.upward, name: ENCOUNTR_POSITION[7]},
    {img: imagesPath.upward, name: ENCOUNTR_POSITION[8]},
    {img: imagesPath.upward, name: ENCOUNTR_POSITION[9]},
  ]);

  useEffect(() => {
    const selectedNames = Array.isArray(encountrPosition)
      ? encountrPosition.map((item: any) => item?.name).filter(Boolean)
      : [encountrPosition?.name].filter(Boolean);

    setpositionType(prev =>
      prev.map(item => ({
        ...item,
        isSelected: selectedNames.includes(item.name),
      })),
    );
  }, [encountrPosition]);
  const [photoData, setphotoData] = useState([
    {img: imagesPath.photonew, name: HAS_PHOTOS[0], value:'has_photo'},
    {img: imagesPath.albumIcon, name: HAS_PHOTOS[1], value:'has_album'},
  ]);
  
  return (
    <View style={{backgroundColor: theme.colors.white}}>
      {/* {setMaxDistance ? (
        <SingleSlider
          sliderHeaderText={strings.maxDistance}
          isRequired={true}
          sliderMinValue={0}
          sliderMaxValue={1000}
          rangeText={strings.milesAway}
          sliderValue={String(maxDistance)}
          setSliderValueFromChild={setMaxDistance}
        />
      ) : (
        <></>
      )} */}

      {/* {setGlobalMatchingValue
                ? <ToggleComp
                    toggleText={strings.globalMatching}
                    mainContainerStyle={{ marginTop: moderateScale(16) }}
                    setToggleValueFromChild={setGlobalMatchingValue}
                    toggleValue={globalMatchingValue}
                />
                : <></>} */}

      {setAge ? (
        <MultiSliderComp
          sliderHeaderText={strings.age}
          isRequired
          sliderMinValue={MIN_AGE}
          sliderMaxValue={MAX_AGE}
          sliderValue={age}
          setSliderValueFromChild={(val: any) => setAge(val)}
          // sliderWidth={width - moderateScale(100)}
        />
      ) : (
        <></>
      )}

      {setMaxHeight ? (
        <SingleSlider
          sliderHeaderText={strings.height}
          isRequired={true}
          sliderMinValue={0}
          sliderMaxValue={8}
          rangeText={'ft'}
          sliderValue={maxHeight[0]}
          setSliderValueFromChild={setMaxHeight}
          // sliderWidth={width - moderateScale(100)}
        />
      ) : (
        <></>
      )}

      {setWeight ? (
        <SingleSlider
          sliderHeaderText={strings.weight}
          sliderMinValue={MIN_WEIGHT}
          sliderMaxValue={MAX_WEIGHT}
          rangeText={strings.lb}
          sliderValue={weight[0]}
          setSliderValueFromChild={setWeight}
          // sliderWidth={width - moderateScale(100)}
        />
      ) : (
        <></>
      )}

      {encountrPosition ? (
         <SelectPositionComp 
         title={'Position'}
         flatListData={positionType}
         setFlatListFromChild={setpositionType}
         setValueFromChild={setEncountrPosition}
         multiSelect={true}
        />
      ) : (
        <></>
      )}
     {hasPhotos ? (
         <SelectPositionComp 
         title={'Photos'}
         flatListData={photoData}
         setFlatListFromChild={setphotoData}
         setValueFromChild={setHasPhotos}
        />
      ) : (
        <></>
      )}

      {/* <Text
        style={{
          fontSize: textScale(16),
          fontFamily: fontFamily.SemiBold,
          color: theme.colors.black,
          marginHorizontal: moderateScale(20),
          marginTop: moderateScaleVertical(8),
        }}>
        More Filters
      </Text> */}

      {setTribesValue ? (
        <SelectSliderComp
          title={strings.tribes}
          isRequired
          value={tribesValue}
          bottomSheetHeader={strings.select + strings.tribes}
          flatListData={tribes}
          setFlatListFromChild={data => setTribes(data)}
          setValueFromChild={val => setTribesValue(val)}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {setBodyTypeValue ? (
        <SelectSliderComp
          title={strings.bodyType}
          value={bodyTypeValue}
          isRequired
          bottomSheetHeader={strings.select_body_type}
          flatListData={bodyType}
          setFlatListFromChild={data => setBodyType(data)}
          setValueFromChild={val => setBodyTypeValue(val)}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {setPreferredGenderValue ? (
        <SelectSliderComp
          title={strings.preferredGender}
          isRequired
          value={preferredGenderValue?.name}
          bottomSheetHeader={strings.select + strings.preferredGender}
          flatListData={preferredGender}
          setFlatListFromChild={data => setPreferredGender(data)}
          setValueFromChild={val => setPreferredGenderValue(val)}
        />
      ) : (
        <></>
      )}

      {setSmokersValue ? (
        <ToggleComp
          toggleText={strings.smokers}
          toggleValue={smokersValue}
          setToggleValueFromChild={val => setSmokersValue(val)}
        />
      ) : (
        <></>
      )}

      {setSexualityValue ? (
        <SelectSliderComp
          title={strings.sexuality}
          isRequired
          value={sexualityValue?.name}
          bottomSheetHeader={strings.select + strings.sexuality}
          flatListData={sexuality}
          setFlatListFromChild={data => setSexuality(data)}
          setValueFromChild={val => setSexualityValue(val)}
          mainContainerStyle={{marginTop: moderateScale(16)}}
        />
      ) : (
        <></>
      )}
      {/* {maritalStatusArray ? (
        <SelectSliderComp
          title={strings.relationShipStatus}
          isRequired
          value={maritalStatus?.name || maritalStatus}
          bottomSheetHeader={strings.selectRelationStatus}
          flatListData={maritalStatusArray}
          setFlatListFromChild={data => setMaritalStatusArray(data)}
          setValueFromChild={setMaritalStatus}
        />
      ) : (
        <></>
      )} */}
      {setNsfwPicsValue ? (
        <SelectSliderComp
          title={strings.Accept_NSFW}
          isRequired
          value={nsfwPicsValue?.name}
          bottomSheetHeader={strings.select + strings.NSFW_Pics}
          flatListData={NSFWArray}
          setFlatListFromChild={data => setNSFWArray(data)}
          setValueFromChild={val => setNsfwPicsValue(val)}
        />
      ) : (
        <></>
      )}

      {setHairValue ? (
        <SelectSliderComp
          title={strings.hair}
          value={hairValue?.name}
          bottomSheetHeader={strings.select + strings.hair}
          flatListData={hair}
          setFlatListFromChild={data => setHairs(data)}
          setValueFromChild={val => setHairValue(val)}
        />
      ) : (
        <></>
      )}

      {setPiercingValue ? (
        <ToggleComp
          toggleText={strings.piercing}
          toggleValue={piercingValue}
          setToggleValueFromChild={val => setPiercingValue(val)}
        />
      ) : (
        <></>
      )}

      {setBedRoomAnticsValue ? (
        <SelectSliderComp
          title={strings.bedroom_antics}
          value={bedRoomAnticsValue?.name}
          bottomSheetHeader={strings.select + strings.bedroom_antics}
          flatListData={bedRoomAntics}
          setFlatListFromChild={data => setBedRoomAntics(data)}
          setValueFromChild={val => setBedRoomAnticsValue(val)}
          mainContainerStyle={{marginTop: moderateScale(16)}}
        />
      ) : (
        <></>
      )}

      {/* {lookingFor ? (
        <SelectSliderComp
          title={'Looking for'}
          isRequired
          value={lookingFor?.name}
          bottomSheetHeader={'Are you looking for ...'}
          flatListData={lookingForState}
          setFlatListFromChild={data => setLookingForState(data)}
          setValueFromChild={setLookingFor}
        />
      ) : (
        <></>
      )} */}

      {ink ? (
        <SelectSliderComp
          title={'Ink'}
          value={ink?.name}
          bottomSheetHeader={'Ink'}
          flatListData={inkState}
          setFlatListFromChild={data => setInkState(data)}
          setValueFromChild={setInk}
        />
      ) : (
        <></>
      )}

      {meetUp ? (
        <SelectSliderComp
          title={strings.meetAt}
          isRequired
          value={meetUp}
          bottomSheetHeader={strings.meet_At}
          flatListData={meetUpStates}
          setFlatListFromChild={data => setMeetUpStates(data)}
          setValueFromChild={setMeetUp}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {education ? (
        <SelectSliderComp
          title={'Education'}
          isRequired
          value={education?.name}
          bottomSheetHeader={'Education'}
          flatListData={educationState}
          setFlatListFromChild={data => setEducationState(data)}
          setValueFromChild={setEducation}
        />
      ) : (
        <></>
      )}

      {occupation ? (
        <SelectSliderComp
          title={'Occupation'}
          value={occupation?.name}
          bottomSheetHeader={'Occupation'}
          flatListData={occupState}
          setFlatListFromChild={data => setOccupState(data)}
          setValueFromChild={setOccupation}
        />
      ) : (
        <></>
      )}

      {children ? (
        <SelectSliderComp
          title={'Children'}
          value={children?.name}
          bottomSheetHeader={'Children'}
          flatListData={child}
          setFlatListFromChild={data => setChild(data)}
          setValueFromChild={setChildren}
        />
      ) : (
        <></>
      )}

      {setPets ? (
        <ToggleComp
          toggleText={'Pets'}
          toggleValue={pets}
          setToggleValueFromChild={setPets}
        />
      ) : (
        <></>
      )}

      {religion ? (
        <SelectSliderComp
          title={'Religion'}
          isRequired
          value={religion?.name}
          bottomSheetHeader={'Religion'}
          flatListData={religionVal}
          setFlatListFromChild={data => setReligionVal(data)}
          setValueFromChild={setReligion}
        />
      ) : (
        <></>
      )}

      {setIsSmoker ? (
        <ToggleComp
          toggleText={'Smoker'}
          toggleValue={isSmoker}
          setToggleValueFromChild={setIsSmoker}
        />
      ) : (
        <></>
      )}

      {position ? (
        <SelectSliderComp
          title={'Position'}
          isRequired
          value={position}
          bottomSheetHeader={'Select Position'}
          flatListData={positionVal}
          setFlatListFromChild={data => setPositionVal(data)}
          setValueFromChild={setPosition}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {fantasy ? (
        <SelectSliderComp
          title={'Fantasy'}
          isRequired
          value={fantasy}
          bottomSheetHeader={'Select Fantasy'}
          flatListData={fantasyVal}
          setFlatListFromChild={data => setFantasyVal(data)}
          setValueFromChild={setFantasy}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {kink ? (
        <SelectSliderComp
          title={'Kink'}
          isRequired
          value={kink}
          bottomSheetHeader={'Select Kink'}
          flatListData={kinkVal}
          setFlatListFromChild={data => setKinkVal(data)}
          setValueFromChild={setkink}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {setFoodie ? (
        <ToggleComp
          toggleText={'Foodie'}
          toggleValue={foodie}
          setToggleValueFromChild={setFoodie}
        />
      ) : (
        <></>
      )}

      {drinking ? (
        <SelectSliderComp
          title={'Drinking'}
          value={drinking?.name}
          bottomSheetHeader={'Drinking'}
          flatListData={drinkingVal}
          setFlatListFromChild={data => setDrinkingVal(data)}
          setValueFromChild={setDrinking}
        />
      ) : (
        <></>
      )}

      {fitness ? (
        <SelectSliderComp
          title={'Fitness'}
          value={fitness?.name}
          bottomSheetHeader={'Fitness'}
          flatListData={fitnessVal}
          setFlatListFromChild={data => setFitnessVal(data)}
          setValueFromChild={setFitness}
        />
      ) : (
        <></>
      )}

      {lifestyle ? (
        <SelectSliderComp
          title={'Lifestyle'}
          value={lifestyle?.name}
          bottomSheetHeader={'Lifestyle'}
          flatListData={lifeStyleVal}
          setFlatListFromChild={data => setlifeStyleVal(data)}
          setValueFromChild={setLifeStyle}
        />
      ) : (
        <></>
      )}
      {setDrivingLicense ? (
        <ToggleComp
          toggleText={'Driving License'}
          toggleValue={drivingLicense}
          setToggleValueFromChild={setDrivingLicense}
        />
      ) : (
        <></>
      )}
      {personality ? (
        <SelectSliderComp
          title={'Personality'}
          value={personality?.name}
          bottomSheetHeader={'Personality'}
          flatListData={personalityVal}
          setFlatListFromChild={data => setPersonalityVal(data)}
          setValueFromChild={setPersonality}
        />
      ) : (
        <></>
      )}
      {languages ? (
        <SelectSliderComp
          title={'Languages'}
          value={languages}
          bottomSheetHeader={'Select Languages'}
          flatListData={languagesVal}
          setFlatListFromChild={data => setLanguagesVal(data)}
          setValueFromChild={setLanguages}
          multiSelect={true}
        />
      ) : (
        <></>
      )}
      {hobies ? (
        <SelectSliderComp
          title={'Hobbies'}
          value={hobies}
          bottomSheetHeader={'Select your Hobbies'}
          flatListData={hobbiesVal}
          setFlatListFromChild={data => setHobbiesVal(data)}
          setValueFromChild={setHobies}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {favPlaces ? (
        <SelectSliderComp
          title={'Favourite Places'}
          value={favPlaces}
          bottomSheetHeader={'Select your favourite places'}
          flatListData={favPlacesVal}
          setFlatListFromChild={data => setFavPlacesVal(data)}
          setValueFromChild={setFavPlaces}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {interests ? (
        <SelectSliderComp
          title={'Interests'}
          value={interests}
          bottomSheetHeader={'Select your interests'}
          flatListData={interestsVal}
          setFlatListFromChild={data => setInterestsVal(data)}
          setValueFromChild={setInterests}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {cuisin ? (
        <SelectSliderComp
          title={'Cuisin'}
          value={cuisin}
          bottomSheetHeader={'Select your favourite cuisines'}
          flatListData={cuisineVal}
          setFlatListFromChild={data => setCuisineVal(data)}
          setValueFromChild={setCuisin}
          multiSelect={true}
        />
      ) : (
        <></>
      )}

      {starSign ? (
        <SelectSliderComp
          title={'Zodiac'}
          value={starSign?.name}
          bottomSheetHeader={'Select Zodiac'}
          flatListData={starSignVal}
          setFlatListFromChild={data => setStarSignVal(data)}
          setValueFromChild={setStarSign}
        />
      ) : (
        <></>
      )}

      {preference ? (
        <SelectSliderComp
          title={'Preference'}
          value={preference?.name}
          bottomSheetHeader={'Select Preference'}
          flatListData={preferenceVal}
          setFlatListFromChild={data => setPreferenceVal(data)}
          setValueFromChild={setPreference}
        />
      ) : (
        <></>
      )}

      {/* {isChildrenVal ? (
        <SelectSliderComp
          title={'Has kids'}
          isRequired
          value={isChildren?.name || isChildren}
          bottomSheetHeader={'Has kids'}
          flatListData={isChildrenVal}
          setFlatListFromChild={data => setIsChildrenVal(data)}
          setValueFromChild={setIsChildren}
        />
      ) : (
        <></>
      )} */}
    </View>
  );
};

export default React.memo(BonkerBonksFilter);

type SetLocationFilterProps = {
  selectAddressFromChild?: any,
  setCoordinatesFromChild?: any,
};

export const SetLocationFilter: FC<SetLocationFilterProps> = React.memo(
  ({selectAddressFromChild, setCoordinatesFromChild}: SetLocationFilterProps) => {
    const userData = useSelector((state: any) => state?.authReducers?.userData || {});
    const coords = useSelector((state: any)=> state?.authReducers?.coordinates || {});
    const addressFilter = useSelector(
      (state: any) => state?.authReducers?.filterAddress || {},
    );


    // const [coordinates, setCoordinates] = useState(coords || {
    //     latitude: 30.7191,
    //     latitudeDelta: 0.03276390890841441,
    //     longitude: 76.8103,
    //     longitudeDelta: 0.042099952697753906
    // })

    const [coordinates, setCoordinates] = useState({
      latitude: Number(coords?.latitude) || 51.5072,
      longitude: Number(coords?.longitude) || 0.1276,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    const [selectedAddress, setSelectedAddress] = useState('');
    const [fetchingAddLoader, setFetchingAddLoader] = useState(false);
    const [isMap, setIsMap] = useState(true);

    useEffect(() => {
      // GetAddressFromCoordinates(coordinates)
      //   .then(res => {
      //     console.log(coordinates, 'resresresresres', res);
      //     // setSelectedAddress(res);
      //     selectAddressFromChild(res);
      //     setCoordinatesFromChild(coordinates);
      //     setFetchingAddLoader(false);
      //     // if(!!addressFilter){
      //     //   setSelectedAddress(addressFilter)
      //     // }
      //   })
      //   .catch(error => {
      //     setFetchingAddLoader(false);
      //   });
      mapAddress(coordinates);
    }, [coordinates]);

    const fetchAddress = (details: any) => {
      GetAddressFromCoordinates(details?.geometry?.location)
        .then(res => {
          console.log(details?.geometry?.location, 'resresresresres', res);
          // setSelectedAddress(res);
          selectAddressFromChild(res);
          setCoordinatesFromChild(details?.geometry?.location);
          setFetchingAddLoader(false);
        })
        .catch(error => {
          setFetchingAddLoader(false);
        });
    };

    const mapAddress = (data: any) => {
      GetAddressFromCoordinates(data)
        .then(res => {
          console.log(data, 'resresresresres', res);
          setSelectedAddress(res);
          selectAddressFromChild(res);
          setCoordinatesFromChild(data);
          setFetchingAddLoader(false);
        })
        .catch(error => {
          setFetchingAddLoader(false);
        });
    };
    const {theme} = useTheme();
    const commonStyles = getCommonStyles(theme);

    return (
      <View>
        <Text
          style={{
            ...commonStyles.font_14_bold,
            width: '44%',
            color: theme.colors.themecolor2,
            marginHorizontal: moderateScale(24),
            marginTop: moderateScale(24),
          }}>
          {'Set Location'}
        </Text>

        <View>
          <MapView
            initialRegion={coordinates}
            style={{
              marginHorizontal: moderateScale(24),
              marginTop: moderateScale(10),
              height: height / 2.8,
              borderRadius: moderateScale(16),
            }}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
            onRegionChange={() => {
              // setSelectedAddress('');
              setFetchingAddLoader(true);
            }}
            onRegionChangeComplete={cb => {
              console.log('Region changed', cb);
              setCoordinates(cb);
              mapAddress(cb);
            }}
          />

          <Image
            source={imagesPath.map_pin_pink}
            style={{
              marginTop: height / 2.1 / 2.6,
              alignSelf: 'center',
              position: 'absolute',
            }}
          />
        </View>

        <View
          style={{
            marginHorizontal: moderateScale(24),
            borderWidth: 1,
            borderColor: theme.colors.likePink,
            padding: moderateScale(12),
            borderRadius: moderateScale(8),
            marginTop: moderateScale(16),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image source={imagesPath.map_pin_pink} />

          {fetchingAddLoader ? (
            <View>
              <ActivityIndicator
                size={'small'}
                animating={fetchingAddLoader}
                color={theme.colors.likePink}
                style={{marginStart: width / 3.3}}
              />
            </View>
          ) : (
            <>
              {/* <Text
              style={{
                ...commonStyles.font_14_SemiBold,
                color: colors.themecolor2,
                marginStart: moderateScale(8),
                width: '88%',
              }}>
              {selectedAddress}
            </Text> */}
              <GooglePlacesAutocomplete
                placeholder={selectedAddress}
                textInputProps={{
                  placeholderTextcolor: theme.colors.themeColor,
                  returnKeyType: 'search',
                  selectionColor: theme.colors.caribbean,
                  value: selectedAddress,
                  onChangeText: val => setSelectedAddress(val),
                }}
                keyboardShouldPersistTaps={'handled'}
                fetchDetails={true}
                predefinedPlacesAlwaysVisible={true}
                isRowScrollable={true}
                // ref={googlePlacesRef}
                onPress={(data, details) => {
                  console.log(data, 'LATiTUDE', details);
                  setSelectedAddress(data?.description);
                  fetchAddress(details);
                }}
                styles={{
                  textInput: {
                    ...commonStyles.font_14_SemiBold,
                    color: theme.colors.themecolor2,
                    marginStart: moderateScale(8),
                    width: '88%',
                  },
                  container: {
                    // position: 'absolute',
                    width: '100%',
                  },
                  description: {color: theme.colors.black},
                }}
                query={{
                  key: GOOGLE_MAPS_KEY,
                  language: 'en',
                }}
              />
            </>
          )}
        </View>
      </View>
    );
  },
);
