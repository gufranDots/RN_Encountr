import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createVoicePlayer,
  resetVoicePlayer,
  startVoiceMessage,
  stopVoiceMessage,
} from '../../utils/voiceMessagePlayer';
import {
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  Modal,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import {
  WrapperContainer,
  ImgBgComponent,
} from '../../Components';
import imagesPath from '../../constants/imagesPath';
import { getStyles as getHomeStyles } from './styles';
import colors from '../../styles/colors';
import { useSelector } from 'react-redux';
import ModalNew from 'react-native-modal';
import Geocoder from 'react-native-geocoding';
import {
  BODY_TYPE,
  CHILDREN,
  DRINKING,
  EDUCATION,
  FITNESS,
  GENDERS,
  HOBBIES,
  INK,
  LANGUAGES,
  LIFE_STYLE,
  LOOKING_FOR,
  MAX_AGE,
  MIN_AGE,
  OCCUPATION,
  PERSONALITY,
  PREFERENCES,
  MEET_AT,
  NSFW_PICS,
  SEXUALITY,
  RELATIONSHIP_STATUS,
  ENCOUNTR_POSITION,
  HAS_PHOTOS,
} from '../../utils/staticData';
import { Loader } from '../../Components/Loader';
import BonkerBonksFilter from '../../Components/BonkerBonksFilter';
// import Modal from 'react-native-modal'
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles';
import GradientText from '../../Components/GradientText';
import strings from '../../constants/Languages';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
  verticalScale,
  width,
} from '../../styles/responsiveSize';
import ButtonComp from '../../Components/ButtonComp';
import { ApiError, showError } from '../../utils/helperFunctions';
import {
  matchUserListApi,
  saveUserCurrentLocationToStore,
  saveViewedProfileToStore,
  setBonkersFiltersApi,
  getBoomPlanDetails,
  checkOutBoomPlan,
  getFreshUsers,
} from '../../redux/reduxActions/homeActions';
import { checkLocationSevice } from '../../utils/miscellaneous';
import { getUserProfile, logoutApi } from '../../redux/reduxActions/authActions';
import { ConnectingSocket, socketRef } from '../../utils/utils';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import navigationString from '../../constants/navigationString';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { updateProfileApi } from '../../redux/reduxActions/profileActions';
import ItsAMatchModal from '../../Components/ItsAMatchModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { enableFreeze } from 'react-native-screens';
import {
  getChatCount,
  saveChatCounter,
} from '../../redux/reduxActions/chatActions';
import { configureZegoCloud } from '../../utils/zegoConfigureFile';
import fontFamily from '../../styles/fontFamily';
import { Switch } from 'react-native-switch';
import { RefreshControl } from 'react-native-gesture-handler';
import CustomImage from '../../Components/CustomImage';
import HomeComponent from '../../Components/HomeComponent';
import HomeSearchComponent from '../../Components/HomeSearchComponent';
import { useTheme } from '../../theme/ThemeProvider';
import LinearGradient from 'react-native-linear-gradient';

enableFreeze();

const CATEGORY_LIST_DATA = [
  {
    name: 'Fresh',
    index: 3,
  },
  {
    name: 'Age',
    index: 1,
  },
  {
    name: 'Position',
    index: 2,
  },
  { 
    name: 'Online Now',
    index: 0,
  },
  {
    name: 'More Filters',
    index: 4,
  },

];

