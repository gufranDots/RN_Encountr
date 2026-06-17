import notifee, {EventType} from '@notifee/react-native';
import NetInfo from '@react-native-community/netinfo';
import React, {FC, useEffect, useState} from 'react';
import {Appearance, Image, Text, View} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import Geocoder from 'react-native-geocoding';
import {initConnection, endConnection} from 'react-native-iap';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {SlowInternet} from './src/Components/SlowInternet';
import NavigationService from './src/Navigation/NavigationService';
import Routes from './src/Navigation/Routes';
import imagesPath from './src/constants/imagesPath';
import navigationString from './src/constants/navigationString';
import {
  saveAllHomeData,
  saveFcmTokenToRedux,
  saveOnBoardData,
  saveProfileSetupDoneToStore,
  saveUserDataToStore,
} from './src/redux/reduxActions/authActions';
import { isUserProfileComplete } from './src/utils/profileCompletion';
import {
  getChatCount,
  saveChatCounter,
} from './src/redux/reduxActions/chatActions';
import {
  getChatCounts,
  matchUserListApi,
  updateChatCOunt,
} from './src/redux/reduxActions/homeActions';
import {updateProfileApi} from './src/redux/reduxActions/profileActions';
import store from './src/redux/store';
import colors from './src/styles/colors';
import {moderateScale} from './src/styles/responsiveSize';
import {getCurrentLocation, showError} from './src/utils/helperFunctions';
import {checkLocationSevice} from './src/utils/miscellaneous';
import {
  notificationListener,
  registerForegroundMessageHandler,
  requestUserPermission,
} from './src/utils/notificationServices';
import {getItem, getOnBoardData, getUserData} from './src/utils/utils';
import Splash from './src/Screens/Splash/Splash';
import {configureZegoCloud} from './src/utils/zegoConfigureFile';
import NetworkDebugger from './src/Components/NetworkDebugger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { hideSplash } from 'react-native-splash-view'
import { setTheme } from './src/redux/reduxReducers/themeReducers';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { getCommonStyles } from './src/styles/commonStyles';

