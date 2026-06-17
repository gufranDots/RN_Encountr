// import liraries
import moment from 'moment';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import countryData from '../../constants/countryData.json';
import { useSelector } from 'react-redux';
import AddMediaImageView from '../../Components/AddMediaImageView';
import CollapsibleHeader from '../../Components/CollapsibleHeader';
import GalleryImageModal from '../../Components/GalleryImageModal';
import GradientText from '../../Components/GradientText';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles';
import {
  height,
  moderateScale,
  textScale,
  width,
} from '../../styles/responsiveSize';
import { getDiamoundIcon } from '../../utils/subscriptionFunctions';
import { enableFreeze } from 'react-native-screens';
import {
  getChatCount,
  saveChatCounter,
} from '../../redux/reduxActions/chatActions';
import {
  ConnectingSocket,
  getUserData,
  setUserData,
  socketRef,
} from '../../utils/utils';
import {
  getDatingTags,
  saveDatingTagsApi,
} from '../../redux/reduxActions/authActions';
import ButtonComp from '../../Components/ButtonComp';
import { ApiError, showError, formatHeightForDisplay } from '../../utils/helperFunctions';
import { stableKeyExtractor } from '../../utils/stableKeyExtractor';
import { Loader } from '../../Components/Loader';
import {
  saveUserDataToStore,
  deleteVoiceMessageApi,
} from '../../redux/reduxActions/homeActions';
import InfoBubble from '../../Components/InfoBubble';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import {
  createVoicePlayer,
  resetVoicePlayer,
  startVoiceMessage,
  stopVoiceMessage,
} from '../../utils/voiceMessagePlayer';
import LinearGradient from 'react-native-linear-gradient';