const Home = ({ navigation, route }) => {
  const { theme, isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getHomeStyles(theme, commonStyles);
  const enCounterHomestyles = getStyles(theme, commonStyles)
  const [isRefreshing, setRefreshing] = useState(false);
  const [showPosition, setShowPosition] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const homeData = useSelector(state => state?.authReducers?.homeData || {});
  const [viewedProfileIds, setViewProfileIds] = useState([]);
  const [explore, setexplore] = useState(true);
  const [viewedme, setviewedme] = useState(false);
  const [toggle, settoggle] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [maxpage, setmaxpage] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hideEmpty, sethideEmpty] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [boomModal, setBoomModal] = useState(false);
  const [hideProfile, sethideProfile] = useState(false);
  const [boomPlanDetails, setBoomPlanDetails] = useState({});
  const [subscription, setSubscription] = useState('');
  const [selectPosition, setSelectPosition] = useState([]);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const audioPlayerRef = useRef(null);
  const playingVoiceIdRef = useRef(null);
  const pendingVoiceIdRef = useRef(null);
  const voicePlaybackTokenRef = useRef(0);
  const flatListRef = useRef(null);
  const cypherPulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cypherPulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cypherPulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [cypherPulseAnim]);

  const _onCypherPress = useCallback(() => {
    navigation.navigate(navigationString.CYPHER_SCREEN);
  }, [navigation]);

  const _getAudioPlayer = useCallback(() => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = createVoicePlayer();
    }
    return audioPlayerRef.current;
  }, []);

  const _stopVoiceMessage = useCallback(async () => {
    voicePlaybackTokenRef.current += 1;
    playingVoiceIdRef.current = null;
    pendingVoiceIdRef.current = null;
    setPlayingVoiceId(null);
    await stopVoiceMessage(audioPlayerRef.current);
  }, []);

  const _onSpeakerPress = useCallback(
    async item => {
      const url =
        typeof item?.voice_message === 'string' ? item.voice_message.trim() : '';
      if (!url) return;
      const rawId = item?.id ?? item?._id;
      const itemId = rawId == null ? null : String(rawId);

      if (
        (playingVoiceIdRef.current && playingVoiceIdRef.current === itemId) ||
        (pendingVoiceIdRef.current && pendingVoiceIdRef.current === itemId)
      ) {
        await _stopVoiceMessage();
        return;
      }

      if (playingVoiceIdRef.current || pendingVoiceIdRef.current) {
        await _stopVoiceMessage();
      }

      const playbackToken = voicePlaybackTokenRef.current;
      pendingVoiceIdRef.current = itemId;
      setPlayingVoiceId(itemId);

      try {
        const player = _getAudioPlayer();
        await startVoiceMessage(player, url);

        if (playbackToken !== voicePlaybackTokenRef.current) {
          await stopVoiceMessage(player);
          return;
        }

        pendingVoiceIdRef.current = null;
        playingVoiceIdRef.current = itemId;
        setPlayingVoiceId(itemId);
        player.addPlayBackListener(e => {
          if (
            e?.isFinished ||
            (e?.duration > 0 && e?.currentPosition >= e?.duration)
          ) {
            _stopVoiceMessage();
          }
        });
      } catch (err) {
        if (playbackToken === voicePlaybackTokenRef.current) {
          resetVoicePlayer(audioPlayerRef);
          playingVoiceIdRef.current = null;
          pendingVoiceIdRef.current = null;
          setPlayingVoiceId(null);
          showError(err?.message || 'Unable to play voice message');
        }
      }
    },
    [_getAudioPlayer, _stopVoiceMessage],
  );

  // alert(JSON.stringify(userData))

  useEffect(() => {
    if (userData?.id) {
      configureZegoCloud({
        id: `${userData?.id}`,
        user_name: userData?.full_name,
      });
    }
  }, [userData])

  const [isPreferancesModalVisible, setIsPreferancesModalVisible] =
    useState(false);
  const lifestyle = {
    id:
      typeof userData?.filters?.lifestyle === 'number'
        ? userData?.filters?.lifestyle
        : LIFE_STYLE.findIndex(x => x === userData?.filters?.lifestyle) + 1 ||
        1,
    name:
      typeof userData?.filters?.lifestyle === 'number'
        ? LIFE_STYLE[userData?.filters?.lifestyle - 1 || 1]
        : userData?.filters?.lifestyle,
    isSelected: true,
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const coords = useSelector(state => state?.authReducers?.coordinates || {});
  const [meetUp, setMeetUp] = useState(() => {
    // Support both single value and array of meet at options
    if (userData?.filters?.meet_at) {
      const meetAtFilter = userData?.filters?.meet_at;
      if (Array.isArray(meetAtFilter)) {
        return meetAtFilter;
      }
      // Single meet at value
      return [{
        id:
          typeof meetAtFilter === 'number'
            ? meetAtFilter
            : MEET_AT.findIndex(x => x === meetAtFilter) + 1 || 1,
        name:
          typeof meetAtFilter === 'number'
            ? MEET_AT[meetAtFilter - 1 || 1]
            : meetAtFilter,
        isSelected: true,
      }];
    }
    return [];
  });
  const [nsfwValue, setNSFWValue] = useState({
    id:
      typeof userData?.filters?.nsfw_pics === 'number'
        ? userData?.filters?.nsfw_pics
        : NSFW_PICS.findIndex(x => x === userData?.filters?.nsfw_pics) + 1 || 1,
    name:
      typeof userData?.filters?.nsfw_pics === 'number'
        ? NSFW_PICS[userData?.filters?.nsfw_pics - 1 || 1]
        : userData?.filters?.nsfw_pics,
    isSelected: true,
  });
  const [position, setPosition] = useState({
    name: userData?.filters?.position
      ? userData?.filters?.position
      : 'Not Specified',
    isSelected: true,
  });
  const [photos, setPhotos] = useState({
    id: userData?.filters?.has_photo_type
      ? userData?.filters?.has_photo_type
      : HAS_PHOTOS.findIndex(x => x === userData?.filters?.has_photo_type) +
      1 || 1,
    value: userData?.filters?.has_photo_type
      ? HAS_PHOTOS[userData?.has_photo_type - 1 || 1]
      : userData?.filters?.has_photo_type,
    isSelected: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [lookingFor, setLookingFor] = useState({
    id:
      typeof userData?.filters?.looking_for === 'number'
        ? userData?.filters?.looking_for
        : LOOKING_FOR.findIndex(x => x === userData?.filters?.looking_for) +
        1 || 1,
    name:
      typeof userData?.filters?.looking_for === 'number'
        ? LOOKING_FOR[userData?.filters?.looking_for - 1 || 1]
        : userData?.filters?.looking_for,
    isSelected: true,
  });
  const [selectedAddress, setSelectedAddress] = useState('');
  const [coordinates, setCoordinates] = useState(
    coords || {
      latitude:
        Number(userData?.latitude) || Number(coords?.latitude) || 30.7191,
      latitudeDelta: 0.03276390890841441,
      longitude:
        Number(userData?.longitude) || Number(coords?.longitude) || 76.8103,
      longitudeDelta: 0.042099952697753906,
    },
  );
  const [education, setEducation] = useState({
    id:
      typeof userData?.filters?.education === 'number'
        ? userData?.filters?.education
        : EDUCATION.findIndex(x => x === userData?.filters?.education) + 1 || 1,
    name:
      typeof userData?.filters?.education === 'number'
        ? EDUCATION[userData?.filters?.education - 1 || 1]
        : userData?.filters?.education,
    isSelected: true,
  });
  const [age, setAge] = useState([
    userData?.filters?.from_age || MIN_AGE,
    userData?.filters?.to_age || MAX_AGE,
  ]);
  const [weight, setWeight] = useState([userData?.weight || 0]);
  const [maxHeight, setMaxHeight] = useState(
    userData?.filters?.maximum_height || 8,
  );
  const preferredGenderValue = {
    id: userData?.filters?.interested_in || 1,
    name: GENDERS[userData?.filters?.interested_in - 1 || 1],
    isSelected: true,
  };
  const piercingValue =
    userData?.filters?.piercing === 1 ? true : false || false;
  const [maxDistance, setMaxDistance] = useState(
    userData?.filters?.distance || '1000',
  );

  const [bodyTypeValue, setBodyTypeValue] = useState(() => {
    // Support both single value and array of body types
    if (userData?.filters?.body_type) {
      const bodyTypeFilter = userData?.filters?.body_type;
      if (Array.isArray(bodyTypeFilter)) {
        return bodyTypeFilter;
      }
      // Single body type value
      return [{
        id:
          typeof bodyTypeFilter === 'number'
            ? bodyTypeFilter
            : BODY_TYPE.findIndex(x => x === bodyTypeFilter) + 1 || 1,
        name:
          typeof bodyTypeFilter === 'number'
            ? BODY_TYPE[bodyTypeFilter - 1 || 1]
            : bodyTypeFilter,
        isSelected: true,
      }];
    }
    return [];
  });
  const [tribeValue, setTribeValue] = useState(() => {
    // Support both single value and array of tribes
    if (userData?.filters?.tribes) {
      const tribesFilter = userData?.filters?.tribes;
      if (Array.isArray(tribesFilter)) {
        return tribesFilter;
      }
      // Single tribe value
      return [{
        id:
          typeof tribesFilter === 'number'
            ? tribesFilter
            : SEXUALITY.findIndex(x => x === tribesFilter) + 1 || 1,
        name:
          typeof tribesFilter === 'number'
            ? SEXUALITY[tribesFilter - 1 || 1]
            : tribesFilter,
        isSelected: true,
      }];
    }
    return [];
  });
  const ink = { name: userData?.filters?.ink || INK[0] };
  const occupation = { name: userData?.filters?.occupation || OCCUPATION[0] };
  const children = { name: userData?.filters?.children || CHILDREN[0] };
  const pets = userData?.filters?.pets === 1 ? 1 : 0;
  const foodie = userData?.filters?.foodie === 1 ? true : false || false;
  const preferences = {
    id:
      typeof userData?.filters?.preference === 'number'
        ? userData?.filters?.preference
        : PREFERENCES.findIndex(x => x === userData?.filters?.preference) + 1 ||
        1,
    name:
      typeof userData?.filters?.preference === 'number'
        ? PREFERENCES[userData?.filters?.preference - 1 || 1]
        : userData?.filters?.preference,
    isSelected: true,
  };
  const drinking = {
    id: 1,
    name: DRINKING[0],
    isSelected: true,
  };
  const fitness = {
    id: 1,
    name: FITNESS[0],
    isSelected: true,
  };
  const drivingLicense =
    userData?.filters?.driving_license === 1 ? true : false || false;
  const personality = {
    id: 1,
    name: PERSONALITY[0],
    isSelected: true,
  };
  const [languages, setLangugaes] = useState([]);
  const [cardsData, setCardsData] = useState([]);
  const [locationExplore, setlocationExplore] = useState();
  const [isFreshSelected, setIsFreshSelected] = useState(false);
  const [hobies, setHobies] = useState([]);
  const favPlaces = [];
  const interests = [];
  const cuisin = [];
  const isSmoker = userData?.filters?.is_smoker === 1;
  const isFocused = useIsFocused();
  const [itsMatchModal, setItsMatchModal] = useState({
    isVisible: false,
    userPic: null,
    data: {},
  });
  const [maritalStatusValue, setMaritalStatusValue] = useState({
    id:
      typeof userData?.filters?.married_status === 'number'
        ? userData?.filters?.married_status
        : RELATIONSHIP_STATUS.findIndex(
          x => x === userData?.filters?.married_status,
        ) + 1 || 1,
    name:
      typeof userData?.filters?.married_status === 'number'
        ? RELATIONSHIP_STATUS[userData?.filters?.married_status - 1 || 1]
        : userData?.filters?.married_status,
    isSelected: true,
  });
  const [isChildrenValue, setIsChildrenValue] = useState(
    userData?.filters?.having_kids || '',
  );

  const categorylistData = useMemo(() => CATEGORY_LIST_DATA, []);

  const maritalStatus = [
    { id: 1, name: RELATIONSHIP_STATUS[0] },
    { id: 2, name: RELATIONSHIP_STATUS[1] },
    { id: 3, name: RELATIONSHIP_STATUS[2] },
    { id: 4, name: RELATIONSHIP_STATUS[3] },
    { id: 5, name: RELATIONSHIP_STATUS[4] },
    { id: 6, name: RELATIONSHIP_STATUS[5] },
    { id: 7, name: RELATIONSHIP_STATUS[6] },
    { id: 8, name: RELATIONSHIP_STATUS[7] },
    { id: 9, name: RELATIONSHIP_STATUS[8] },
  ];

  // Location Fetched
  useEffect(() => {
    if (route?.params?.location) {
      const { latitude, longitude } = route?.params?.location;
      console.log('latitude', latitude);
      console.log('longitude', longitude);
      _getMoreUser({ latitude, longitude });
    }
  }, [route]);

  useEffect(() => {
    return () => {
      stopVoiceMessage(audioPlayerRef.current);
      playingVoiceIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isFocused && playingVoiceIdRef.current) {
      _stopVoiceMessage();
    }
  }, [isFocused, _stopVoiceMessage]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Show an alert when back button is pressed
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            {
              text: 'Cancel',
              onPress: () => null, // Do nothing
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                BackHandler.exitApp();
              }, // Exit the app
            },
          ],
          { cancelable: false },
        );

        return true;
      };

      // Add event listener for hardware back button press
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        // Remove event listener when component unmounts
        backHandler.remove();
      };
    }, []),
  );

  useEffect(() => {
    getProfile();
    setTimeout(() => {
      sethideEmpty(false);
    }, 3000);
    _checkLocation();
  }, [subscription]);



  useLayoutEffect(() => {
    getProfile();
  }, [isFocused]);


  const _getMoreUser = ({ keyword, pageNo, latitude, longitude }) => {
    const apiData = {
      pageNo: pageNo + 1,
      search: keyword,
      latitude,
      longitude,
    };
    // setLoading(true)
    matchUserListApi(apiData, pageNo + 1)
      .then(res => {
        setLoading(false);
        setmaxpage(res?.data?.last_page);
        if (res?.data?.data?.length > 0) {
          setCardsData(prev => [...prev, ...res?.data?.data]);
        }
        setLoading(false);
        setRefreshing(false);
      })
      .catch(error => {
        setLoading(false);
        showError(error?.message);
      });
  };

  useEffect(() => {
    ConnectingSocket(userData);
    socketRef.on('sendMessage', response => {
      chatCounter();
    });
  }, []);

  const chatCounter = () => {
    getChatCount()
      .then(res => {
        saveChatCounter(res?.data);
      })
      .catch(error => {
        console.log(error, 'CHAT_ID error');
      });
  };
  const updateProfile = (lat, long) => {
    Geocoder.from(lat, long)
      .then(json => {
        const completeAdd = json?.plus_code?.compound_code;
        const arr = completeAdd.split(' ');
        let add = '';
        if (Array.isArray(arr) && arr.length > 0) {
          arr.map((item, index) => {
            if (index > 0) {
              add = add + ' ' + item;
            }
          });
          saveUserCurrentLocationToStore(add);
        }

        const addressComponent = json.results[0].address_components;
        let countryComponent = addressComponent.filter(val =>
          val?.types.includes('country'),
        );
        let cityComponent = addressComponent.filter(val =>
          val?.types.includes('administrative_area_level_1'),
        );
        countryComponent = countryComponent[0];
        cityComponent = cityComponent[0];

        const apiData = {
          facebook: userData?.facebook,
          instagram: userData?.instagram,
          linkedin: userData?.linkedin,
          twitter: userData?.twitter,
          first_name: userData?.first_name,
          dob: userData?.dob,
          bio: userData?.bio,
          occupation: userData?.occupation,
          country: countryComponent?.long_name || 'United Kingdom',
          city: cityComponent?.long_name || 'London',
          gender: userData?.gender || 1,
          church_name: userData?.church_name,
          church_role: userData?.church_role || '',
          body_type: userData?.body_type,
          highest_education: userData?.highest_education,
          looking_for: userData?.looking_for,
          height: userData?.height,
          preference: userData?.preference,
          latitude: lat,
          longitude: long,
          married_status: userData?.married_status,
          having_kids: userData?.having_kids,
          about_me: userData?.about_me,
          weight: userData?.weight,
          position: userData?.position,
          tribes: userData?.tribes,
          vaccination: userData?.vaccination,
          hiv_status: userData?.hiv_status,
          meet_at: userData?.meet_at,
          nsfw: userData?.nsfw,
          expectations: userData?.expectations
        };

        updateProfileApi(apiData)
          .then(res => {
            _getAllUsers();
          })
          .catch(error => {
            console.log(error, 'ERRORRRR');
          });
      })
      .catch(error => console.warn(error));
  };

  const _checkLocation = () => {
    checkLocationSevice()
      .then(res => {
        updateProfile(res?.latitude, res?.longitude);
      })
      .catch(error => {
        logoutApi();
        showError(strings.pleaseEnableLocationToContinue);
      });
  };

  // const getSearchUsers
  const _getAllUsers = (keyword, pgNo, _id) => {
    // setLoading(true)
    const apiData = {
      pageNo: 1,
      latitude: userData?.latitude,
      longitude: userData?.longitude,
      search: keyword,
    };

    Promise.all([matchUserListApi(apiData, 1), getBoomPlanDetails()])
      .then(([matchUserListRes, boomPlanDetailsRes]) => {
        setLoading(false);
        if (boomPlanDetailsRes?.data) {
          setBoomPlanDetails(boomPlanDetailsRes?.data);
        }
        let _users = matchUserListRes?.data?.data;
        if (userData?.subscription?.subscription_id === 1) {
          _users = _users.filter((val, ind) => ind < 9);
        }
        setmaxpage(matchUserListRes.data.last_page);
        setPageNo(1);
        setCardsData(matchUserListRes?.data?.data);
        setNextPageUrl(matchUserListRes?.data?.next_page_url);
        setLoading(false);
      })
      .catch(errors => {
        setLoading(false);
        errors.forEach(error => {
          console.error(error);
        });
        showError(errors[0]?.message);
      });
  };

  useEffect(() => {
    ClearData();
    _setFilterValues();
    const unsubscribe = navigation.addListener('focus', () => {
      ConnectingSocket();
    });
    return unsubscribe;
  }, []);

  // Scroll FlatList to top when Browse (Home) tab is pressed again
  useEffect(() => {
    const unsubscribeTabPress = navigation.addListener('tabPress', e => {
      if (cardsData && cardsData.length > 0 && flatListRef.current) {
        try {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        } catch (err) {
          console.log('scrollToOffset error', err);
        }
      }
    });
    return unsubscribeTabPress;
  }, [navigation, cardsData]);

  const _setFilterValues = () => {
    if (userData?.languages && userData?.languages.length > 0) {
      const lang = userData?.languages.map((val, ind) => {
        const obj = {
          id: val,
          name: LANGUAGES[val - 1],
          isSelected: true,
        };
        return obj;
      });
      setLangugaes(lang);
    }
    if (userData?.hobbies && userData?.hobbies.length > 0) {
      const hob = userData?.hobbies.map((val, ind) => {
        const obj = {
          id: val,
          name: HOBBIES[val - 1],
          isSelected: true,
        };
        return obj;
      });
      setHobies(hob);
    }
  };

  const indexTwoView = () => {
    return (
      <View>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: moderateScale(20),
            marginVertical: moderateScaleVertical(10),
          }}>
          <Text
            style={{
              fontSize: textScale(16),
              fontFamily: fontFamily.medium,
              color: theme.colors.black,
            }}>
            Online now
          </Text>
          <Switch
            onValueChange={() => settoggle(!toggle)}
            value={toggle}
            circleSize={20}
            backgroundActive={theme.colors.themecolor2}
            backgroundInactive={theme.colors.lightgreynew}
            circleInActiveColor={theme.colors.toggle}
            renderActiveText={false}
            renderInActiveText={false}
          />
        </View>
        <BonkerBonksFilter
          age={age}
          setAge={val => setAge(val)}
          maxHeight={maxHeight}
          maxDistance={maxDistance}
          // weight={weight}
          // setWeight={val => setWeight(val)}
          meetUp={meetUp}
          setMeetUp={val => setMeetUp(val)}
          // nsfwPicsValue={nsfwValue}
          // setNsfwPicsValue={val => setNSFWValue(val)}
          setMaxDistance={val => setMaxDistance(val)}
          setMaxHeight={val => setMaxHeight(val)}
          // education={education}
          // setEducation={val => setEducation(val)}
          bodyTypeValue={bodyTypeValue}
          setBodyTypeValue={val => setBodyTypeValue(val)}
          lookingFor={lookingFor}
          setLookingFor={val => setLookingFor(val)}
          martitalStatusArr={maritalStatus}
          maritalStatus={maritalStatusValue}
          setMaritalStatus={val => setMaritalStatusValue(val)}
          isChildren={isChildrenValue}
          setIsChildren={val => setIsChildrenValue(val)}
          encountrPosition={position}
          setEncountrPosition={val => setPosition(val)}
          hasPhotos={photos}
          tribesValue={tribeValue}
          setTribesValue={val => setTribeValue(val)}
          setHasPhotos={val => setPhotos(val)}
        />
      </View>
    );
  };

  const ageTopFilter = () => {
    setShowAgeModal(false);
    setLoading(true);
    const apiData = new FormData();
    apiData.append('from_age', age[0]?.toString() || '18');
    apiData.append('to_age', age[1]?.toString() || '99');
    setBonkersFiltersApi(apiData)
      .then(res => {
        console.log(res, 'resss');
        _getAllUsers();
        _setFilterValues();
      })
      .catch(error => {
        showError(ApiError(error));
        console.log(error);
        setLoading(false);
      });
  };

  const positionTopFilter = () => {
    console.log('kplo', selectPosition);
    setShowPosition(false);
    setLoading(true);
    const apiData = new FormData();
    
    // Handle multiple positions
    if (selectPosition && selectPosition.length > 0) {
      const positionNames = selectPosition.map(pos => pos.name).join(',');
      apiData.append('position', positionNames);
      setSelectedIndex(2);
      setPosition(selectPosition);
    } else {
      apiData.append('position', 'Not Specified');
      setSelectedIndex(null);
      setPosition([]);
    }
    
    setBonkersFiltersApi(apiData)
      .then(res => {
        _getAllUsers();
        _setFilterValues();
      })
      .catch(error => {
        showError(ApiError(error));
        console.log(error);
        setLoading(false);
      });
  };

  const _onSetFilter = () => {
    setIsPreferancesModalVisible(false);
    setLoading(true);
    const apiData = new FormData();
    apiData.append('interested_in', preferredGenderValue?.id || 4);
    apiData.append('looking_for', lookingFor?.name || LOOKING_FOR[0]);
    
    // Handle multiple body types
    if (Array.isArray(bodyTypeValue) && bodyTypeValue.length > 0) {
      const bodyTypeNames = bodyTypeValue.map(type => type.name).join(',');
      apiData.append('body_type', bodyTypeNames);
    } else if (bodyTypeValue?.name) {
      apiData.append('body_type', bodyTypeValue.name);
    } else {
      apiData.append('body_type', 'Not Specified');
    }
    
    apiData.append('distance', maxDistance.toString() || '1000');
    apiData.append('from_age', age[0]?.toString() || '18');
    apiData.append('to_age', age[1]?.toString() || '99');
    apiData.append('is_location', userData?.filters?.is_location || '1');
    apiData.append('maximum_height', maxHeight || '7');
    apiData.append('ink', ink?.name || INK[0]);
    apiData.append('education', education?.name || EDUCATION[0]);
    apiData.append('occupation', occupation?.name || OCCUPATION[0]);
    apiData.append('children', children?.name || CHILDREN[0]);
    apiData.append('weight', Number(weight) || '');
    
    // Handle multiple meet at options
    if (Array.isArray(meetUp) && meetUp.length > 0) {
      const meetAtNames = meetUp.map(option => option.name).join(',');
      apiData.append('meet_at', meetAtNames);
    } else if (meetUp?.name) {
      apiData.append('meet_at', meetUp.name);
    } else {
      apiData.append('meet_at', '');
    }
    
    apiData.append('nsfw_pics', nsfwValue?.name || '');
    apiData.append('pets', Number(pets) || 1);
    apiData.append('religion', 'any');
    apiData.append('is_smoker', Number(isSmoker) || 1);
    apiData.append('sexuality', 1);
    apiData.append('piercing', piercingValue ? 1 : 2 || 1);
    apiData.append('foodie', foodie ? 1 : 2 || 1);
    apiData.append('drinking', drinking?.id || DRINKING[0]?.id);
    apiData.append('fitness', fitness?.id || FITNESS[0]?.id);
    apiData.append('lifestyle', lifestyle?.id || LIFE_STYLE[0]?.id);
    apiData.append('driving_license', drivingLicense ? 1 : 2 || 1);
    apiData.append('personality', personality?.id || '1');
    
    // Handle multiple positions
    if (Array.isArray(position) && position.length > 0) {
      const positionNames = position.map(pos => pos.name).join(',');
      apiData.append('position', positionNames);
    } else if (position?.name) {
      apiData.append('position', position.name);
    } else {
      apiData.append('position', 'Not Specified');
    }
    
    // Handle multiple tribes
    if (Array.isArray(tribeValue) && tribeValue.length > 0) {
      const tribeNames = tribeValue.map(tribe => tribe.name).join(',');
      apiData.append('tribes', tribeNames);
    } else if (tribeValue?.name) {
      apiData.append('tribes', tribeValue.name);
    } else {
      apiData.append('tribes', 'Not Specified');
    }
    apiData.append('has_photo_type', photos[0]?.value || '');
    apiData.append('online_status', toggle ? 1 : 0);
    apiData.append('lat',coordinates?.lat || coordinates?.latitude || userData?.latitude || null,);
    apiData.append('long',coordinates?.lng || coordinates?.longitude || userData?.longitude || null,);
    apiData.append('preference', preferences?.name);
    apiData.append('location', selectedAddress);
    apiData.append('languages',languages.map(ite => ite?.id),);
    apiData.append('hobbies',hobies.map(ite => ite?.id),);
    apiData.append('favourite_place',favPlaces.map(ite => ite?.id),);
    apiData.append('interests',interests.map(ite => ite?.id),);
    apiData.append('cuisin',cuisin.map(ite => ite?.id),);
    apiData.append('married_status',maritalStatusValue?.id || maritalStatusValue,);
    apiData.append('having_kids', isChildrenValue?.name || isChildrenValue);

    setBonkersFiltersApi(apiData)
      .then(res => {
        console.log(res, 'resss');
        _getAllUsers();
        _setFilterValues();
      })
      .catch(error => {
        showError(ApiError(error));
        console.log(error);
        setLoading(false);
      });
  };

  const onUserCardPress = useCallback(item => {
    // {console.log('user card', item?.distance)}
    navigation.navigate(navigationString.VIEWPROFILE, {
      prevScreenData: item,
      hideProfile,
    });
  }, [hideProfile, navigation]);

  const renderProfileListItem = useCallback(
    ({ item }) => {
      const rawId = item?.id ?? item?._id;
      const itemId = rawId == null ? null : String(rawId);
      const isVoiceActive =
        playingVoiceId != null && itemId != null && playingVoiceId === itemId;
      return (
        <HomeComponent
          item={item}
          onPress={onUserCardPress}
          onSpeakerPress={_onSpeakerPress}
          isPlayingVoice={isVoiceActive}
        />
      );
    },
    [onUserCardPress, _onSpeakerPress, playingVoiceId],
  );

  const keyExtractor = useCallback((item, index) => {
    return String(item?.id ?? item?._id ?? index);
  }, []);

  const _onSayHello = () => {
    if (userData?.subscription?.subscription_id === 3) {
      setTimeout(() => {
        navigation.navigate(navigationString.CHATSCREEN, {
          prevData: itsMatchModal?.data?.sent_to,
        });
      }, 600);
      setItsMatchModal({ isVisible: false, userPic: null, data: {} });
    } else if (userData?.subscription?.subscription_id === 2) {
      setTimeout(() => {
        navigation.navigate(navigationString.CHATSCREEN, {
          prevData: itsMatchModal?.data?.sent_to,
        });
      }, 600);
      setItsMatchModal({ isVisible: false, userPic: null, data: {} });
    } else {
      Alert.alert(
        strings.appName,
        'You require a subscription to send a message. Do you want to subscribe now?',
        [
          {
            text: 'Yes',
            onPress: () => {
              navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
                isBack: true,
                from: 'Home',
              }),
                setItsMatchModal({ isVisible: false, userPic: null, data: {} });
            },
          },
          {
            text: 'No',
            style: 'destructive',
          },
        ],
      );
    }
  };

  const _onKeepSwiping = () => {
    setItsMatchModal({ isVisible: false, userPic: null, data: {} });
    navigation.navigate(navigationString.HOME);
  };

  const getProfile = () => {
    getUserProfile()
      .then(res => {
        saveViewedProfileToStore(res?.data?.viewed_profile_ids);
        setViewProfileIds(res?.data?.viewed_profile_ids);
        // setSubscription(res?.data?.subscription?.likes_left)
      })
      .catch(err => {
        console.log('DATA++++++GUFRAN', err);
        sethideProfile(err?.success);
      });
  };

  const _onEndReached = () => {
    console.log('_onEndReached', `page no ${pageNo}, maxPage ${maxpage}`);
    if (pageNo < maxpage) {
      console.log('_onEndReached', 'Inside_Condition');
      // // Use the updated pageNo directly in the function call
      _getMoreUser({ keyword: searchText, pageNo: pageNo, latitude: userData?.latitude, longitude: userData?.longitude });
      // // Update the pageNo state separately after the function call
      setPageNo(pageNo + 1);
    }
  };

  const handleCategoryPress = index => {
    setSelectedIndex(index);
    if (index == 0) {
      const apiData = new FormData();
      apiData.append('online_status', 1);
      setBonkersFiltersApi(apiData)
        .then(res => {
          _getAllUsers();
          setSearchText('');
          settoggle(false);
          _setFilterValues();
        })
        .catch(error => {
          showError(ApiError(error));
          console.log(error);
          setLoading(false);
        });
    } else if (index == 1) {
      setShowAgeModal(true);
    } else if (index == 2) {
      setShowPosition(true);
    } else if (index == 3) {
      getFreshUser();
    } else if (index == 4) {
      setIsPreferancesModalVisible(true);
    }
  };

  const getFreshUser = () => {
    getFreshUsers()
      .then(res => {
        setmaxpage(res?.data?.last_page);
        setPageNo(1);
        setCardsData(res?.data?.data);
        setLoading(false);
      })
      .catch(error => {
        console.log('error=>', error);
      });
  };

  const updatedData = data => {
    setlocationExplore(data);
  };

  const handleSearchSubmit = keyword => {
    setSearchText(keyword);
    _getAllUsers(keyword, pageNo);
  };

  const _onRefresh = () => {
    // setLoading(true)
    isFreshSelected ? getFreshUser() : _getAllUsers(searchText);
    // setLoading(false)
  };

  const ClearData = () => {
    setLoading(true);
    const apiData = new FormData();
    // apiData.append('interested_in', preferredGenderValue?.id || 4);
    apiData.append('looking_for', 'Not Specified');
    apiData.append('body_type', 'Not Specified');
    // // apiData.append('distance', maxDistance.toString() || '1000');
    apiData.append('from_age', '');
    apiData.append('to_age', '');
    // apiData.append('is_location', userData?.filters?.is_location || '1');
    apiData.append('maximum_height', '8');
    apiData.append('weight', '500');
    apiData.append('meet_at', 'Not Specified');
    apiData.append('position', 'Not Specified');
    apiData.append('tribes', 'Not Specified');
    apiData.append('has_photo_type', 'Not Specified');
    apiData.append('online_status', 0);
    apiData.append('married_status', 9);
    setBonkersFiltersApi(apiData)
      .then(res => {
        _getAllUsers();
        setSearchText('');
        _setFilterValues();
      })
      .catch(error => {
        showError(ApiError(error));
        console.log(error);
        setLoading(false);
      });
  };

  const _onClear = () => {
    Alert.alert(strings.appName, 'Are you sure to clear all the filters', [
      {
        text: 'Yes',
        onPress: () => {
          handleCategoryPress(5);
          setIsPreferancesModalVisible(false);
          ClearData();
        },
      },
      {
        text: 'No',
        style: 'destructive',
      },
    ]);
  };

  const onContinueBtnPress = () => {
    setBoomModal(false);
    setTimeout(() => {
      setLoading(true);
      checkOutBoomPlan()
        .then(res => {
          if (res?.data?.url) {
            navigation.navigate(navigationString.BOOM_ME, {
              url: res?.data?.url,
            });
          }
          setLoading(false);
          setBoomModal(false);
        })
        .catch(error => {
          console.log('Error while checking out', error);
          setLoading(false);
          showError(error?.message);
        });
    }, 600);
  };

  const renderHeader = () => {
    return (
      <View>
        <ImgBgComponent imgSource={isDark ? imagesPath.darkHomeBgImg : imagesPath.homeBgImage}>
          <View
            style={{
              ...enCounterHomestyles.rowCenterView,
              ...enCounterHomestyles.marginBottom20,
            }}>
            <View
              style={{
                ...enCounterHomestyles.leftHalfContainer,
                ...enCounterHomestyles.rowCenterView,
              }}>
              <TouchableOpacity
                hitSlop={hitSlopProp}
                activeOpacity={0.8}
                onPress={() => {
                  navigation.openDrawer();
                }}>
                <CustomImage
                  source={
                    userData.profile_image
                      ? { uri: userData?.profile_image }
                      : imagesPath.userRoundIcon
                  }
                  style={{
                    height: moderateScale(26),
                    width: moderateScale(26),
                    borderWidth: 1,
                    borderColor: theme.colors.white,
                  }}
                  imgLoaderStyle={enCounterHomestyles.userImg}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(navigationString.EXPLORE, {
                    updatedData: data => {
                      updatedData(data);
                    },
                  });
                  setexplore(true);
                  setviewedme(false);
                }}
                style={{
                  flexDirection: 'row',
                  marginLeft: moderateScale(12),
                  alignItems: 'center',
                }}>
                <Image source={imagesPath.explore} tintColor={explore ? theme.colors.primaryWhite : theme.colors.primaryWhiteOpacity70} />
                <Text
                  style={{
                    ...enCounterHomestyles.exploreTxtStyle,
                    fontFamily: explore ? fontFamily.bold : fontFamily.regular,
                  }}>
                  {strings.explore}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                ...enCounterHomestyles.halfViewContainer,
                ...enCounterHomestyles.rowCenterView,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setviewedme(true);
                  setexplore(false);
                  navigation.navigate(navigationString.VIEWED_ME_LIST);
                }}
                style={enCounterHomestyles.rowCenterView}>
                <Text
                  style={{
                    ...enCounterHomestyles.viewedTxtStyle,
                    fontFamily: viewedme ? fontFamily.bold : fontFamily.regular,
                  }}>
                  {strings.viewed_Me}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                hitSlop={hitSlopProp}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate(navigationString.CONTACT_US)
                }>
                <Image
                  source={imagesPath.notificationIcon}
                  style={commonStyles.user26IconStyle}
                />
              </TouchableOpacity>
            </View>
          </View>

          <HomeSearchComponent
            search={searchText}
            onSubmitEditing={handleSearchSubmit}
            onPressCross={() => {
              setSearchText('');
              _getAllUsers();
            }}
          />
        </ImgBgComponent>

        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={enCounterHomestyles.filterContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setTimeout(() => setIsPreferancesModalVisible(true), 300)
              }>
              <Image
                source={imagesPath.homeFilter}
                style={commonStyles.iconStyle24}
              />
            </TouchableOpacity>

            {categorylistData.map((item, index) => (
              <TouchableOpacity
                key={item.index}
                style={[
                  enCounterHomestyles.categoryItem,
                  selectedIndex === item.index &&
                  enCounterHomestyles.selectedCategoryItem,
                ]}
                onPress={() => {
                  setIsFreshSelected(index == 3);
                  if (selectedIndex === item.index) {
                    setIsFreshSelected(false);
                    if (item.index === 2) {
                      handleCategoryPress(item.index);
                    } else {
                      handleCategoryPress(5);
                      ClearData();
                    }
                  } else {
                    handleCategoryPress(item.index);
                  }
                }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    enCounterHomestyles.categoryItemTxt,
                    selectedIndex === item.index &&
                    enCounterHomestyles.selectedCategoryItemTxt,
                  ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (

    <WrapperContainer
      statusbarcolorr={theme.colors.themecolor2}
      isSafeAreaAvailable={false}
      paddingAvailable={false}
      isWhiteStatusBar={false}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            showsVerticalScrollIndicator={false}
            data={cardsData}
            bounces={true}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={7}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={!isLoading && isRefreshing}
                onRefresh={_onRefresh}
              />
            }
            contentContainerStyle={commonStyles.listViewContainer}
            renderItem={renderProfileListItem}
            keyExtractor={keyExtractor}
            numColumns={3}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={() => {
              return (
                <ListEmptyComponent
                  icon={imagesPath.out_of_swipes}
                  firstMessage={'Oops! No profiles found.'}
                  secondMessage={'Consider changing your search filters'}
                />
              );
            }}
            ListFooterComponent={
              pageNo < maxpage ? (
                <ActivityIndicator
                  animating={pageNo < maxpage}
                  size={'large'}
                  color={theme.colors.black}
                  style={{ marginVertical: moderateScale(12) }}
                />
              ) : (
                <></>
              )
            }
            onEndReached={_onEndReached}
            onEndReachedThreshold={0.4}
          />
        </View>

        {cardsData?.length > 0 && cardsData?.length > currentIndex && <></>}
      </View>

      <Loader isLoading={isLoading} />

      <Modal
        visible={isPreferancesModalVisible}
        animationType="slide"
        transparent={true}
        style={styles.modalStyle}>
        <View style={{ ...styles.modalMainContainer }}>
          <View style={{ ...styles.modalContainer, ...styles.modalHeight }}>
            <View style={styles.headerView}>
              <TouchableOpacity
                onPress={() => setIsPreferancesModalVisible(false)}
                hitSlop={hitSlopProp}
                style={{
                  height: moderateScale(48),
                  width: moderateScale(48),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={imagesPath.crossnew}
                  style={{
                    tintColor: theme.colors.black,
                  }}
                />
              </TouchableOpacity>
              <GradientText
                text={strings.filters}
                textStyle={styles.textStyle}
                start={{ x: 0, y: 1 }}
                end={{ x: 0.99, y: 1 }}
              />
              <Text
                onPress={_onClear}
                style={{
                  fontSize: textScale(16),
                  fontFamily: fontFamily.bold,
                  color: theme.colors.black,
                }}>
                Clear
              </Text>
            </View>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={'handled'}
              contentContainerStyle={{ paddingBottom: moderateScale(40) }}>
              {indexTwoView(toggle)}
            </KeyboardAwareScrollView>
            <ButtonComp
              onPressBtn={_onSetFilter}
              btnText={strings.continue}
              btnStyle={{ marginHorizontal: moderateScale(20) }}
              btnView={{ borderRadius: moderateScale(30) }}
            />
          </View>
        </View>
      </Modal>

      <ModalNew
        isVisible={boomModal}
        onBackdropPress={() => {
          setBoomModal(false);
        }}
        style={{
          margin: 0,
          justifyContent: 'flex-end',
        }}>
        <View style={styles.boomMain}>
          <Image source={imagesPath.boom} style={{ alignSelf: 'center' }} />
          <Text style={styles.boomTxt}>{strings.boomME}</Text>
          <Text style={styles.beSeenByMorePeople}>
            {strings.BeSeenByMorePeople}
          </Text>
          <Text style={styles.learnMore}>{strings.LearnMore}</Text>
          <TouchableOpacity style={styles.pricingView} activeOpacity={0.8}>
            <View
              style={{ flex: 0.4, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.timing}>
                {`${boomPlanDetails?.duration} ${boomPlanDetails?.duration > 1
                  ? `${strings.DAY}s`
                  : strings.DAY
                  }`}
              </Text>
              {
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: moderateScale(10),
                  }}>
                  <Text
                    style={{
                      fontSize: textScale(14),
                      color: theme.colors.themecolor2,
                      fontFamily: fontFamily.bold,
                    }}>
                    {boomPlanDetails?.title}
                  </Text>
                  <Image
                    source={imagesPath.ic_right_icon}
                    style={{
                      tintColor: theme.colors.themecolor2,
                      height: moderateScaleVertical(8),
                      marginLeft: moderateScale(2),
                    }}
                  />
                </View>
              }
            </View>

            <View style={styles.pricetxtview}>
              <Text style={styles.pricetxt}>
                {`$ ${boomPlanDetails?.amount}`}
              </Text>
            </View>
          </TouchableOpacity>
          <ButtonComp
            onPressBtn={onContinueBtnPress}
            btnView={{
              borderRadius: moderateScale(40),
              justifyContent: 'center',
            }}
            btnStyle={{
              borderRadius: moderateScale(40),
              width: width - 40,
              alignSelf: 'center',
              marginVertical: moderateScaleVertical(24),
            }}
            btnText={strings.continue}
          />
        </View>
      </ModalNew>

      <ModalNew
        visible={showPosition}
        animationType="slide"
        transparent={true}
        style={styles.modalStyle}>
        <View style={{ flex: 1 }}>
          <View style={enCounterHomestyles.modalStyle}>
            <TouchableOpacity
              onPress={() => {
                setShowPosition(false);
              }}
              style={enCounterHomestyles.modalCloseSty}>
              <Text style={{ ...commonStyles.font_16_bold }}>X</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
            <ButtonComp
              onPressBtn={positionTopFilter}
              btnText={strings.continue}
              btnStyle={{ marginHorizontal: moderateScale(20) }}
              btnView={{ borderRadius: moderateScale(30) ,marginVertical: moderateScale(20)}}
            />
            <BonkerBonksFilter
              encountrPosition={selectPosition}
              setEncountrPosition={val => {
                setSelectPosition(val);
                setPosition(val);
              }}
            />
            </ScrollView>
          </View>
        </View>
      </ModalNew>

      <ModalNew
        visible={showAgeModal}
        animationType="slide"
        transparent={true}
        style={styles.modalStyle}>
        <View style={{ flex: 1 }}>
          <View style={enCounterHomestyles.modalStyle}>
            <TouchableOpacity
              onPress={() => {
                setShowAgeModal(false);
                handleCategoryPress(5);
              }}
              style={enCounterHomestyles.modalCloseSty}>
              <Text style={{ ...commonStyles.font_16_bold }}>X</Text>
            </TouchableOpacity>
            <BonkerBonksFilter age={age} setAge={val => {
              setAge(val)

            }} />
            <ButtonComp
              onPressBtn={ageTopFilter}
              btnText={strings.continue}
              btnStyle={{ marginHorizontal: moderateScale(20) }}
              btnView={{ borderRadius: moderateScale(30) }}
            />
          </View>
        </View>
      </ModalNew>

      <ItsAMatchModal
        isVisible={itsMatchModal?.isVisible}
        userImage={itsMatchModal?.userPic}
        onSayHello={_onSayHello}
        onKeepSwiping={_onKeepSwiping}
      />

      {/* <View pointerEvents="box-none" style={enCounterHomestyles.cypherFabWrap}>
        <Animated.View
          pointerEvents="none"
          style={[
            enCounterHomestyles.cypherFabPulse,
            {
              transform: [
                {
                  scale: cypherPulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.55],
                  }),
                },
              ],
              opacity: cypherPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.55, 0],
              }),
            },
          ]}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={_onCypherPress}
          hitSlop={hitSlopProp}
          style={enCounterHomestyles.cypherFabBtn}>
          <LinearGradient
            colors={['#FFFFFF', '#E0B6FF', '#9B4DFF', '#3B1080']}
            start={{ x: 0.3, y: 0.2 }}
            end={{ x: 1, y: 1 }}
            style={enCounterHomestyles.cypherFabGradient}>
            <View style={enCounterHomestyles.cypherFabCore} />
          </LinearGradient>
          <Text style={enCounterHomestyles.cypherFabLabel}>CYPHER</Text>
        </TouchableOpacity>
      </View> */}
    </WrapperContainer>
  );
};
const getStyles = (theme, commonStyles) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  marginBottom20: {
    marginBottom: verticalScale(20),
  },
  rowCenterView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftHalfContainer: {
    flex: 5.6,
    justifyContent: 'space-between',
  },
  halfViewContainer: {
    flex: 6,
    justifyContent: 'space-between',
  },
  userImgStyle: {
    flex: 0.3333,
    height: height / 6.8,
  },
  userDetailContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: verticalScale(10),
    paddingBottom: verticalScale(4),
  },
  userNameTxtStyle: {
    ...commonStyles.font_14_SemiBold,
    marginLeft: moderateScale(4),
    color: theme.colors.white,
  },
  exploreTxtStyle: {
    ...commonStyles.font_16_SemiBold,
    color: theme.colors.primaryWhite,
    marginRight: verticalScale(28),
    marginLeft: moderateScale(4),
  },
  viewedTxtStyle: {
    ...commonStyles.font_16_medium,
    color: theme.colors.primaryWhite,
    marginLeft: verticalScale(4),
  },
  searchBarStyle: {
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(24),
    height: verticalScale(45),
    paddingHorizontal: verticalScale(16),
    marginBottom: verticalScale(5),
  },
  searchTxtStyle: {
    ...commonStyles.font_14_medium,
    color: theme.colors.placeHolderColor,
    marginLeft: verticalScale(10),
    marginTop: moderateScaleVertical(2),
    width: '90%',
  },
  viewedMeContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(40),
    paddingHorizontal: moderateScale(6),
    marginLeft: moderateScale(4),
  },
  eyeIconStyle: {
    ...commonStyles.iconStyle11,
    marginRight: verticalScale(4),
  },
  headerContainer: {
    backgroundColor: theme.colors.themecolor2,
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(15),
  },
  profilViewedLeftContainer: {
    backgroundColor: theme.colors.blackOpacity70,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(8),
  },
  btnStyle: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
  },
  btnTxtStyle: {
    ...commonStyles.font_12_SemiBold,
    color: theme.colors.themecolor2,
    fontSize: textScale(14),
  },
  profileViewedLeftTxt: {
    ...commonStyles.font_13_medium,
  },
  marginLeft24: {
    marginLeft: moderateScale(24),
  },
  txtStyle: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.white,
  },
  categoryItem: {
    justifyContent: 'center',
    marginLeft: moderateScale(15),
    height: moderateScale(28),
  },
  selectedCategoryItem: {
    height: moderateScale(28),
    justifyContent: 'center',
    backgroundColor: theme.colors.themecolor2,
    paddingHorizontal: moderateScale(15),
    borderRadius: moderateScale(20),
  },
  categoryItemTxt: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.filterTxt,
  },
  selectedCategoryItemTxt: {
    ...commonStyles.font_14_medium,
    color: theme.colors.primaryWhite,
  },
  filterContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    paddingHorizontal: moderateScale(18),
  },
  imagePlaceholder: {
    width: 200, // Adjust according to your image size
    height: 200, // Adjust according to your image size
    borderRadius: 10, // Adjust according to your image style
  },
  userImg: {
    height: moderateScaleVertical(26),
    width: moderateScale(26),
    borderRadius: moderateScale(13),
  },
  modalCloseSty: {
    width: '10%',
    height: '10%',
    backgroundColor: theme.colors?.backgroundGrey,
    alignItems: 'center',
    justifyContent: 'center',
    top: -20,
    borderRadius: 30,
    alignSelf: 'flex-end',
    marginRight: moderateScale(5),
  },
  modalStyle: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    backgroundColor: theme.colors.white,
    bottom: 0,
  },
  cypherFabWrap: {
    position: 'absolute',
    right: moderateScale(18),
    bottom: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cypherFabPulse: {
    position: 'absolute',
    height: moderateScale(64),
    width: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: 'rgba(195, 0, 255, 0.45)',
  },
  cypherFabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cypherFabGradient: {
    height: moderateScale(56),
    width: moderateScale(56),
    borderRadius: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C300FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  cypherFabCore: {
    height: moderateScale(14),
    width: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  cypherFabLabel: {
    marginTop: moderateScale(6),
    color: theme.colors.florsentTheme,
    fontSize: textScale(10),
    fontFamily: fontFamily.bold,
    letterSpacing: moderateScale(2),
  },
});

export default Home;
