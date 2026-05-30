import { View, Text, Image, BackHandler, TouchableOpacity, FlatList } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import imagesPath from '../../constants/imagesPath';
import WrapperContainer from '../../Components/WrapperContainer';
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
  width,
} from '../../styles/responsiveSize';
import fontFamily from '../../styles/fontFamily';
import ButtonComp from '../../Components/ButtonComp';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { navigationString } from '../../constants';
import { getGroupMemebers, groupChatConversations } from '../../redux/reduxActions/homeActions';
import { Loader } from '../../Components/Loader';
import CustomImage from '../../Components/CustomImage';
import en from '../../constants/Languages/en';
import { resetGroupList } from '../../redux/reduxActions/chatActions';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { stableKeyExtractor } from '../../utils/stableKeyExtractor';
import strings from '../../constants/Languages';

const GLOW_INITIAL_SCALE = 0.9;
const GLOW_MINIMUM_SCALE = 1.1;
const GLOW_DURATION = 2000;

const GroupLive = ({ navigation }) => {
  const {theme} = useTheme();
  const [dataPublic, setDataPublic] = useState({});
  const [dataPrivate, setDataPrivate] = useState({});
  const [dataUniversal, setDataUniversal] = useState({});
  const [publicMemberImg, setPublicMemberImg] = useState([]);
  const [privateMemberImg, setPrivateMemberImg] = useState([]);
  const [universalMemberImg, setUniversalsMemberImg] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const useGlowAnimation = () => {
    return useAnimatedStyle(() => ({
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(GLOW_MINIMUM_SCALE, { duration: GLOW_DURATION / 2 }),
              withTiming(GLOW_INITIAL_SCALE, { duration: GLOW_DURATION / 2 }),
            ),
            -1,
            true,
          ),
        },
      ],
    }));
  };

  const glowAnimation = useGlowAnimation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Home');
      return true;
    });
    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onOnlineBtnPress();
    });
    return unsubscribe;
  }, [navigation]);

  const viewChat = async () => {
    await resetGroupList();
    navigation.goBack();
  };

  const onOnlineBtnPress = () => {
    setLoading(true);
    groupChatConversations()
      .then(res => {
        onSetStatePublic(res);
        onSetStatePrivate(res);
        const apiData = res?.data?.data
        if(apiData?.length > 0 ){
          loadGroupMemeberList(apiData[0]?.id ?? 0)
        }
        onSetStateUniversal(res);
      })
      .catch(() => {
        setLoading(false);
        // showError(ApiError(error));
      });
  };