enableFreeze();
// create a component
const ProfileScreen = props => {
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const { navigation } = props;

  const userData = useSelector(state => state?.authReducers?.userData || {});

  const flatListRef = useRef(null);

  const [viewGalleryImgs, setViewGalleryImgs] = useState({
    isVisible: false,
    currentIndex: 0,
  });
  const [tagArr, setTagArr] = useState(userData?.tags || []);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedtags] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [age, setAge] = useState('');
  const [shoewInfoBubble, setShoewInfoBubble] = useState(false);
  const [showVoiceInfoBubble, setShowVoiceInfoBubble] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const audioPlayerRef = useRef(null);
  const isVoicePlayingRef = useRef(false);

  const voiceMessageUrl =
    typeof userData?.voice_message === 'string'
      ? userData.voice_message.trim()
      : '';
  const hasVoiceMessage = voiceMessageUrl.length > 0;

  const _stopVoiceMessage = useCallback(async () => {
    await stopVoiceMessage(audioPlayerRef.current);
    isVoicePlayingRef.current = false;
    setIsVoicePlaying(false);
  }, []);

  const _onPressVoiceDrop = useCallback(async () => {
    if (!hasVoiceMessage) return;
    if (isVoicePlayingRef.current) {
      await _stopVoiceMessage();
      return;
    }
    try {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = createVoicePlayer();
      }
      const player = audioPlayerRef.current;
      isVoicePlayingRef.current = true;
      setIsVoicePlaying(true);
      await startVoiceMessage(player, voiceMessageUrl);
      player.addPlayBackListener(e => {
        if (
          e?.isFinished ||
          (e?.duration > 0 && e?.currentPosition >= e?.duration)
        ) {
          _stopVoiceMessage();
        }
      });
    } catch (err) {
      resetVoicePlayer(audioPlayerRef);
      isVoicePlayingRef.current = false;
      setIsVoicePlaying(false);
      showError(err?.message || 'Unable to play voice message');
    }
  }, [hasVoiceMessage, voiceMessageUrl, _stopVoiceMessage]);

  useEffect(() => {
    return () => {
      stopVoiceMessage(audioPlayerRef.current);
      isVoicePlayingRef.current = false;
    };
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      if (isVoicePlayingRef.current) {
        _stopVoiceMessage();
      }
    });
    return unsub;
  }, [navigation, _stopVoiceMessage]);

  const [data, setData] = useState([
    {
      id: 1,
      img: imagesPath.snap3,
      isSelected: false,
    },
    {
      id: 2,
      img: imagesPath.snap2,
      isSelected: false,
    },
    {
      id: 3,
      img: imagesPath.snap1,
      isSelected: false,
    },
    {
      id: 4,
      img: imagesPath.snap4,
      isSelected: false,
    },
  ]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userData?.dob) {
        const date1 = moment(new Date(userData?.dob));
        const date2 = moment(new Date());
        const diff = date2.diff(date1, 'years');
        setAge(diff);
      }
    });
    return unsubscribe;
  }, [userData?.dob]);
  let name = {
    fName: 'rohan',
    lName: 'khanna',
    printName: function () {
      Alert.alert(this.fName + this.lName);
    },
  };

  useEffect(() => {
    ConnectingSocket(userData);
    socketRef.on('sendMessage', response => {
      chatCounter();
    });
    _getAllTags();
  }, []);

  const _getAllTags = () => {
    getDatingTags()
      .then(res => {
        const tagsArr1 = res?.data;
        if (Array.isArray(tagsArr1) && tagsArr1 && tagsArr1.length > 0) {
          const _arr = tagsArr1.map((it, id) => {
            const isSelect = tagArr.some(
              item => item?.tag_name === it?.tag_name,
            );

            return { ...it, isSelected: isSelect };
          });
          setTags(_arr);
        }
      })
      .catch(error => {
        // setLoading(false);
        console.log(error);
      });
  };

  const onPressInfo = () => {
    setShoewInfoBubble(!shoewInfoBubble);

    setTimeout(() => {
      setShoewInfoBubble(false);
    }, 2000);
  };

  const onPressVoiceInfo = () => {
    setShowVoiceInfoBubble(!showVoiceInfoBubble);

    setTimeout(() => {
      setShowVoiceInfoBubble(false);
    }, 4000);
  };

  const _deleteVoiceMessage = useCallback(async () => {
    try {
      if (isVoicePlayingRef.current) {
        await _stopVoiceMessage();
      }
      setLoading(true);
      const res = await deleteVoiceMessageApi();
      if (!res?.success) {
        showError(res?.message || 'Unable to delete voice intro');
      }
    } catch (err) {
      showError(ApiError(err) || 'Unable to delete voice intro');
    } finally {
      setLoading(false);
    }
  }, [_stopVoiceMessage]);

  const onPressDeleteVoice = useCallback(() => {
    if (!hasVoiceMessage) return;
    Alert.alert(
      'Delete voice intro?',
      'This will permanently remove your voice intro. You can record a new one anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: _deleteVoiceMessage,
        },
      ],
    );
  }, [hasVoiceMessage, _deleteVoiceMessage]);

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

  const onPressImages = item => {
    const tempArr = data.map(val => {
      if (val?.id === item?.id) {
        return { ...val, isSelected: !item.isSelected };
      } else {
        return { ...val };
      }
    });

    console.log('tempRARRR', tempArr);
    setData(tempArr);
  };

  const renderGalleryImages = useCallback(
    ({ item, index }) => {
      if (index > 3) {
        return;
      }
      return (
        <View>
          <AddMediaImageView
            itemData={item}
            size={userData?.photos.length || 0}
            indexData={index || 0}
            onPress={() => {
              setTimeout(
                () =>
                  setViewGalleryImgs({
                    isVisible: true,
                    currentIndex: index,
                  }),
                600,
              );
            }}
          />
        </View>
      );
    },
    [userData?.photos],
  );

  const renderParentView = () => {
    return (
      (
        <FlatList
          ListHeaderComponent={
            <View style={{ backgroundColor: theme.colors.white }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: '76%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <GradientText
                    text={`${userData?.first_name} ${age ? ', ' + age : ' '}`}
                    textStyle={styles.nameStyle}
                    start={{ x: 0, y: 0.7 }}
                    end={{ x: 0.7, y: 1 }}
                  />
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate(navigationString.EDITPROFILE, {
                      isBack: true,
                    })
                  }>
                  <Image source={imagesPath.ic_edit} tintColor={theme.colors.black} />
                </TouchableOpacity>
              </View>


              <View style={styles.labelView}>
                <View style={styles.voiceCard}>
                  <View style={styles.voiceCardHeader}>
                    <View style={styles.voiceCardTitleWrap}>
                      <LinearGradient
                        colors={[
                          theme.colors.florsentTheme,
                          theme.colors.pink_164,
                          theme.colors.themecolor2,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.voiceCardIconBadge}>
                        <Image
                          source={imagesPath.mic}
                          style={styles.voiceCardBadgeIcon}
                          tintColor={theme.colors.primaryWhite}
                        />
                      </LinearGradient>
                      <View style={styles.voiceCardTitleText}>
                        <GradientText
                          text={strings.voiceDrop}
                          textStyle={styles.voiceCardTitle}
                          start={{ x: 0, y: 0.2 }}
                          end={{ x: 0.2, y: 0.5 }}
                        />
                        <Text style={styles.voiceCardSubtitle}>
                          {hasVoiceMessage
                            ? isVoicePlaying
                              ? 'Playing your intro...'
                              : 'Tap play to hear your intro'
                            : 'Add a short voice intro'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.voiceDropRightActions}>
                    {hasVoiceMessage ? (
                        <>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        hitSlop={hitSlopProp}
                        onPress={() =>
                          navigation.navigate(navigationString.VOICE_DROP, {
                            fromProfile: true,
                          })
                        }
                        style={styles.voiceActionBtn}>
                        <Image
                          source={imagesPath.ic_pencil}
                          tintColor={theme.colors.florsentTheme}
                          style={styles.voiceActionIcon}
                        />
                      </TouchableOpacity>

                      
                        <TouchableOpacity
                          activeOpacity={0.8}
                          hitSlop={hitSlopProp}
                          onPress={onPressDeleteVoice}
                          style={[styles.voiceActionBtn, styles.voiceActionBtnDanger]}>
                          <Image
                            source={imagesPath.delete_ic}
                            tintColor={theme.colors.red}
                            style={styles.voiceActionIcon}
                            />
                        </TouchableOpacity>
                        </>
                        ) : null}

                      <TouchableOpacity
                      activeOpacity={0.8}
                      hitSlop={hitSlopProp}
                      onPress={onPressVoiceInfo}
                      style={styles.voiceActionBtn}>
                        <Image
                          source={imagesPath.info}
                          tintColor={theme.colors.florsentTheme}
                          style={styles.voiceActionIcon}
                          />
                      </TouchableOpacity>
                       
                    </View>
                  </View>

                  {showVoiceInfoBubble && (
                    <View style={styles.voiceInfoTooltip}>
                      <View style={styles.voiceInfoArrow} />
                      <Text style={styles.voiceInfoTooltipText}>
                        Record your voice to let people know what you're looking for.
                      </Text>
                    </View>
                  )}

                  {hasVoiceMessage ? (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={_onPressVoiceDrop}
                      style={styles.voicePlayerRow}>
                      <LinearGradient
                        colors={[
                          theme.colors.florsentTheme,
                          theme.colors.pink_164,
                          theme.colors.themecolor2,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.voicePlayBtn}>
                        <Image
                          source={
                            isVoicePlaying
                              ? imagesPath.stopIcon
                              : imagesPath.volume
                          }
                          style={
                            isVoicePlaying
                              ? styles.voicePlayBtnIconStop
                              : styles.voicePlayBtnIcon
                          }
                          tintColor={theme.colors.primaryWhite}
                        />
                      </LinearGradient>

                      <View style={styles.voiceWaveRow}>
                        {[10, 18, 14, 22, 12, 20, 16, 24, 14, 18, 12, 20, 16, 22, 10].map(
                          (h, idx) => (
                            <View
                              key={`wave-${idx}`}
                              style={[
                                styles.voiceWaveBar,
                                {
                                  height: moderateScale(h),
                                  opacity: isVoicePlaying ? 1 : 0.55,
                                },
                              ]}
                            />
                          ),
                        )}
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate(navigationString.VOICE_DROP, {
                          fromProfile: true,
                        })
                      }
                      style={styles.voiceEmptyState}>
                      <Image
                        source={imagesPath.mic}
                        style={styles.voiceEmptyIcon}
                        tintColor={theme.colors.florsentTheme}
                      />
                      <Text style={styles.voiceEmptyText}>
                        Tap here to record your voice intro
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>



              {userData?.about_me ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'About Me'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.about_me}</Text>
                </View>
              ) : null}

              <View style={styles.labelView}>
                <GradientText
                  text={strings.location}
                  textStyle={styles.labelText}
                  start={{ x: 0, y: 0.2 }}
                  end={{ x: 0.2, y: 0.5 }}
                />
                <Text style={styles.textStyle}>
                  {userData?.city}, {userData?.country}
                </Text>
              </View>
              {userData?.user_name ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={strings.userName}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.3 }}
                    end={{ x: 0.3, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>@ {userData?.user_name}</Text>
                </View>
              ) : null}

              {userData?.phone_number && (
                <View style={styles.labelView}>
                  <GradientText
                    text={strings.phoneNumber}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.4 }}
                    end={{ x: 0.4, y: 0.5 }}
                  />
                  {shoewInfoBubble && (
                    <InfoBubble
                      sty
                      message="your phone number is not public, only you can see this. !"
                    />
                  )}
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: moderateScale(10),
                    }}>
                    <Text
                      style={[styles.textStyle, { marginTop: moderateScale(2) }]}>
                      (+{userData?.country_code}) {userData?.phone_number}
                    </Text>
                    <TouchableOpacity
                      onPress={onPressInfo}
                      style={{ marginStart: moderateScale(5) }}>
                      <Image
                        style={{ width: 20, height: 20 }}
                        source={imagesPath.info}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {userData?.church_role && (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Church Worker Role'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.church_role}</Text>
                </View>
              )}

              {userData?.bio && (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Bio'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.bio}</Text>
                </View>
              )}

              {userData?.height && (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Height'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{formatHeightForDisplay(userData?.height)}</Text>
                </View>
              )}
              {userData?.weight && (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Weight'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>
                    {userData?.weight} Pounds
                  </Text>
                </View>
              )}

              {/* {userData?.highest_education && (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Highest Education'}
                    textStyle={styles.labelText}
                    start={{x: 0, y: 0.2}}
                    end={{x: 0.2, y: 0.5}}
                  />
                  <Text style={styles.textStyle}>
                    {userData?.highest_education}
                  </Text>
                </View>
              )} */}

              {userData?.occupation && (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Occupation'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.occupation}</Text>
                </View>
              )}

              {userData?.body_type && (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Body Type'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.body_type}</Text>
                </View>
              )}
              {userData?.position == null ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Preferences'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>Not Specified</Text>
                </View>
              ) : (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Preferences'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.position}</Text>
                </View>
              )}

              {/* HIV */}
              {userData?.hiv_status == null ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'HIV Status'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>Not Specified</Text>
                </View>
              ) : (
                <View style={styles.labelView}>
                  <GradientText
                    text={'HIV Status'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.hiv_status}</Text>
                </View>
              )}
              {/* Tribes */}
              {userData?.tribes == null ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Tribes'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>Not Specified</Text>
                </View>
              ) : (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Tribes'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>
                    {(() => {
                      if (Array.isArray(userData?.tribes)) {
                        return userData.tribes.join(', ');
                      } else if (typeof userData?.tribes === 'string') {
                        return userData.tribes
                          .replace(/[\[\]"]/g, '')
                          .replace(/[\/\\]/g, '')
                          .replace(/\|/g, ', ')
                          .replace(/,+/g, ', ')
                          .replace(/^,\s*/, '')
                          .replace(/,\s*$/, '')
                          .trim();
                      }
                      return userData?.tribes || 'Not Specified';
                    })()}
                  </Text>
                </View>
              )}

              {/* Meet at */}
              {userData?.meet_at == null ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Meet at'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>Not Specified</Text>
                </View>
              ) : (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Meet at'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.meet_at}</Text>
                </View>
              )}


              {/* Accept NSFW Pics*/}
              {userData?.nsfw == null ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Accept NSFW Pics'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>Not Specified</Text>
                </View>
              ) : (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Accept NSFW Pics'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.nsfw}</Text>
                </View>
              )}


              {/* expectations*/}
              {userData?.expectations == null ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Expectations'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>Not Specified</Text>
                </View>
              ) : (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Expectations'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.expectations}</Text>
                </View>
              )}

              {/* Last Tested */}
              {userData?.last_tested == null ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Last Tested'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>Not Specified</Text>
                </View>
              ) : (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Last Tested'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>
                    {moment(userData?.last_tested).format('LL')}
                  </Text>
                </View>
              )}
              {/* Remind me */}
              {userData?.remind_me_to_get_tested == null ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Remind me to get tested'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>Not Specified</Text>
                </View>
              ) : (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Remind me to get tested'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>
                    {moment(userData?.remind_me_to_get_tested).format('LL')}
                  </Text>
                </View>
              )}
              {/* Vaccinations */}
              {userData?.vaccination == null ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Vaccinations'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>Not Specified</Text>
                </View>
              ) : (
                <View style={styles.labelView}>
                  <GradientText
                    text={'Vaccinations'}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.vaccination}</Text>
                </View>
              )}

              <View style={styles.labelView}>
                <GradientText
                  text={strings.birthDate}
                  textStyle={styles.labelText}
                  start={{ x: 0, y: 0.2 }}
                  end={{ x: 0.2, y: 0.5 }}
                />
                <Text style={styles.textStyle}>
                  {userData?.dob
                    ? moment(userData?.dob).format('LL')
                    : 'Not Specified'}
                </Text>
              </View>

              {userData?.facebook ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={strings.facebook_Link}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.facebook}</Text>
                </View>
              ) : null}

              {userData?.instagram ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={strings.instagram_Link}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.instagram}</Text>
                </View>
              ) : null}

              {userData?.linkedin ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={strings.twitter_Link}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.linkedin}</Text>
                </View>
              ) : null}

              {userData?.twitter ? (
                <View style={styles.labelView}>
                  <GradientText
                    text={strings.twitter_Link}
                    textStyle={styles.labelText}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.2, y: 0.5 }}
                  />
                  <Text style={styles.textStyle}>{userData?.twitter}</Text>
                </View>
              ) : null}

              {userData?.tags && (
                <View style={styles.labelView}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <GradientText
                      text={'Interests'}
                      textStyle={styles.labelText}
                      start={{ x: 0, y: 0.2 }}
                      end={{ x: 0.2, y: 0.5 }}
                    />
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                      <Image source={imagesPath.ic_pencil} tintColor={theme.colors.black} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {tagArr?.map((item, i) => {
                      return (
                        <Text
                          style={{
                            ...styles.textStyle,
                            paddingHorizontal: moderateScale(8),
                          }}>
                          {item?.tag_name}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={styles.galleryView}>
                <GradientText
                  text={strings.gallery}
                  textStyle={styles.labelText}
                  start={{ x: 0, y: 0.8 }}
                  end={{ x: 0.8, y: 1 }}
                />
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(navigationString.ALL_GALLERY_IMAGES, {
                      showBottomBtn: true,
                    })
                  }
                  activeOpacity={0.9}
                  hitSlop={hitSlopProp}>
                  {/* <Text style={styles.addStyle}>{userData?.photos && userData?.photos.length ? strings.seeAll : strings.add}</Text> */}
                  <GradientText
                    text={
                      userData?.photos && userData?.photos.length
                        ? strings.seeAll
                        : strings.add
                    }
                    colorArray={[theme.colors.themecolor2, theme.colors.themecolor2]}
                    textStyle={{ color: theme.colors.red, ...styles.addStyle }}
                    start={{ x: 0, y: 0.8 }}
                    end={{ x: 0.8, y: 1 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={renderGalleryImages}
          data={userData?.photos || []}
          extraData={userData?.photos || []}
          style={styles.viewStyle}
          numColumns={2}
          columnWrapperStyle={{
            marginTop: moderateScale(14),
            justifyContent: 'space-between',
          }}
          keyExtractor={stableKeyExtractor}
          contentContainerStyle={{ paddingBottom: moderateScale(60) }}
          ListEmptyComponent={
            <View>
              <Text
                style={{
                  ...commonStyles.font_14_medium,
                  textAlign: 'center',
                  marginVertical: moderateScale(16),
                }}>
                {strings.NoGalleryImagesAvailableClick}
                <Text style={{ ...commonStyles.font_14_bold }}>
                  {userData && userData?.photos && userData?.photos.length > 0
                    ? strings.seeAll
                    : strings.add}
                </Text>
                {' ' + strings.toUpload}
              </Text>
            </View>
          }
        />
      )
    );
  };

  const _onSelectTags = (item, index) => {
    const _arr = tags.map((it, ind) => {
      if (it.id == item.id) {
        it.isSelected = !it.isSelected;
      }
      return it;
    });
    setTags(_arr);
  };

  const _onContinue = () => {
    console.log('llll');
    const _selectedTags = tags.map(item => {
      if (item?.isSelected) {
        return item?.id;
      }
    });
    const _selectedTags1 = tags.filter(item => {
      if (item?.isSelected) {
        return item;
      }
    });
    const _filterSelectedTags = _selectedTags.filter(item => item);

    if (_filterSelectedTags && _filterSelectedTags.length === 0) {
      return showError(strings.pleaseselectatleastonetag);
    }
    setTagArr(_selectedTags1);
    const apiData = new FormData();
    apiData.append('tags', _filterSelectedTags);
    setLoading(true);
    saveDatingTagsApi(apiData)
      .then(res => {
        setLoading(false);
        setIsModalVisible(false);

        getUserData()
          .then(cb => {
            const userData = cb;
            userData.tags = selectedTags;
            setUserData(userData).then(() => {
              saveUserDataToStore(userData);
            });
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeContainer}>
        <CollapsibleHeader
          leftIcon={imagesPath.ic_back}
          onPressBack={() => navigation.goBack()}
          leftText={strings.profile}
          rightIcon={imagesPath.ic_setting}
          // Subscription={true}
          onPressRightIcon={() =>
            navigation.navigate(navigationString.SETTINGSCREEN)
          }
          renderParentView={renderParentView}
          backgroundColor={theme.colors.white}
          fileUrl={
            userData?.profile_image ||
            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png'
          }
          approvalStatus={userData?.is_profile_image_approved}
          imageStyle={{ tintColor: theme.colors.black }}
          imgStyle={{ tintColor: theme.colors.black }}
          rightBoxStyle={{ borderColor: theme.colors.black }}
          diamondIcon={getDiamoundIcon(userData?.subscription?.subscription_id)}
        />

        <Modal visible={viewGalleryImgs?.isVisible}>
          <GalleryImageModal
            currentIndex={viewGalleryImgs?.currentIndex}
            data={userData?.photos}
            onPressClose={() =>
              setViewGalleryImgs({
                isVisible: false,
                currentIndex: 0,
              })
            }
          />
        </Modal>
        <Modal visible={isModalVisible}>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.heading}>{'Interests'}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Image source={imagesPath.ic_Cross} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subHeading}>
              {strings.Selectyourtagsfrombelowsuggestions}
            </Text>

            <View style={styles.tagMainView}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contStyles}>
                <View style={styles.cellView}>
                  {tags.map((item, index) => (
                    <TouchableOpacity
                      key={item.toString() + index.toString()}
                      style={{
                        backgroundColor: item?.isSelected
                          ? theme.colors.lightPinkOpacity50
                          : theme.colors.skyblueOpacity50,
                        ...styles.cell,
                      }}
                      activeOpacity={0.9}
                      onPress={() => _onSelectTags(item, index)}>
                      <Text
                        style={{
                          ...styles.tagText,
                          color: item?.isSelected
                            ? theme.colors.white
                            : theme.colors.black,
                        }}>
                        {item?.tag_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <ButtonComp
                btnStyle={styles.btnStyle}
                btnText={strings.continue}
                onPressBtn={_onContinue}
              />
            </View>
          </View>
        </Modal>
        <Loader isLoading={isLoading} />
      </SafeAreaView>
    </View>
  );
};

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  safeContainer: {
    flex: 1,
    marginTop: moderateScale(-30),
  },
  nameStyle: {
    ...commonStyles.font_24_bold,
    textTransform: 'capitalize',
  },
  textStyle: {
    ...commonStyles.font_14_medium,
    marginTop: moderateScale(10),
    color: theme.colors.darkBlack,
  },
  labelText: {
    ...commonStyles.font_16_bold,
    color: theme.colors.black,
    fontWeight: '800'
  },
  labelView: {
    marginTop: moderateScale(30),
  },
  renderView: {
    marginTop: moderateScale(12),
    // marginHorizontal: moderateScale(18),
    borderWidth: 3,
    borderRadius: moderateScale(10),
    bordercolor: theme.colors.white,
    width: '48%',
  },
  renderImage: {
    height: moderateScale(190),
    width: '100%',
    borderRadius: moderateScale(8),
  },
  viewStyle: {
    backgroundColor: theme.colors.white,
    flex: 1,
    marginTop: -moderateScale(20),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(22),
    paddingBottom:
      Platform.OS === 'ios' ? moderateScale(22) : moderateScale(50),
  },
  galleryView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: moderateScale(24),
    alignItems: 'center',
  },
  addStyle: {
    ...commonStyles.font_14_bold,
    color: theme.colors.themecolor2,
  },
  tagMainView: {
    flex: 0.94,
  },
  heading: {
    ...commonStyles.font_32_bold,
    // marginHorizontal: moderateScale(16),
    color: theme.colors.themecolor2,
    marginTop: moderateScale(6),
  },
  subHeading: {
    ...commonStyles.font_12_SemiBold,
    marginTop: moderateScale(8),
    // marginHorizontal: moderateScale(16),
    color: theme.colors.likePink,
  },
  btnStyle: {
    paddingHorizontal: moderateScale(20),
  },
  cellView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: moderateScale(8),
    // padding: moderateScale(10)
  },
  cell: {
    borderRadius: moderateScale(6),
    marginTop: moderateScale(8),
    alignSelf: 'flex-start',
    marginStart: moderateScale(8),
  },
  tagText: {
    ...commonStyles.font_12_SemiBold,
    margin: moderateScale(12),
  },
  contStyles: {
    paddingBottom: moderateScale(60),
  },
  voiceCard: {
    marginTop: moderateScale(12),
    padding: moderateScale(14),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.themeOpacity,
    borderWidth: 1,
    borderColor: theme.colors.blackOpacity10,
    shadowColor: theme.colors.darkBlack,
  },
  voiceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceCardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: moderateScale(8),
  },
  voiceCardIconBadge: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  voiceCardBadgeIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
    resizeMode: 'contain',
  },
  voiceCardTitleText: {
    flex: 1,
  },
  voiceCardTitle: {
    ...commonStyles.font_16_bold,
    color: theme.colors.black,
    fontWeight: '800',
  },
  voiceCardSubtitle: {
    ...commonStyles.font_12_SemiBold,
    color: theme.colors.darkBlack,
    opacity: 0.7,
    marginTop: moderateScale(2),
  },
  voiceDropRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceActionBtn: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: moderateScale(8),
    borderWidth: 1,
    borderColor: theme.colors.blackOpacity10,
  },
  voiceActionBtnDanger: {
    borderColor: theme.colors.red,
  },
  voiceActionIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
    resizeMode: 'contain',
  },
  voicePlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(14),
    padding: moderateScale(10),
    borderRadius: moderateScale(12),
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.blackOpacity10,
  },
  voicePlayBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  voicePlayBtnIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    resizeMode: 'contain',
  },
  voicePlayBtnIconStop: {
    width: moderateScale(16),
    height: moderateScale(16),
    resizeMode: 'contain',
  },
  voiceWaveRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceWaveBar: {
    width: moderateScale(3),
    borderRadius: moderateScale(2),
    backgroundColor: theme.colors.florsentTheme,
  },
  voiceEmptyState: {
    marginTop: moderateScale(14),
    paddingVertical: moderateScale(18),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.florsentTheme,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  voiceEmptyIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    resizeMode: 'contain',
    marginRight: moderateScale(8),
  },
  voiceEmptyText: {
    ...commonStyles.font_14_medium,
    color: theme.colors.florsentTheme,
    fontWeight: '700',
  },
  voiceInfoTooltip: {
    marginTop: moderateScale(12),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(10),
    backgroundColor: theme.colors.florsentTheme,
    alignSelf: 'stretch',
  },
  voiceInfoArrow: {
    position: 'absolute',
    top: moderateScale(-6),
    right: moderateScale(18),
    width: 0,
    height: 0,
    borderLeftWidth: moderateScale(6),
    borderRightWidth: moderateScale(6),
    borderBottomWidth: moderateScale(6),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: theme.colors.florsentTheme,
  },
  voiceInfoTooltipText: {
    ...commonStyles.font_12_SemiBold,
    color: theme.colors.primaryWhite,
    fontWeight: '700',
  },
});

// make this component available to the app
export default ProfileScreen;