const AppContent: FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [currentScreen,setCurrentScreen] = useState(<Splash />)
  const [isConnected, setIsConnected] = useState<Boolean>(true);
  const [isSlowConnection, setSlowConnection] = useState(false);
  const changeCount = useSelector(
    (state: any) => state?.homeReducers?.changeCount,
  );
  const commonStyles = getCommonStyles(theme);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        hideSplash();
      } catch (e) {
        console.warn('hideSplash failed:', e);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch(setTheme(colorScheme ?? 'dark'));
    });

    return () => subscription.remove();
  }, [dispatch]);


  useEffect(() => {
    getCount();
  }, [changeCount]);

  const getCount = () => {
    getChatCounts()
      .then((res: any) => {
        updateChatCOunt(res?.data);
      })
      .catch(error => {
        console.log('error=>', error);
      });
  };
  
  useEffect(() => {
    // Check network connection status on component mount
    const unsubscribe = NetInfo.addEventListener(state => {
      if (
        state.isConnected &&
        state.isInternetReachable &&
        state.type === 'cellular' &&
        state.details?.cellularGeneration === '2g'
      ) {
        setIsConnected(true);
        setSlowConnection(true);
      } else {
        setIsConnected(!!state.isConnected);
        setSlowConnection(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    _saveUserData();
    _saveOnBoardData();
    initConnection();

    let timeout = setTimeout(() => {
      setCurrentScreen(<Routes />)
    }, 3000);
    return () => {
      clearTimeout(timeout);
      endConnection();
    }
  }, []);

  const _saveUserData = async () => {
    await getUserData().then((res: Object | any) => {
      if (res?.token) {
        console.log("jojojjoj", res?.first_name);
        
        configureZegoCloud({
          id: String(res?.id),
          user_name: res?.first_name || res?.full_name,
        });
      }
      if (isUserProfileComplete(res)) {
        saveProfileSetupDoneToStore(true);
      } else {
        saveProfileSetupDoneToStore(false);
      }
      saveUserDataToStore(res);
    });
  };

  const _saveOnBoardData = async () => {
    await getOnBoardData().then((res: boolean | any) => {
      if (res == null) {
        saveOnBoardData(true);
      } else {
        saveOnBoardData(res);
      }
    });
  };

  useEffect(() => {
    requestUserPermission();
    notificationListener();
    const unsubscribeForeground = registerForegroundMessageHandler();
    return () => {
      unsubscribeForeground?.();
    };
  }, []);

  const updateProfile = async () => {
    await getUserData().then((res: Object | any) => {
      const apiData = {
        first_name: res?.first_name,
        dob: res?.dob,
        bio: res?.bio,
        occupation: res?.occupation,
        country: res?.country,
        city: res?.city,
        gender: res?.gender || 1,
        church_name: res?.church_name,
        church_role: res?.church_role || '',
        body_type: res?.body_type,
        highest_education: res?.highest_education,
        looking_for: res?.looking_for,
        height: res?.height,
        preference: res?.preference,
      };
      updateProfileApi(apiData)
        .then(res => {
          console.log(res, 'response from api ==>>>>>');

          // saveUserData({...res, is_notification_exist: false});
        })
        .catch(error => {
          console.log(error, 'ERRORRRR');
        });
    });
  };

  const _getAllUsers = () => {
    const apiData = {
      pageNo: 1,
      // latitude:coords?.latitude,
      // longitude:coords?.longitude
    };

    matchUserListApi(apiData, 1)
      .then((res: any) => {
        saveAllHomeData(res?.data?.data);

        console.log(res, 'matchUserListApi res');
      })
      .catch(error => {
        console.log(error);
        showError(error?.message);
      });
  };


  useEffect(() => {
    notifee.setBadgeCount(0).then(() => console.log('Badge count removed!'));

    let unsubscribe1 = notifee.onForegroundEvent(({type, detail}) => {
      if (detail?.notification?.data?.type === 'chat') {
        getChatCount()
          .then((res: any) => {
            console.log(res, 'CHAT_ID res');
            saveChatCounter(res?.data);
            updateChatCOunt(true);
          })
          .catch(error => {
            console.log(error, 'CHAT_ID error');
          });
      }
      if (detail?.notification?.data?.type === 'mass_messaging') {
        updateProfile();
      }
      if (detail?.notification?.data?.type === 'like') {
        _getAllUsers();
      }
      if (detail?.notification?.data?.type === 'match') {
        _getAllUsers();
      }

      // if (detail?.notification?.data?.type === 'idle') {
      //   refreshApp();
      //   setTimeout(() => {
      //     NavigationService.resetNavigation(navigationString.HOME);
      //   }, 600);
      // }

      if (type === EventType.PRESS) {
        if (detail?.notification?.data?.type === 'chat') {
          getChatCount()
            .then((res: any) => {
              console.log(res, 'CHAT_ID res', detail?.notification);
              updateChatCOunt(true);
              saveChatCounter(res?.data);
              getUserData().then(res => {
                if (res?.subscription?.subscription_id === 3) {
                  NavigationService.navigate(navigationString.CHATSCREEN, {
                    prevData: detail?.notification?.data?.sender_id,
                  });
                } else if (res?.subscription?.subscription_id === 2) {
                  NavigationService.navigate(navigationString.CHATSCREEN, {
                    prevData: detail?.notification?.data?.sender_id,
                  });
                }
              });
            })
            .catch(error => {
              console.log(error, 'CHAT_ID error');
            });
        }
        if (detail?.notification?.data?.type === 'like') {
          _getAllUsers();
          NavigationService.navigate(navigationString.MATCHSCREEN, {
            prevData: 2,
          });
        }
        if (detail?.notification?.data?.type === 'match') {
          NavigationService.navigate(navigationString.MATCHSCREEN);
        }
        if (detail?.notification?.data?.type === 'mass_messaging') {
          NavigationService.navigate(navigationString.CONTACT_US);
        }
      }
    });
    return () => unsubscribe1();
  }, []);

  //main app body content
  return (
    <>
      {isConnected ? (
        isSlowConnection ? (
          <>
            <Routes />
            <FlashMessage position="top" />
            <SlowInternet isLoading={isSlowConnection} message={undefined} />
            {/* {__DEV__ && <NetworkDebugger />} */}
          </>
        ) : (
          <>
            <Routes />
            <FlashMessage position="top" />
            {/* {__DEV__ && <NetworkDebugger />} */}
          </>
        )
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.white,
          }}>
          <Image
            source={imagesPath.no_wifi}
            style={{ height: moderateScale(60), width: moderateScale(60), tintColor : theme.colors.black }}
          />
          <Text
            style={{
              ...commonStyles.font_16_SemiBold,
              color: theme.colors.black
            }}>
            No Internet Connection
          </Text>
        </View>
      )}
    </>
  );
};

const App: FC = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <ThemeProvider>
          <Provider store={store}>
            <AppContent />
          </Provider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
// export default App;