;
  const loadGroupMemeberList = (groupId) => {
    const payload = {
      groupId: groupId,
      page: 1 
    }
    getGroupMemebers(payload)
      .then(res => {
        // onSetStatePublic(res);
        // onSetStatePrivate(res);
      })
      .catch(() => {
        setLoading(false);
      });
  }

  const onSetStatePublic = res => {
    const filterDataPublic = res?.data?.data?.filter(item => {
      return item?.chat_type == 'public';
    });
    setDataPublic(filterDataPublic[0]);
    setPublicMemberImg(filterDataPublic[0]?.members);
  };

  const onSetStatePrivate = res => {
    const filterDataPrivate = res?.data?.data?.filter(item => {
      return item?.chat_type == 'private';
    });
    setDataPrivate(filterDataPrivate[0]);
    setPrivateMemberImg(filterDataPrivate[0]?.members);
  };

  const onSetStateUniversal = res => {
    setDataUniversal(res?.universal);
    setUniversalsMemberImg(res?.universal?.members);
    setLoading(false);
  };

  const onPlusPress = () => {
    viewChat();
    navigation.navigate(navigationString.CREATE_CHAT_ROOM, {
      addMember: 3,
    });
  };

  const renderItemUniversal = useCallback(
    ({ item, index }) => {
      return (

        <View>
          {item?.user?.profile_image ? (
            <CustomImage
              source={{ uri: item?.user?.profile_image }}
              imgLoaderStyle={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
            />
          ) : (
            <CustomImage
              source={imagesPath.ic_people}
              imgLoaderStyle={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
            />
          )}
        </View>
      );
    },
    [],
  );

  const renderItemPrivate = useCallback(
    ({ item, index }) => {
      return (

        <View>
          {item?.user?.profile_image ? (
            <CustomImage
              source={{ uri: item?.user?.profile_image }}
              imgLoaderStyle={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
            />
          ) : (
            <CustomImage
              source={imagesPath.ic_people}
              imgLoaderStyle={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
            />
          )}
        </View>
      );
    },
    [],
  );

  const renderItemPublic = useCallback(
    ({ item, index }) => {
      return (

        <View>
          {item?.user?.profile_image ? (
            <CustomImage
              source={{ uri: item?.user?.profile_image }}
              imgLoaderStyle={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
            />
          ) : (
            <CustomImage
              source={imagesPath.ic_people}
              imgLoaderStyle={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.white,
                borderRadius: moderateScale(20),
                right:
                  index == 0 ? 0 : moderateScale(6 * index + 2),
                zIndex: -index,
                height: moderateScale(30),
                width: moderateScale(30),
              }}
            />
          )}
        </View>
      );
    },
    [],
  );



  return (
    <WrapperContainer
      statusbarcolorr={theme.colors.backgroundBlue}
      mainViewStyle={{backgroundColor: theme.colors.white}}
      >
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {/* <Text
            style={{
              marginTop: Platform.OS === "ios" ? moderateScale(50) : moderateScale(10),
              color: theme.colors.red,
              fontFamily: fontFamily.butteredFont,
              fontSize: moderateScale(20)
            }}>
            {en.GroupChat} ...and Groups!
          </Text> */}
        </SafeAreaView>


        {/* <View
          style={{
            padding: moderateScale(14),
            borderRadius: moderateScale(12),
            backgroundColor: theme.colors.blackOpacity10,
            marginTop: moderateScaleVertical(10),
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: textScale(16),
                color: theme.colors.blackDark,
                fontFamily: fontFamily.SemiBold,
              }}>
              Find the local hot spot nearby!
            </Text>
          </View>

          <Text
            style={{
              fontSize: textScale(16),
              color: theme.colors.blackDark,
              fontFamily: fontFamily.SemiBold,
              marginTop: moderateScaleVertical(10),
            }}>
            People in your city are chatting here...
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: moderateScaleVertical(10),
              flexWrap:'wrap'
            }}>
            <Text
              style={{
                fontSize: textScale(16),
                color: theme.colors.themecolor2,
                fontFamily: fontFamily.SemiBold,
              }}>
              Do you want to join them?
            </Text>

            <View
              style={{
                backgroundColor: theme.colors.liveRed,
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: moderateScale(12),
                borderRadius: moderateScale(12),
                paddingHorizontal: moderateScale(10),
                paddingVertical: moderateScaleVertical(2),
              }}>
              <Image
                source={imagesPath.dotIcon}
                style={{
                  height: moderateScaleVertical(8),
                  width: moderateScale(8),
                  tintColor: theme.colors.white,
                }}
              />
              <Text
                style={{
                  fontSize: textScale(12),
                  color: theme.colors.white,
                  marginLeft: moderateScale(4),
                }}>
                Live
              </Text>
            </View>
            <Text
              style={{
                fontSize: textScale(14),
                fontFamily: fontFamily.SemiBold,
                color: theme.colors.themecolor2,
              }}>
              Free
            </Text>
          </View>
          <Text
            style={{
              fontSize: textScale(16),
              color: theme.colors.grey,
              marginTop: moderateScaleVertical(10),
            }}>
            {en.Tell_Everyone}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: moderateScaleVertical(20),
              justifyContent: 'space-between',
              marginBottom: moderateScaleVertical(10),
            }}>
            <View style={{ flex: 0.8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FlatList
                  horizontal
                  data={universalMemberImg?.slice(0, 7)}
                  renderItem={renderItemUniversal}
                  keyExtractor={stableKeyExtractor}
                />
              </View>
              <Text
                style={{
                  marginLeft: moderateScale(10),
                  fontFamily: fontFamily.SemiBold,
                  marginTop: moderateScale(5),
                }}>
                Craving a connection ?
              </Text>
            </View>

            <View style={{ flex: 0.3, alignItems: 'center' }}>
              <Animated.View style={glowAnimation}>
                <ButtonComp
                  btnView={{
                    borderRadius: moderateScale(40),
                    height: moderateScaleVertical(38),
                  }}
                  // onPressBtn={() => onOnlineBtnPress()}
                  onPressBtn={() => {
                    {console.log('universalMemberImg', universalMemberImg)}
                    {console.log('dataUniversal', dataUniversal)}
                    navigation.navigate(navigationString.CHATSCREEN, {
                      data: dataUniversal,
                      MemberImg: universalMemberImg,
                      public: true
                    })

                  }

                  }
                  // rightImage={imagesPath.ic_right_icon}
                  txtStyle={{ fontSize: textScale(12) }}
                  btnStyle={{
                    borderRadius: moderateScale(40),
                    width: moderateScale(90),
                  }}
                  btnText={'Enter now'}
                />
              </Animated.View>
              <Text
                style={{
                  fontFamily: fontFamily.SemiBold,
                  marginTop: moderateScale(5),
                }}>
                {en.Click_Here}
              </Text>
            </View>
          </View>
        </View> */}

        {dataPublic?.chat_type == 'public' ? (
          <View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: moderateScaleVertical(12),
                justifyContent: 'space-between',
                alignItems:'center'
              }}>
              <Text
                style={{
                  color: theme.colors.activeTintColor,
                  fontFamily: fontFamily.SemiBold,
                  fontSize: moderateScale(24)
                }}>
                Public Chat
              </Text>
              <ButtonComp
                btnText={strings.seeAllA}
                onPressBtn={()=> navigation.navigate(navigationString.PUBLIC_GROUP_CHAT, {})}
                btnStyle={{width:'25%'}}
              />
            </View>
            <View
              style={{
                padding: moderateScale(14),
                borderRadius: moderateScale(12),
                backgroundColor: theme.colors.blackOpacity10,
                marginTop: moderateScaleVertical(10),
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: textScale(20),
                    color: theme.colors.blackDark,
                    fontFamily: fontFamily.SemiBold,
                  }}>
                  {/* {dataPublic?.group_name} */}
                  {dataPublic?.group_name && dataPublic.group_name.length > 20
                    ? `${dataPublic.group_name.substring(0, 20)}...`
                    : dataPublic?.group_name}
                </Text>
                <View
                  style={{
                    backgroundColor: theme.colors.liveRed,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: moderateScale(12),
                    borderRadius: moderateScale(12),
                    paddingHorizontal: moderateScale(10),
                    paddingVertical: moderateScaleVertical(2),
                  }}>
                  <Image
                    source={imagesPath.dotIcon}
                    style={{
                      height: moderateScaleVertical(8),
                      width: moderateScale(8),
                      tintColor: theme.colors.white,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: textScale(12),
                      color: theme.colors.white,
                      marginLeft: moderateScale(4),
                    }}>
                    Live
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: textScale(16),
                  color: theme.colors.grey,
                  marginTop: moderateScaleVertical(10),
                }}>
                Start your own Public or Private Chat Room.
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: moderateScaleVertical(20),
                  justifyContent: 'space-between',
                  marginBottom: moderateScaleVertical(10),
                }}>
                <View
                  style={{
                    flex: 0.6,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <FlatList
                    horizontal
                    data={publicMemberImg?.slice(0, 7)}
                    renderItem={renderItemPublic}
                    keyExtractor={stableKeyExtractor}
                  />
                </View>

                <View style={{ flex: 0.35 }}>
                  <Animated.View style={glowAnimation}>
                    <ButtonComp
                      btnView={{
                         borderRadius: moderateScale(40),
                      height: moderateScaleVertical(38),
                      backgroundColor: theme.colors.orangenew,
                      }}
                      // onPressBtn={() => onOnlineBtnPress()}
                      onPressBtn={() => 
                          navigation.navigate(navigationString.CHATSCREEN, {
                        data: dataPublic,
                        MemberImg: publicMemberImg,
                        public: true,
                      })

                      }
                      // rightImage={imagesPath.ic_right_icon}
                      txtStyle={{ fontSize: textScale(12) }}
                      btnStyle={{
                        borderRadius: moderateScale(40),
                        width: moderateScale(120),
                      }}
                      btnText={'Enter now'}
                    />
                  </Animated.View>
                </View>

              </View>
            </View>
          </View>
        ) : null}

        {dataPrivate?.chat_type == 'private' ? (
          <View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: moderateScaleVertical(34),
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: theme.colors.themecolor2,
                  fontFamily: fontFamily.SemiBold,
                  fontSize: moderateScale(24)
                }}>
                Private Chat
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(navigationString.PRIVATE_GROUP_CHAT);
                }}>
                <Text style={{ color: theme.colors.black, fontSize: scale(17), fontWeight: '700' }}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                padding: moderateScale(14),
                borderRadius: moderateScale(12),
                backgroundColor: theme.colors.blackOpacity10,
                marginTop: moderateScaleVertical(10),
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: textScale(20),
                    color: theme.colors.blackDark,
                    fontFamily: fontFamily.SemiBold,
                  }}>
                  {/* {dataPrivate?.group_name} */}
                  {dataPrivate?.group_name && dataPrivate.group_name.length > 20
                    ? `${dataPrivate.group_name.substring(0, 20)}...`
                    : dataPrivate?.group_name}
                </Text>
                <View
                  style={{
                    backgroundColor: theme.colors.liveRed,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: moderateScale(12),
                    borderRadius: moderateScale(12),
                    paddingHorizontal: moderateScale(10),
                    paddingVertical: moderateScaleVertical(2),
                  }}>
                  <Image
                    source={imagesPath.dotIcon}
                    style={{
                      height: moderateScaleVertical(8),
                      width: moderateScale(8),
                      tintColor: theme.colors.white,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: textScale(12),
                      color: theme.colors.white,
                      marginLeft: moderateScale(4),
                    }}>
                    Live
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontSize: textScale(16),
                  color: theme.colors.grey,
                  marginTop: moderateScaleVertical(10),
                }}>
                Start your own Public or Private Chat Room.
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: moderateScaleVertical(20),
                  justifyContent: 'space-between',
                  marginBottom: moderateScaleVertical(10),
                }}>
                <View
                  style={{
                    flex: 0.6,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>

                  <FlatList
                    horizontal
                    data={privateMemberImg?.slice(0, 7)}
                    renderItem={renderItemPrivate}
                    keyExtractor={stableKeyExtractor}
                  />
                  {/* {privateMemberImg?.slice(0, 7).map((item, index) => {
                    return (
                      <View>
                        {item?.user?.profile_image ? (
                          <CustomImage
                            source={{uri: item?.user?.profile_image}}
                            imgLoaderStyle={{
                              borderWidth: 2,
                              borderColor: theme.colors.white,
                              borderRadius: moderateScale(20),
                              right:
                                index == 0 ? 0 : moderateScale(6 * index + 2),
                              zIndex: -index,
                              height: moderateScale(30),
                              width: moderateScale(30),
                            }}
                            style={{
                              borderWidth: 2,
                              borderColor: theme.colors.white,
                              borderRadius: moderateScale(20),
                              right:
                                index == 0 ? 0 : moderateScale(6 * index + 2),
                              zIndex: -index,
                              height: moderateScale(30),
                              width: moderateScale(30),
                            }}
                          />
                        ) : (
                          <CustomImage
                            source={imagesPath.ic_people}
                            imgLoaderStyle={{
                              borderWidth: 2,
                              borderColor: theme.colors.white,
                              borderRadius: moderateScale(20),
                              right:
                                index == 0 ? 0 : moderateScale(6 * index + 2),
                              zIndex: -index,
                              height: moderateScale(30),
                              width: moderateScale(30),
                            }}
                            style={{
                              borderWidth: 2,
                              borderColor: theme.colors.white,
                              borderRadius: moderateScale(20),
                              right:
                                index == 0 ? 0 : moderateScale(6 * index + 2),
                              zIndex: -index,
                              height: moderateScale(30),
                              width: moderateScale(30),
                            }}
                          />
                        )}
                      </View>
                    );
                  })} */}
                </View>

                <View style={{ flex: 0.35 }}>
                  <ButtonComp
                    btnView={{
                      borderRadius: moderateScale(40),
                      height: moderateScaleVertical(38),
                      backgroundColor: theme.colors.orangenew,
                    }}
                    onPressBtn={() =>
                      navigation.navigate(navigationString.CHATSCREEN, {
                        data: dataPrivate,
                        MemberImg: privateMemberImg,
                      })
                    }
                    // rightImage={imagesPath.ic_right_icon}
                    txtStyle={{ fontSize: textScale(12) }}
                    btnStyle={{
                      borderRadius: moderateScale(40),
                      width: moderateScale(120),
                    }}
                    btnText={'Enter now'}
                  />
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View
          style={{
            padding: moderateScale(14),
            borderRadius: moderateScale(12),
            backgroundColor:theme.colors.blackOpacity10,
            marginTop: moderateScaleVertical(34),
            alignItems: 'center',
          }}>
          <Image
            source={imagesPath.chatnew}
            style={{ alignSelf: 'center', marginTop: moderateScale(10) }}
          />
          <Text
            style={{
              fontSize: textScale(16),
              color: theme.colors.blackDark,
              fontFamily: fontFamily.SemiBold,
            }}>
            You set the rules, its your Guest List!
          </Text>
          <Text
            style={{
              fontSize: textScale(16),
              textTransform: 'uppercase',
              color: theme.colors.blackDark,
              alignSelf: 'center',
              fontFamily: fontFamily.bold,
              textAlign: 'center',
              marginTop: moderateScaleVertical(10),
            }}>
            Want to Create your Own Chat Room?
          </Text>
          <ButtonComp
            onPressBtn={
              () => onPlusPress()
            }
            btnView={{
              borderRadius: moderateScale(40),
              height: moderateScaleVertical(44),
              marginTop: moderateScaleVertical(16),
            }}
            leftimg={imagesPath.add}
            leftimgstyle={{
              height: moderateScaleVertical(15),
              width: moderateScale(15),
              tintColor: theme.colors.white,
              marginRight: moderateScale(2),
            }}
            txtStyle={{ fontSize: textScale(16) }}
            btnStyle={{
              borderRadius: moderateScale(40),
              width: width - 90,
              alignSelf: 'center',
            }}
            btnText={'Create Chat Room'}
          />
        </View>

        <View style={{ height: moderateScaleVertical(20) }} />
      </KeyboardAwareScrollView>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

export default GroupLive;
