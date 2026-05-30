// import liraries
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GradientText from '../../Components/GradientText';

import ItsAMatchModal from '../../Components/ItsAMatchModal';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import {Loader} from '../../Components/Loader';
import MatchCard from '../../Components/MatchCard';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import {likeDislikeUserApi} from '../../redux/reduxActions/homeActions';
import {
  getAllMatchesApi,
  getBonkersFriendsApi,
  getBonkersRequestsApi,
} from '../../redux/reduxActions/MatchesActions';
import colors from '../../styles/colors';
import { getCommonStyles } from '../../styles/commonStyles';
import fontFamily from '../../styles/fontFamily';
import {height, moderateScale, width} from '../../styles/responsiveSize';
import {
  ApiError,
  ApplyEaseOutAnimation,
  showError,
} from '../../utils/helperFunctions';
import {stableKeyExtractor} from '../../utils/stableKeyExtractor';
import {useSelector} from 'react-redux';
import UpgradePlanScreen from '../../Components/UpgradePlanScreen';
import {BlurView} from '@react-native-community/blur';
import {enableFreeze} from 'react-native-screens';
import {useIsFocused} from '@react-navigation/native';
import {
  getChatCount,
  saveChatCounter,
} from '../../redux/reduxActions/chatActions';
import {ConnectingSocket, socketRef} from '../../utils/utils';
import { useTheme } from '../../theme/ThemeProvider';
enableFreeze();
// create a component
const MatchScreen = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const {navigation, route} = props;
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const isFocused = useIsFocused();
  const listRef = useRef(null);

  const [isLoading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    route?.params?.prevData === 2 ? 2 : 1,
  );
  const [isCount, setIsCount] = useState(0);
  const [allMatches, setAllMatches] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);

  const [allRequests, setAllRequests] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const [allRequestsPageNo, setallRequestsPageNo] = useState(1);
  const [allFriendsPageNo, setallFriendsPageNo] = useState(1);
  const [allRequestsHasMoreData, setAllRequestsHasMoreData] = useState(false);
  const [allFriendsHasMoreData, setAllFriendsHasMoreData] = useState(false);
  const [allRequestsIsRefreshing, setAllRequestsRefreshing] = useState(false);
  const [allFriendsIsRefreshing, setAllFriendsRefreshing] = useState(false);

  const [itsMatchModal, setItsMatchModal] = useState({
    isVisible: false,
    userPic: null,
    data: {},
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      _hitFromStart();
    });
    return unsubscribe;
  }, [pageNo, allRequestsPageNo]);

  useEffect(() => {
    _getMatches();
  }, [pageNo, activeTab]);

  useEffect(() => {
    if (activeTab === 2) {
      _getAllRequests();
    }
  }, [activeTab, isFocused]);

  useEffect(() => {
    ConnectingSocket(userData);
    socketRef.on('sendMessage', response => {
      chatCounter();
    });
  }, []);

  const chatCounter = () => {
    getChatCount()
      .then(res => {
        console.log(res, 'CHAT_ID res');
        saveChatCounter(res?.data);
      })
      .catch(error => {
        console.log(error, 'CHAT_ID error');
      });
  };

  const _scrollTop = () => {
    if (listRef.current) {
      listRef.current?.scrollToOffset({y: 0, animated: true});
    }
  };

  const _hitFromStart = () => {
    if (activeTab === 1) {
      if (pageNo === 1) {
        _getMatches();
      } else {
        setPageNo(1);
      }
    } else if (activeTab === 2) {
      if (allRequestsPageNo === 1) {
        _getAllRequests();
      } else {
        setallRequestsPageNo(1);
      }
    } else {
      if (allFriendsPageNo === 1) {
        _getAllFriends();
      } else {
        setallFriendsPageNo(1);
      }
    }
    _scrollTop();
  };

  const _getMatches = () => {
    const apiData = {
      pageNo,
      type: 1,
    };

    getAllMatchesApi(apiData)
      .then(res => {
        console.log(res, 'getAllMatchesApi res');
        if (pageNo === 1) {
          setAllMatches(res?.data?.allLiked?.data || []);
        } else {
          setAllMatches([...allMatches, ...res?.data?.allLiked?.data] || []);
        }
        if (res?.data?.next_page_url != null) {
          setHasMoreData(true);
        } else {
          setHasMoreData(false);
        }
        setIsCount(res?.data?.unread_request_count);
        setRefreshing(false);
        setLoading(false);
      })
      .catch(error => {
        setRefreshing(false);
        setHasMoreData(false);
        showError(ApiError(error));
        setLoading(false);
      });
  };

  const _getAllRequests = () => {
    const apiData = {
      pageNo: allRequestsPageNo,
    };

    getBonkersRequestsApi(apiData)
      .then(res => {
        console.log(res, 'getBonkersRequestsApi res');
        if (pageNo === 1) {
          setAllRequests(res?.data?.data || []);
        } else {
          setAllRequests([...allRequests, ...res?.data?.data] || []);
        }
        if (res?.data?.next_page_url != null) {
          setAllRequestsHasMoreData(true);
        } else {
          setAllRequestsHasMoreData(false);
        }
        setIsCount(res?.data?.unread_request_count);
        setAllRequestsRefreshing(false);
        setLoading(false);
      })
      .catch(error => {
        setAllRequestsHasMoreData(false);
        setAllRequestsRefreshing(false);
        showError(ApiError(error));
        setLoading(false);
      });
  };

  const _getAllFriends = () => {
    const apiData = {
      pageNo: allFriendsPageNo,
      type: 2,
    };

    getAllMatchesApi(apiData)
      .then(res => {
        console.log(res, 'getBonkersRequestsApi res');
        if (pageNo === 1) {
          setAllFriends(res?.data?.data || []);
        } else {
          setAllFriends([...allFriends, ...res?.data?.data] || []);
        }
        if (res?.data?.next_page_url != null) {
          setAllFriendsHasMoreData(true);
        } else {
          setAllFriendsHasMoreData(false);
        }
        setAllFriendsRefreshing(false);
        setLoading(false);
      })
      .catch(error => {
        setAllFriendsHasMoreData(false);
        setAllFriendsRefreshing(false);
        showError(ApiError(error));
        setLoading(false);
      });
  };

  const onPressMessage = item => {
    if (userData?.subscription?.subscription_id > 1) {
      navigation.navigate(navigationString.VIEWPROFILE, {
        prevScreenData: item?.sent_from,
        from: '_MY_MATCHES',
      });
    } else {
      Alert.alert(
        strings.appName,
        'You need to subscribe to send chat. Do you want to subscribe?',
        [
          {
            text: 'Yes',
            onPress: () =>
              navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
                isBack: true,
                from: 'Home',
              }),
          },
          {
            text: 'No',
            style: 'destructive',
          },
        ],
      );
    }
  };

  const _renderCards = useCallback(
    ({item, index}) => {
      return (
        <MatchCard
          from={'_MY_MATCHES'}
          onPressCancel={() =>
            _cancelMatch(item, 5, item?.from_user, '_MATCHES')
          }
          onPressMessage={() => _onRequestAccept(item, index)}
          itemData={item}
          name={item?.sent_from?.first_name + ',' || ''}
          age={item?.sent_from?.age || ''}
          pic={item?.sent_from?.profile_image}
          mainContainer={{width: width / 2 - moderateScale(25)}}
          onPressCard={() =>
            navigation.navigate(navigationString.VIEWPROFILE, {
              prevScreenData: item?.sent_from,
              from: '_MY_MATCHES',
            })
          }
        />
      );
    },
    [allMatches],
  );

  const _renderallRequests = useCallback(
    ({item, index}) => {
      return (
        <MatchCard
          from={'_MY_MATCHES'}
          onPressCancel={() =>
            _cancelRequest(item, 3, item?.from_user, '_REQUESTS')
          }
          onPressMessage={() => _onRequestAccept(item, index)}
          itemData={item}
          name={item?.sent_from?.first_name + ',' || ''}
          age={item?.sent_from?.age || ''}
          pic={item?.sent_from?.profile_image}
          mainContainer={{width: width / 2 - moderateScale(25)}}
          onPressCard={() =>
            navigation.navigate(navigationString.VIEWPROFILE, {
              prevScreenData: item?.sent_from,
              from: '_MY_MATCHES',
            })
          }
        />
      );
    },
    [allRequests],
  );

  const _renderallFriends = useCallback(
    ({item, index}) => {
      return (
        <MatchCard
          from={'_MY_MATCHES'}
          onPressCancel={() =>
            _cancelRequest(item, 5, item?.from_user, '_FRIENDS')
          }
          onPressMessage={() => _onRequestAccept(item, index)}
          itemData={item}
          name={item?.sent_from?.first_name + ',' || ''}
          age={item?.sent_from?.age || ''}
          pic={item?.sent_from?.profile_image}
          mainContainer={{
            width: width / 2 - moderateScale(25),
          }}
          onPressCard={() =>
            navigation.navigate(navigationString.VIEWPROFILE, {
              prevScreenData: item?.sent_from,
              from: '_MY_MATCHES',
            })
          }
        />
      );
    },
    [allFriends],
  );

  const _onRequestAccept = (itemData, index) => {
    if (itemData?.status === 1) {
      _hitLikeDislikeApi(itemData, 2, itemData?.from_user);
    } else {
      if (userData?.subscription?.subscription_id > 1) {
        navigation.navigate(navigationString.CHATSCREEN, {
          prevData: itemData?.sent_from,
        });
      } else {
        Alert.alert(
          strings.appName,
          'You need to subscribe to send chat. Do you want to subscribe?',
          [
            {
              text: 'Yes',
              onPress: () =>
                navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
                  isBack: true,
                  from: 'Home',
                }),
            },
            {
              text: 'No',
              style: 'destructive',
            },
          ],
        );
      }
    }
  };

  const _cancelRequest = (item, type, toUserId) => {
    Alert.alert('Alert', 'Are you sure you want to cancel this request?', [
      {
        text: strings.yes,
        onPress: () => _hitLikeDislikeApi(item, type, toUserId),
      },
      {
        text: strings.no,
        style: 'destructive',
      },
    ]);
  };

  const _cancelMatch = (item, type, toUserId) => {
    Alert.alert('Alert', 'Are you sure you want to unmatch?', [
      {
        text: strings.yes,
        onPress: () => _hitLikeDislikeApi(item, type, toUserId),
      },
      {
        text: strings.no,
        style: 'destructive',
      },
    ]);
  };

  const _hitLikeDislikeApi = (itemData, type, toUserId) => {
    // return console.log(type, "_hitLikeDislikeApi", toUserId);
    setLoading(true);
    const apiData = {
      status: type,
      // from_user: type == 1 ? userData?.id : toUserId,
      // user_id: type == 1 ? toUserId : userData?.id
      user_id: toUserId,
      request_type: itemData?.request_type || 1,
    };
    // setLoading(false)
    // return console.log(apiData, 'apiDataapiData')

    likeDislikeUserApi(apiData)
      .then(res => {
        console.log(res?.sent_to?.profile_image_thumb, 'resresresres');
        if (type === 3) {
          setLoading(false);

          if (activeTab === 1) {
            const _arr = allMatches.filter(item => item?.id !== itemData?.id);
            setAllMatches(_arr);
          } else if (activeTab === 2) {
            const _arr = allRequests.filter(item => item?.id !== itemData?.id);
            setAllRequests(_arr);
          } else {
            const _arr = allFriends.filter(item => item?.id !== itemData?.id);
            setAllFriends(_arr);
          }
        } else if (type === 2) {
          // const _arr = allMatches.map((item, ind) => {
          //   if (itemData?.id == item?.id) {
          //     item.status = res?.data?.status
          //   }
          //   return item;
          // })
          // setAllMatches(_arr)

          const _arr = allRequests.filter(item => item?.id !== itemData?.id);
          setAllRequests(_arr);

          setTimeout(() => {
            setLoading(false);
            setItsMatchModal({
              userPic:
                res?.data?.sent_to?.profile_image_thumb ||
                res?.data?.sent_to?.profile_image,
              isVisible: true,
              data: res?.data || {},
            });
          }, 800);
        } else {
          setLoading(false);
          const _arr = allMatches.filter(item => item?.id !== itemData?.id);
          setAllMatches(_arr);
          navigation.goBack();
        }
      })
      .catch(error => {
        showError(ApiError(error));
        setLoading(false);
      });
  };

  const _onRefresh = () => {
    if (activeTab === 1) {
      setRefreshing(true);
      if (pageNo === 1) {
        _getMatches();
      } else {
        setPageNo(1);
      }
    } else if (activeTab === 2) {
      setAllRequestsRefreshing(true);
      if (allRequestsPageNo === 1) {
        _getAllRequests();
      } else {
        setallRequestsPageNo(1);
      }
    } else {
      setAllFriendsRefreshing(true);
      if (allFriendsPageNo === 1) {
        _getAllFriends();
      } else {
        setallFriendsPageNo(1);
      }
    }
  };

  const _onEndReached = () => {
    if (activeTab === 1) {
      if (hasMoreData === true) {
        setPageNo(pageNo + 1);
      }
    } else if (activeTab === 2) {
      if (allRequestsHasMoreData === true) {
        setallRequestsPageNo(allRequestsPageNo + 1);
      }
    } else {
      if (allFriendsHasMoreData === true) {
        setallFriendsPageNo(allFriendsPageNo + 1);
      }
    }
  };

  const _onSayHello = () => {
    if (userData?.subscription?.subscription_id === 3) {
      setTimeout(() => {
        navigation.navigate(navigationString.CHATSCREEN, {
          prevData: itsMatchModal?.data?.sent_to,
        });
      }, 600);
      setItsMatchModal({isVisible: false, userPic: null, data: {}});
    } else if (userData?.subscription?.subscription_id === 2) {
      setTimeout(() => {
        navigation.navigate(navigationString.CHATSCREEN, {
          prevData: itsMatchModal?.data?.sent_to,
        });
      }, 600);
      setItsMatchModal({isVisible: false, userPic: null, data: {}});
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
                from: 'MatchScreen',
              }),
                setItsMatchModal({isVisible: false, userPic: null, data: {}});
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
    setItsMatchModal({isVisible: false, userPic: null, data: {}});
    setTimeout(() => {
      navigation.navigate(navigationString.HOME);
    }, 500);
  };

  return (
    <WrapperContainer>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: moderateScale(8),
          width,
          marginLeft: -moderateScale(16),
          paddingBottom: moderateScale(16),
          paddingHorizontal: moderateScale(16),
          borderBottomWidth: 1,
          borderColor: colors.blackOpacity40,
          marginBottom: moderateScale(10),
        }}>
        <TouchableOpacity
          onPress={() => {
            ApplyEaseOutAnimation();
            setActiveTab(1);
          }}
          style={{width: '50%'}}
          activeOpacity={0.9}>
          <GradientText
            text={'Matches'}
            colorArray={
              activeTab === 1
                ? [colors.themecolor2, colors.themecolor2]
                : [colors.blackOpacity60, colors.blackOpacity60]
            }
            textStyle={
              activeTab === 1
                ? commonStyles.font_26_bold
                : commonStyles.font_16_SemiBold
            }
            start={{x: 0, y: 0.99}}
            end={{x: 0.99, y: 1}}
          />
        </TouchableOpacity>
        <View
          style={{
            width: 1,
            backgroundColor: colors.blackOpacity40,
            height: '100%',
          }}
        />
        <TouchableOpacity
          onPress={() => {
            ApplyEaseOutAnimation();
            setActiveTab(2);
          }}
          style={{
            width: '50%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
          activeOpacity={0.9}>
          {isCount > 0 ? (
            <View
              style={{
                height: moderateScale(16),
                width: moderateScale(16),
                borderRadius: moderateScale(16 / 2),
                backgroundColor: colors.seaGreen,
                marginRight: moderateScale(8),
              }}
            />
          ) : null}
          <GradientText
            text={'Requests'}
            colorArray={
              activeTab === 2
                ? [colors.themecolor2, colors.themecolor2]
                : [colors.blackOpacity60, colors.blackOpacity60]
            }
            textStyle={
              activeTab === 2
                ? commonStyles.font_26_bold
                : commonStyles.font_16_SemiBold
            }
            start={{x: 0, y: 0.99}}
            end={{x: 0.99, y: 1}}
          />
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => {
            ApplyEaseOutAnimation()
            setActiveTab(3)
          }}>
          <GradientText
            text={'Friends'}
            colorArray={
              activeTab === 3
                ? [colors.themecolor2, colors.themecolor2]
                : [colors.blackOpacity60, colors.blackOpacity60]
            }
            textStyle={
              activeTab === 3
                ? commonStyles.font_28_bold
                : commonStyles.font_16_SemiBold
            }
            start={{ x: 0, y: 0.99 }}
            end={{ x: 0.99, y: 1 }}
          />
        </TouchableOpacity> */}
      </View>

      {activeTab === 1 ? (
        <FlatList
          ref={listRef}
          refreshControl={
            <RefreshControl
              refreshing={!isLoading && isRefreshing}
              onRefresh={_onRefresh}
            />
          }
          ListHeaderComponent={
            <View style={{backgroundColor: colors.white}}>
              {/* {
                (Array.isArray(allMatches) && allMatches.length > 0 && !isLoading) ? */}
              <View>
                <Text style={styles.textStyle}>
                  {strings.thisIsAListOfPeopleWhoHaveLikedYouAndYourMatches}
                </Text>
                <Text style={{...styles.textView}}>
                  {strings.onlineMatchesNearYou}
                </Text>
              </View>
              {/* :
                  <></>
              } */}

              {!isLoading && isRefreshing && (
                <ActivityIndicator
                  animating={isRefreshing}
                  size={'large'}
                  color={colors.likePink}
                  style={{marginVertical: moderateScale(48)}}
                />
              )}
            </View>
          }
          stickyHeaderIndices={[0]}
          data={allMatches}
          extraData={allMatches}
          renderItem={_renderCards}
          keyExtractor={stableKeyExtractor}
          numColumns={2}
          columnWrapperStyle={{
            marginTop: moderateScale(16),
            justifyContent: 'space-between',
          }}
          contentContainerStyle={{
            paddingBottom: moderateScale(60),
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading && (
              <ListEmptyComponent
                icon={imagesPath.ic_appIcon}
                firstMessage={'You’re new here! No matches yet.'}
                secondMessage={
                  'This is a list of people who have liked you and your matches.'
                }
              />
            )
          }
          ListFooterComponent={
            hasMoreData ? (
              <ActivityIndicator
                animating={hasMoreData}
                size={'large'}
                color={colors.likePink}
                style={{marginVertical: moderateScale(48)}}
              />
            ) : (
              <></>
            )
          }
          onEndReached={_onEndReached}
          onEndReachedThreshold={0.5}
        />
      ) : (
        activeTab === 2 && (
          <FlatList
            ref={listRef}
            refreshControl={
              <RefreshControl
                refreshing={!isLoading && allRequestsIsRefreshing}
                onRefresh={_onRefresh}
              />
            }
            ListHeaderComponent={
              <View style={{backgroundColor: colors.white}}>
                <View>
                  <Text style={styles.textStyle}>
                    {
                      'This is a list of people who have sent you a match request'
                    }
                  </Text>
                </View>

                {!isLoading && allRequestsIsRefreshing && (
                  <ActivityIndicator
                    animating={allRequestsIsRefreshing}
                    size={'large'}
                    color={colors.likePink}
                    style={{marginVertical: moderateScale(48)}}
                  />
                )}
              </View>
            }
            stickyHeaderIndices={[0]}
            data={allRequests}
            extraData={allRequests}
            renderItem={_renderallRequests}
            keyExtractor={stableKeyExtractor}
            numColumns={2}
            columnWrapperStyle={{
              marginTop: moderateScale(16),
              justifyContent: 'space-between',
            }}
            contentContainerStyle={{
              paddingBottom: moderateScale(60),
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !isLoading && (
                <ListEmptyComponent
                  icon={imagesPath.ic_appIcon}
                  firstMessage={'You’re new here! No requests yet.'}
                  secondMessage={
                    'This is a list of people who have sent you a match request.'
                  }
                />
              )
            }
            ListFooterComponent={
              allRequestsHasMoreData ? (
                <ActivityIndicator
                  animating={allRequestsHasMoreData}
                  size={'large'}
                  color={colors.likePink}
                  style={{marginVertical: moderateScale(48)}}
                />
              ) : (
                <></>
              )
            }
            onEndReached={_onEndReached}
            onEndReachedThreshold={0.5}
          />
        )
      )}

      {(userData?.subscription?.subscription_id === 1 ||
        userData?.subscription === null) && (
        <>
          {Platform.OS === 'ios' ? (
            <BlurView
              style={styles.absolute}
              blurType="light"
              blurAmount={3}
              reducedTransparencyFallbackColor="white"
            />
          ) : (
            <View
              style={[
                styles.absolute,
                {backgroundColor: 'rgba(255,255,255,0.6)'},
              ]}
            />
          )}
          <View
            style={{
              height: height / 3,
              bottom: 0,
              position: 'absolute',
              marginLeft: 16,
              width: width - moderateScale(32),
            }}>
            <UpgradePlanScreen
              text={
                activeTab == 1
                  ? 'Upgrade your plan to see and chat with your matches.'
                  : 'Upgrade your plan to respond to requests.'
              }
              showImage={false}
            />
          </View>
        </>
      )}

      <ItsAMatchModal
        isVisible={itsMatchModal?.isVisible}
        userImage={itsMatchModal?.userPic}
        onSayHello={_onSayHello}
        onKeepSwiping={_onKeepSwiping}
      />

      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  textStyle: {
    ...commonStyles.font_16_medium,
    opacity: 0.84,
    color: theme.colors.black,
    marginTop: moderateScale(12),
  },
  textView: {
    alignSelf: 'center',
    ...commonStyles.font_16_bold,
    color: theme.colors.black,
    marginTop: moderateScale(16),
  },
  lineStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(16),
  },
  leftView: {flex: 1, height: 1, backgroundColor: theme.colors.gray4},
  txtView: {
    textAlign: 'center',
    fontFamily: fontFamily.extraLight,
    color: theme.colors.black,
  },
  absolute: {
    position: 'absolute',
    top: moderateScale(130),
    left: 0,
    bottom: 0,
    right: 0,
    height,
  },
});

// make this component available to the app
export default MatchScreen;
