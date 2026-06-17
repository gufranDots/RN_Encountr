import moment from 'moment';
import React, {FC, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ImageProps,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputContentSizeChangeEventData,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import FastImage from '../utils/FastImageCompat';
import SoundPlayer from 'react-native-sound-player';
import {ZegoSendCallInvitationButton} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import AnimatedLottieView from 'lottie-react-native';
import Modal from 'react-native-modal';

import imagesPath from '../constants/imagesPath';
import lottiePath from '../constants/lottiePath';
import colors from '../styles/colors';
import {getCommonStyles, hitSlopProp} from '../styles/commonStyles';
import {
  moderateScale,
  width,
  height,
  scale,
  moderateScaleVertical,
  verticalScale,
} from '../styles/responsiveSize';
import TextInputComp from './TextInputComp';
import {ApplyEaseOutAnimation, showError} from '../utils/helperFunctions';
import {canSendImages, canSendVoiceNotes} from '../utils/subscriptionFunctions';
import {useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';
import navigationString from '../constants/navigationString';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import ButtonComp from './ButtonComp';
import fontFamily from '../styles/fontFamily';
import BorderTextInput from '../Components/BorderTextInput';
import ImageText from '../Components/ImageText';
import {getOtherProfileApi} from '../redux/reduxActions/chatActions';
import {
  deleteChatMessage,
  stopLocation,
} from '../redux/reduxActions/homeActions';
import {socketRef} from '../utils/utils';
import {Loader} from './Loader';
import CustomImage from './CustomImage';
import PreviouslySentPhotos from './PreviouslySentPhotos';
import {configureZegoCloud} from '../utils/zegoConfigureFile';
import {
  saveChatDraft,
  loadChatDraft,
  clearChatDraft,
} from '../utils/chatDraftManager';
import { useTheme } from '../theme/ThemeProvider';
import strings from '../constants/Languages';
import { DeleteMsg } from '../constants/Enum';

interface ChatBubbleProps {
  img: any;
  itemData: any;
  sender_id: number;
  myId: number;
  created_at: any;
  text: string;
  onPlayAudio: () => void;
  type: string;
  pressedIndex: (i: number| null) => {};
  activeIndex: number;
  showImageFromChild: any;
  oneTime: boolean;
  currentMessage: any;
  onMessageDeleteSuccess?: (id: number, type: number) => {};
  myDeleteMes: boolean;
  readMessage: boolean;
  likeSubmit: (id: number, newLikedValue: string) => {};
  likedListSubmit: (modalVal: boolean, likedBy: any) => {};
  onSwipeToReply?: (messageData: any) => void;
  onReplyPress?: (replyToId: number | string | null) => void;
  isHighlighted?: boolean;
  roomType?: number;
  allMessages?: any[];
}

const ChatBubble: FC<ChatBubbleProps> = ({
  img,
  itemData,
  sender_id,
  myId,
  created_at,
  text,
  type,
  pressedIndex,
  activeIndex,
  showImageFromChild,
  oneTime,
  currentMessage,
  onMessageDeleteSuccess,
  myDeleteMes = false,
  readMessage = false,
  likeSubmit,
  likedListSubmit,
  onSwipeToReply,
  onReplyPress,
  isHighlighted = false,
  roomType,
  allMessages = [],
}) => {
  const {theme} = useTheme();
  const styles= getStyles(theme);
  const commonStyles = getCommonStyles(theme);
  const coordinates = itemData?.message;
  const [latitude, longitude] = coordinates.split(',').map(Number);
  const [stopSharing, setStopSharing] = useState(
    currentMessage?.is_shared_location_stoped,
  );
  const [defaultStopSharing, setDefaultStopSharing] = useState(
    currentMessage?.is_location_deleted,
  );
  const [hasClicked, setHasClicked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(Number);
  const [showFullText, setShowFullText] = useState(false);
  const [messageLiked, setMessageLiked] = useState(false);
  const navigation = useNavigation();
  const [lastTap, setLastTap] = useState(null);
  const DOUBLE_PRESS_DELAY = 300; // milliseconds
  const [onLoadPlay, setOnLoadPlay] = useState<any>({
    isLoading: false,
    url: null,
  });
  const swipeTranslateX = useRef(new Animated.Value(0)).current;
  const SWIPE_REPLY_THRESHOLD = 56;
  const swipeIconOpacity = swipeTranslateX.interpolate({
    inputRange: [0, 20, SWIPE_REPLY_THRESHOLD],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  const swipeIconScale = swipeTranslateX.interpolate({
    inputRange: [0, SWIPE_REPLY_THRESHOLD],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });

  const userData = useSelector((state: any) => state?.authReducers?.userData || {});

  const findMessageById = (messageId: number | string | null) => {
    if (!messageId || !allMessages?.length) {
      return null;
    }
    return (
      allMessages.find(
        msg =>
          String(msg?.id) === String(messageId) ||
          String(msg?._id) === String(messageId),
      ) || null
    );
  };

  const nestedReplyObj =
    currentMessage?.reply ||
    (currentMessage?.reply_to &&
    typeof currentMessage.reply_to === 'object'
      ? currentMessage.reply_to
      : null) ||
    currentMessage?.replied_message ||
    currentMessage?.quoted_message ||
    currentMessage?.parent_message ||
    null;

  const replyToId =
    currentMessage?.reply_to_id ||
    currentMessage?.reply_message_id ||
    (typeof currentMessage?.reply_to === 'object'
      ? currentMessage?.reply_to?.id
      : currentMessage?.reply_to) ||
    nestedReplyObj?.id ||
    null;

  const repliedMessage = findMessageById(replyToId);

  const replyText =
    currentMessage?.reply_message ||
    currentMessage?.reply_to_message ||
    currentMessage?.quoted_text ||
    currentMessage?.reply_text ||
    nestedReplyObj?.message ||
    nestedReplyObj?.text ||
    repliedMessage?.message ||
    repliedMessage?.text ||
    '';

  const replyType =
    currentMessage?.reply_type ||
    currentMessage?.quoted_type ||
    currentMessage?.reply_message_type ||
    nestedReplyObj?.type ||
    repliedMessage?.type ||
    null;

  const replySenderName =
    currentMessage?.reply_sender_name ||
    currentMessage?.quoted_sender_name ||
    nestedReplyObj?.senders?.first_name ||
    nestedReplyObj?.users?.first_name ||
    nestedReplyObj?.user?.name ||
    (repliedMessage?.sender_id === myId
      ? 'You'
      : repliedMessage?.senders?.first_name ||
        repliedMessage?.users?.first_name ||
        repliedMessage?.user?.name ||
        '');

  const hasReply =
    !!replyToId ||
    !!String(replyText || '').trim();
  // console.log('readMessage', readMessage, myDeleteMes, sender_id, myId,currentMessage);

  // useEffect(() => {
  //   if (userData?.id) {
  //     configureZegoCloud({
  //       id: userData?.id,
  //       user_name: userData?.full_name,
  //     });
  //   }
  // }, [userData])

  useFocusEffect(React.useCallback(() => {}, [currentMessage]));

  useEffect(() => {
    SoundPlayer.addEventListener('FinishedPlaying', ({success}) => {
      pressedIndex(null);
      setOnLoadPlay({isLoading: false, url: null});
      SoundPlayer.stop();
    });
    SoundPlayer.addEventListener('FinishedLoadingURL', ({success, url}) => {
      SoundPlayer.play();
      _getMusicInfo(onLoadPlay?.url);
      setOnLoadPlay({isLoading: false, url: null});
    });
  }, [currentMessage]);

  useEffect(() => {}, [readMessage]);

  useEffect(() => {
    if (currentMessage?.liked_by) {
      setMessageLiked(!!currentMessage?.liked_by);
    }
    return () => {
      SoundPlayer.stop();
    };
  }, []);

  useEffect(() => {
    if (onLoadPlay.isLoading === true) {
      setTimeout(() => {
        _loadAudio(onLoadPlay?.url);
      }, 0);
    }
  }, [onLoadPlay]);

  const _loadAudio = (fileUrl: string) => {
    if (fileUrl != null) {
      SoundPlayer.loadUrl(fileUrl);
    } else {
      setOnLoadPlay({isLoading: false, url: null});
    }
  };

  const onPressDeleteforMe = () => {
    const apiPayload = {
      message_id: deleteMessageId,
      delete_type: DeleteMsg.DeleteForMe,
    };
    deleteChatMessage(apiPayload)
      .then(res => {
        console.log('respose delete 1', res);
        onMessageDeleteSuccess(deleteMessageId, 1); // 1 indicate to delete message only for me
        setModalVisible(false);
      })
      .catch(error => {
        setModalVisible(false);
        console.log('respose error', error);
      });
  };

  const onPressDeleteforEve = () => {
    const apiPayload = {
      message_id: deleteMessageId,
      delete_type: DeleteMsg.DeleteForEveryOne,
    };
    deleteChatMessage(apiPayload)
      .then(res => {
        console.log('respose delete 1', res);
        onMessageDeleteSuccess(deleteMessageId, 2); // 2 indicate to delete message for everyone
        setModalVisible(false);
      })
      .catch(error => {
        setModalVisible(false);
        console.log('respose error', error);
      });
  };

  const handleDoubleTap = useCallback(
    (currentMessage: any) => {
      const now = Date.now();
      if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
        // Double tap detected

        if (sender_id !== myId) {
          // alert('double tap detected');

          let emitData = {
            room_type: 1,
            message_id: currentMessage?.id,
            user_id: currentMessage?.receiver_id || userData?.id,
            receiver_id: sender_id,
          };
          console.log('emitDataemitData', emitData);
          socketRef.emit('likeMessage', emitData, (response: any, err: any) => {
            console.log('responseresponseresponse', response);
            if (response) {
              let liked_by = response.data.likey_by
                ? response.data.likey_by?.join(',')
                : '';
              likeSubmit(currentMessage?.id, liked_by);
            }
            console.log('likeMessage response', response);
          });
        }
      } else {
        // Not a double tap, just set the lastTap time
        setLastTap(now);
      }
    },
    [lastTap],
  );

  const _getMusicInfo = async (fileUrl: string) => {
    try {
      const info = await SoundPlayer.getInfo(fileUrl);
      console.log(info, 'infoinfoinfoinfoinfoinfo 111', fileUrl);

      if (info) {
        SoundPlayer.play();
      }
    } catch (e) {
      console.log('There is no song playing', e);
    }
  };
  const urlPattern1 =
    /(http:\/\/|https:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/\S*)?/;
  const urlPattern2 =
    /(http:\/\/|https:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/\S*)?/g;

  let mapLatLong =
    text
      ?.match(urlPattern2)
      ?.toString()
      .match(/q=([^,]+),([^&]+)/) || [];

  const toggleShowFullText = () => {
    setShowFullText(!showFullText);
  };
  const truncatedText = text.slice(0, 100);
  const replyPreviewText = () => {
    if (replyType === 'image') return 'Image';
    if (replyType === 'voice_message') return 'Voice message';
    if (replyType === 'location') return 'Location';
    const preview = String(replyText || '').trim();
    return preview || 'Message';
  };

  const isSentByMe = sender_id == myId;
  const sentTextColor = theme.colors.primaryWhite;
  const sentReplyLabelColor = theme.colors.primaryWhite;
  const sentReplyTextColor = theme.colors.primaryWhiteOpacity70;
  const sentReplyBorderColor = theme.colors.primaryWhite;
  const receivedTextColor = theme.colors.black;
  const receivedReplyLabelColor = theme.colors.florsentTheme;
  const receivedReplyTextColor = theme.colors.activeTintColor;
  const receivedReplyBorderColor = theme.colors.florsentTheme;
  const bubbleTextColor = isSentByMe ? sentTextColor : receivedTextColor;
  const isVoicePlaying = activeIndex === itemData?.id;
  const isVoiceUploading = !!itemData?.loading;
  const isVoiceBuffering =
    !!onLoadPlay?.isLoading && onLoadPlay?.url === text;
  const voiceAccentColor = isSentByMe
    ? theme.colors.primaryWhite
    : theme.colors.florsentTheme;
  const voiceLabelColor = isSentByMe
    ? theme.colors.primaryWhite
    : theme.colors.florsentTheme;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const absDx = Math.abs(gestureState.dx);
        const absDy = Math.abs(gestureState.dy);
        // Keep vertical chat scrolling responsive; only capture deliberate horizontal swipes.
        return absDx > 24 && absDx > absDy * 1.8;
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          swipeTranslateX.setValue(Math.min(gestureState.dx, 80));
        } else {
          swipeTranslateX.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_REPLY_THRESHOLD) {
          onSwipeToReply?.(currentMessage);
        }
        Animated.spring(swipeTranslateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeTranslateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
      },
    }),
  ).current;

  return text === 'You have Missed call' && sender_id == myId ? null : (
    <View
      style={[
        sender_id == myId ? {...styles.senderStyle} : {...styles.receiverStyle},
      ]}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {sender_id != myId ? (
          <TouchableOpacity
            onPress={() => {
              const apiData = {
                user_id: Number(sender_id),
              };

              getOtherProfileApi(apiData)
                .then(res => {
                  if (res) {
                    navigation.navigate(navigationString.VIEWPROFILE, {
                      prevScreenData: res?.data,
                    });
                  } else {
                    Alert.alert('', 'User data not get Please try again');
                  }
                })
                .catch(error => {
                  console.log(error, 'getOtherProfileApi error');
                });
            }}>
            <FastImage
              source={img ? {uri: img} : imagesPath?.profileimage}
              style={{
                borderRadius: moderateScale(12),
                height: moderateScale(24),
                marginRight: moderateScale(5),
                width: moderateScale(24),
              }}
            />
          </TouchableOpacity>
        ) : null}
        <View style={styles.swipeWrapper}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.replySwipeIconContainer,
              {
                opacity: swipeIconOpacity,
                transform: [{scale: swipeIconScale}],
              },
            ]}>
            <Image
              source={imagesPath.comment}
              style={styles.replySwipeIcon}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View
            {...panResponder.panHandlers}
            style={{transform: [{translateX: swipeTranslateX}]}}>
          <TouchableOpacity
            disabled={myDeleteMes == true ? true : false}
            // hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
            style={[
              {
                ...styles.textView,
                padding: type === 'image' ? moderateScale(6) : moderateScale(8),
                backgroundColor: roomType === 2 ? 'transparent' :
                  sender_id == myId ? theme.colors.themecolor2 : 'transparent',
                marginBottom: moderateScale(0),
                flexDirection: hasReply ? 'column' : 'row',
                alignItems: hasReply ? 'flex-start' : 'center',
                borderWidth: isHighlighted ? 2 : 0,
                borderColor: isHighlighted
                  ? theme.colors.activeTintColor
                  : 'transparent',
              },
            ]}
          onLongPress={() => {
            setModalVisible(true);
            setDeleteMessageId(currentMessage?.id);
          }}
          onPress={() => {
            handleDoubleTap(currentMessage);

            if (type === 'location') {
              if (defaultStopSharing == 0) {
                const coordinates = itemData?.message;
                const [latitude, longitude] = coordinates
                  .split(',')
                  .map(Number);
                navigation.navigate(navigationString.MAP_SCREEN, {
                  lat: latitude,
                  long: longitude,
                });
              } else {
                Alert.alert('', 'Location is expired');
              }
            }

            if (type === 'text' && urlPattern1.test(text)) {
              navigation.navigate(navigationString.MAP_SCREEN, {
                lat: mapLatLong[1],
                long: mapLatLong[2],
              });
            }

            if (type === 'voice_message') {
              if (onLoadPlay?.isLoading) return;
              if (text.includes('mp4')) {
                return showError('Unsupported file');
              }
              ApplyEaseOutAnimation();
              if (activeIndex === itemData?.id) {
                SoundPlayer.stop();
                pressedIndex(null);
                setOnLoadPlay({isLoading: false, url: null});
              } else {
                pressedIndex(itemData?.id);
                setOnLoadPlay({isLoading: true, url: text});
              }
            } else if (type === 'image') {
              if (oneTime) {
                if (!hasClicked && sender_id != myId) {
                  showImageFromChild(text);
                }
                setHasClicked(true);
              } else {
                showImageFromChild(text);
              }
            }
          }}>
          {hasReply ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onReplyPress?.(replyToId)}>
              <View
              style={[
                styles.replyMessageContainer,
                {
                  borderLeftColor: isSentByMe
                    ? sentReplyBorderColor
                    : receivedReplyBorderColor,
                  backgroundColor: isSentByMe
                    ? theme.colors.blackOpacity20
                    : theme.colors.blackOpacity10,
                  borderRadius: moderateScale(6),
                  paddingVertical: moderateScale(4),
                },
              ]}>
              <Text
                style={[
                  styles.replyMessageLabel,
                  {
                    color: isSentByMe
                      ? sentReplyLabelColor
                      : receivedReplyLabelColor,
                  },
                ]}>
                {replySenderName || 'Reply'}
              </Text>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[
                  styles.replyMessageText,
                  {
                    color: isSentByMe
                      ? sentReplyTextColor
                      : receivedReplyTextColor,
                  },
                ]}>
                {replyPreviewText()}
              </Text>
              </View>
            </TouchableOpacity>
          ) : null}
          {/* ============++++========++======+++++===+++++++== */}

          {/* Heart Function */}
          {!!currentMessage?.liked_by && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: verticalScale(-7),
                right: scale(-10),
              }}
              onPress={() => {
                likedListSubmit(true, currentMessage?.liked_by);
              }}>
              <FastImage
                // source={imagesPath?.ic_redBadge}
                source={imagesPath?.ic_like_message}
                // tintColor={'red'}
                style={{
                  height: moderateScale(22),
                  width: moderateScale(22),
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}

          {/* ============++++========++======+++++===+++++++== */}

          {type == 'voice_message' && (
            <View style={styles.voiceMessageRow}>
              <View
                style={[
                  styles.voicePlayButton,
                  {
                    backgroundColor: isSentByMe
                      ? theme.colors.primaryWhite + '22'
                      : theme.colors.florsentTheme + '22',
                    borderColor: voiceAccentColor + '55',
                  },
                ]}>
                {isVoiceUploading || isVoiceBuffering ? (
                  <ActivityIndicator
                    size="small"
                    color={voiceAccentColor}
                  />
                ) : (
                  <Image
                    source={
                      isVoicePlaying
                        ? imagesPath.ic_play
                        : imagesPath.ic_pause
                    }
                    style={[
                      styles.voicePlayIcon,
                      {tintColor: voiceAccentColor},
                    ]}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text
                style={[styles.voiceMessageLabel, {color: voiceLabelColor}]}>
                {isVoiceUploading
                  ? 'Sending...'
                  : isVoicePlaying
                  ? 'Playing'
                  : 'Voice message'}
              </Text>
            </View>
          )}

          {type === 'image' ? (
            <>
              {oneTime ? (
                <View
                  style={{
                    alignItems: 'center',
                    height: moderateScale(25),
                    flexDirection: 'row',
                  }}>
                  <Image
                    resizeMode="contain"
                    style={{tintColor: bubbleTextColor, height: moderateScale(25)}}
                    source={imagesPath.oneTime}
                  />
                  <Text style={{marginLeft: moderateScale(5), color: bubbleTextColor}}>
                    Image
                  </Text>
                </View>
              ) : (
                <View style={{height: moderateScale(80), width: moderateScale(120)}}>
                  <View>
                    <View
                      style={{
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        justifyContent: 'center',
                      }}>
                      <ActivityIndicator
                        size={'small'}
                        color={sender_id == myId ? theme.colors.white : theme.colors.white}
                      />
                    </View>
                    <FastImage
                      source={{
                        uri: itemData?.message,
                        priority: FastImage.priority.high,
                      }}
                      style={{
                        height: '100%',
                        width: '100%',
                        borderRadius: moderateScale(12),
                      }}
                    />
                  </View>
                </View>
              )}
            </>
          ) : text === 'You have Missed call' && sender_id != myId ? (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={imagesPath.ic_call}
                style={{tintColor: theme.colors.red}}
              />
              <Text
                style={{
                  ...commonStyles.font_16_medium, //////////
                  marginLeft: moderateScale(6),
                  color: isSentByMe ? sentTextColor : receivedTextColor,
                }}>
                {type === 'text'
                  ? text
                  : itemData?.sending === true
                  ? 'Sending ...'
                  : 'Voice'}
              </Text>
            </View>
          ) : (
            <View>
              {urlPattern1.test(text) &&
              text.includes('.com/maps') &&
              mapLatLong.length == 3 ? (
                <View
                  style={{
                    height: moderateScaleVertical(94),
                    width: moderateScale(140),
                    borderRadius: moderateScale(10),
                    overflow: 'hidden',
                  }}>
                  <MapView
                    scrollEnabled={false}
                    style={{
                      height: moderateScaleVertical(94),
                      width: moderateScale(140),
                    }}
                    region={{
                      latitude:
                        mapLatLong.length == 3
                          ? Number(mapLatLong[1])
                          : 25.7617,
                      longitude:
                        mapLatLong.length == 3
                          ? Number(mapLatLong[2])
                          : 80.1918,
                      latitudeDelta: 0.035,
                      longitudeDelta: 0.0221,
                    }}
                    showsUserLocation={false}
                    showsMyLocationButton={false}>
                    {!!mapLatLong?.length ? (
                      <Marker
                        coordinate={{
                          latitude:
                            mapLatLong.length == 3
                              ? Number(mapLatLong[1])
                              : 25.7617,
                          longitude:
                            mapLatLong.length == 3
                              ? Number(mapLatLong[2])
                              : 80.1918,
                          // latitudeDelta: 0.0122,
                          // longitudeDelta: 0.032,
                        }}
                        image={imagesPath.icLocationNew}></Marker>
                    ) : null}
                  </MapView>
                </View>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  marginTop:
                    urlPattern1.test(text) && text.includes('.com/maps')
                      ? moderateScaleVertical(8)
                      : 0,
                }}>
                {urlPattern1.test(text) && text.includes('.com/maps') ? (
                  <Image source={imagesPath.ic_location}></Image>
                ) : null}

                {myDeleteMes != true ? (
                  <View>
                    {type === 'location' ? (
                      <View
                        style={{
                          height:
                            stopSharing == 1
                              ? moderateScale(94)
                              : myId !== sender_id
                              ? moderateScale(94)
                              : moderateScaleVertical(140),
                          width: moderateScale(140),
                          borderRadius: moderateScale(10),
                          overflow: 'hidden',
                        }}>
                        <MapView
                          scrollEnabled={false}
                          style={{
                            height: moderateScaleVertical(94),
                            width: moderateScale(140),
                          }}
                          region={{
                            latitude: latitude ? latitude : 25.7617,
                            longitude: longitude ? longitude : 80.1918,
                            latitudeDelta: 0.035,
                            longitudeDelta: 0.0221,
                          }}
                          showsUserLocation={false}
                          showsMyLocationButton={false}>
                          {!!mapLatLong?.length ? (
                            <Marker
                              coordinate={{
                                latitude:
                                  mapLatLong.length == 3
                                    ? Number(mapLatLong[1])
                                    : 25.7617,
                                longitude:
                                  mapLatLong.length == 3
                                    ? Number(mapLatLong[2])
                                    : 80.1918,
                                latitudeDelta: 0.0122,
                                longitudeDelta: 0.032,
                              }}
                              image={imagesPath.icLocationNew}></Marker>
                          ) : null}
                        </MapView>
                        {defaultStopSharing == 0 &&
                        stopSharing !== 1 &&
                        myId == sender_id ? (
                          <TouchableOpacity
                            onPress={() => {
                              const apiData = {
                                message_id: itemData?.id,
                              };
                              stopLocation(apiData).then(res => {
                                console.log('res', JSON.stringify(res));
                                if (res?.success == true) {
                                  setStopSharing(1);
                                }
                              });
                            }}
                            style={{
                              backgroundColor: colors.white,
                              borderRadius: moderateScale(20),
                              width: '70%',
                              height: '20%',
                              alignSelf: 'center',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: moderateScale(15),
                            }}>
                            <Text
                              style={{
                                fontSize: moderateScale(14),
                                fontFamily: fontFamily.SemiBold,
                                color: colors.black,
                              }}>
                              Stop Sharing
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            disabled={true}
                            style={{
                              backgroundColor: colors.white,
                              borderRadius: moderateScale(20),
                              width: '95%',
                              height: '20%',
                              alignSelf: 'center',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: moderateScale(15),
                            }}>
                            <Text
                              style={{
                                fontSize: moderateScale(14),
                                fontFamily: fontFamily.SemiBold,
                                color: colors.black,
                              }}>
                              Location expired
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : type !== 'voice_message' ? (
                      <Text
                        style={
                          urlPattern1.test(text) && text.includes('.com/maps')
                            ? {
                                ...commonStyles.font_12_medium,
                                color: bubbleTextColor,
                              }
                            : {
                                ...commonStyles.font_12_medium,
                                color: bubbleTextColor,
                              }
                        }>
                        {!showFullText ? (
                          <React.Fragment>
                            {type === 'text'
                              ? urlPattern1.test(text) &&
                                text.includes('.com/maps')
                                ? ' Location'
                                : truncatedText
                              : itemData?.sending === true
                              ? 'Sending ...'
                              : 'Voice'}
                            {text.length > 100 ? (
                              <TouchableOpacity
                                onPress={toggleShowFullText}
                                hitSlop={{
                                  top: 16,
                                  right: 16,
                                  left: 16,
                                  bottom: 50,
                                }}>
                                <Text
                                  onPress={toggleShowFullText}
                                  style={{
                                    ...commonStyles.font_12_medium, ////
                                    bottom: -4,
                                    textAlign: 'center',
                                    alignSelf: 'center',
                                    color: colors.blue,
                                  }}>
                                  ...Show More
                                </Text>
                              </TouchableOpacity>
                            ) : null}
                          </React.Fragment>
                        ) : (
                          text
                        )}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Image
                      resizeMode="contain"
                      source={imagesPath.delete_ic}
                      style={{
                        tintColor: colors.red,
                        width: 20,
                        height: 20,
                        marginRight: moderateScale(5),
                      }}
                    />

                    <Text
                      style={
                        urlPattern1.test(text) && text.includes('.com/maps')
                          ? {
                              ...commonStyles.font_14_bold,
                              color:
                                sender_id == myId ? colors.white : colors.black,
                            }
                          : {
                              ...commonStyles.font_14_medium,
                              color:
                                sender_id == myId ? colors.white : colors.black,
                            }
                      }>
                      Message Deleted
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* {date&time} */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {created_at && (
          <Text
            style={[
              styles.timeText,
              {marginLeft: sender_id == myId ? moderateScale(30) : 5},
            ]}>
            {moment(created_at).format('[[]h:mm A[]]')}
          </Text>
        )}

        {/* {readMessage &&( */}
        {readMessage &&
        sender_id == myId &&
        myDeleteMes !== true &&
        userData?.subscription?.subscription_name != 'Free' ? (
          // && myDeleteMes !== true && sender_id == myId
          <Image
            style={{
              width: moderateScale(12),
              height: moderateScale(12),
              marginRight: moderateScale(3),
            }}
            source={imagesPath?.ic_doubleTick}
          />
        ) : null}
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Are you sure you want to delete?
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                onPressDeleteforMe();
              }}>
              <Text style={styles.buttonText}>Delete for Me</Text>
            </TouchableOpacity>
            {sender_id == myId ? (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  onPressDeleteforEve();
                }}>
                <Text style={styles.buttonText}>Delete for Everyone</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default React.memo(ChatBubble);

interface ChatInputComponentProps {
  onChangeText: () => void;
  onSend: () => void;
  onSendLiveLocation: (
    latitude: number,
    longitude: number,
    expirationHours?: number,
  ) => void;
  textValue: string;
  sender_id: any;
  onStartRecAudio: () => void;
  onStopRecAudio: () => void;
  onCancelRecAudio?: () => void;
  onSendImage: () => void;
  onSendCameraImage: () => void;
  onEndEditing: () => void;
  roomType: any;
  publicRoom: any;
  chatId?: string; // Unique identifier for the chat (user ID or room ID)
  onDraftLoaded?: (draftText: string) => void; // Callback when a draft is loaded
  messages?: any[]; // Chat messages for filtering previously sent photos
  userData?: any; // Current user data
  onResendPhoto?: (photo: any) => void; // Callback for resending a photo
  currentLoc: {lat: number; lng: number};
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  setMapRegion: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
  hasActiveReply?: boolean;
}

export const ChatInputComponent: FC<ChatInputComponentProps> = React.memo(
  ({
    onChangeText,
    onSend,
    textValue,
    sender_id,
    onStartRecAudio,
    onStopRecAudio,
    onCancelRecAudio,
    onSendImage,
    onSendCameraImage,
    onSendLiveLocation,
    onEndEditing,
    roomType,
    publicRoom,
    chatId,
    onDraftLoaded,
    messages,
    onResendPhoto,
    currentLoc,
    mapRegion,
    setMapRegion,
    hasActiveReply = false,
  }) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);
  const commonStyles = getCommonStyles(theme);
    const navigation = useNavigation();
    const [isRecording, setIsRecording] = useState(false);
    const [recordSeconds, setRecordSeconds] = useState(0);
    const isRecordingRef = useRef(false);
    const recordSecondsRef = useRef(0);
    const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const userData = useSelector((state: any) => state?.authReducers?.userData || {});
    const recordPulseAnim = useRef(new Animated.Value(1)).current;
    const insets = useSafeAreaInsets();
    const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
    const hasText = Boolean(textValue?.trim()?.length);

    const formatRecordTime = (totalSeconds: number) => {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const resetRecordingState = () => {
      isRecordingRef.current = false;
      recordSecondsRef.current = 0;
      setRecordSeconds(0);
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    };

    const handleCancelRecording = () => {
      if (!isRecordingRef.current) {
        return;
      }
      resetRecordingState();
      onCancelRecAudio?.();
    };

    const handleStopRecording = () => {
      if (!isRecordingRef.current) {
        return;
      }
      const duration = recordSecondsRef.current;
      resetRecordingState();
      if (duration < 1) {
        onCancelRecAudio?.();
        return;
      }
      onStopRecAudio();
    };

    const onPressRecording = () => {
      onStartRecAudio();
      isRecordingRef.current = true;
      recordSecondsRef.current = 0;
      setRecordSeconds(0);
      setIsRecording(true);
    };

    const onPressRecordingOut = () => {
      if (isRecordingRef.current) {
        handleStopRecording();
      }
    };

    useEffect(() => {
      if (!isRecording) {
        return;
      }
      recordTimerRef.current = setInterval(() => {
        recordSecondsRef.current += 1;
        setRecordSeconds(recordSecondsRef.current);
      }, 1000);
      return () => {
        if (recordTimerRef.current) {
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
        }
      };
    }, [isRecording]);

    useEffect(() => {
      if (!isRecording) {
        recordPulseAnim.setValue(1);
        return;
      }
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(recordPulseAnim, {
            toValue: 1.35,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(recordPulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }, [isRecording, recordPulseAnim]);

    const [showMap, setshowMap] = useState<boolean>(false);
    const [showExtra, setshowExtra] = useState<boolean>(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [showPreviouslySentPhotos, setShowPreviouslySentPhotos] =
      useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showExpirationModal, setShowExpirationModal] =
      useState<boolean>(false);
    const [settingUpLiveLocation, setSettingUpLiveLocation] =
      useState<boolean>(false);
    const minInputHeight = moderateScale(40);
    const maxInputHeight = moderateScale(120);
    const [inputHeight, setInputHeight] = useState<number>(minInputHeight);
    const [lastSavedDraft, setLastSavedDraft] = useState<string>('');
    const draftSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    let shareLocationRef = useRef(null).current;
    const onSendLocation = (lat: number, lng: number) => {
      setLoading(true);

      // Send location immediately
      onSend(
        `https://www.google.com/maps?q=${lat?.toFixed(4)},${lng.toFixed(4)}`,
        2,
      );

      // Reset states and close map after a short delay
      setTimeout(() => {
        setselectedLocation2({
          lat: 0,
          lng: 0,
        });
        setinputValue('');
        setLoading(false);
        setshowMap(false);
      }, 300);
    };

    // Load draft when component mounts
    useEffect(() => {
      if (chatId) {
        loadChatDraft(chatId).then(draft => {
          if (draft && draft.text && draft.text.trim() !== '') {
            // Only load draft if there's no current text
            if (!textValue || textValue.trim() === '') {
              onDraftLoaded?.(draft.text);
            }
          }
        });
      }
    }, [chatId]);

    // Save draft when text changes
    useEffect(() => {
      if (chatId && textValue !== lastSavedDraft) {
        // Clear existing timeout
        if (draftSaveTimeoutRef.current) {
          clearTimeout(draftSaveTimeoutRef.current);
        }

        // Set new timeout to save draft after 2 seconds of no typing
        draftSaveTimeoutRef.current = setTimeout(() => {
          if (textValue && textValue.trim() !== '') {
            saveChatDraft(chatId, textValue);
            setLastSavedDraft(textValue);
          } else if (textValue === '') {
            // Clear draft if text is empty
            clearChatDraft(chatId);
            setLastSavedDraft('');
          }
        }, 0);
      }

      return () => {
        if (draftSaveTimeoutRef.current) {
          clearTimeout(draftSaveTimeoutRef.current);
        }
      };
    }, [textValue, chatId, lastSavedDraft]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (draftSaveTimeoutRef.current) {
          clearTimeout(draftSaveTimeoutRef.current);
        }
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const showEvent =
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent =
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
      const showSub = Keyboard.addListener(showEvent, () =>
        setIsKeyboardVisible(true),
      );
      const hideSub = Keyboard.addListener(hideEvent, () =>
        setIsKeyboardVisible(false),
      );
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    useEffect(() => {
      if (!textValue) {
        setInputHeight(minInputHeight);
      }
    }, [textValue, minInputHeight]);

    const onMessageInputSizeChange = (
      event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
    ) => {
      const nextHeight = Math.max(
        minInputHeight,
        Math.min(maxInputHeight, event.nativeEvent.contentSize.height),
      );

      if (nextHeight !== inputHeight) {
        setInputHeight(nextHeight);
      }
    };

    const onLiveLocation = (lat: number, lng: number) => {
      console.log('gggg', sender_id, userData?.id);
      socketRef.emit(
        'trackLiveLocation',
        {
          user_id: sender_id,
          sender_id: userData?.id,
          lat: lat,
          long: lng,
        },
        (response: any, err: any) => {
          console.log(
            'trackLiveLocation response',
            response,
            'trackLiveLocation err===>',
            err,
          );
        },
      );
    };

    // Function to fetch the live location (this should be implemented according to your logic)
    const fetchLiveLocation = (expirationHours: number = 1) => {
      // Close map modal if it's still open
      setshowMap(false);

      setSettingUpLiveLocation(true);
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          shareLocationRef = setInterval(() => {
            onLiveLocation(latitude, longitude);
          }, 10000);

          // Send live location immediately without delay
          onSendLiveLocation(latitude, longitude, expirationHours);
          setSettingUpLiveLocation(false);
        },
        error => {
          console.error(error);
          setSettingUpLiveLocation(false);
        },
        // {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000},
        { enableHighAccuracy: true, timeout: 30000, ...(Platform.OS === 'ios' ? { maximumAge: 1000 } : {}), }
      );
    };

    const handleExpirationSelection = (expirationHours: number) => {
      // Provide immediate feedback by closing modal first
      setShowExpirationModal(false);

      // Then start the location sharing process
      fetchLiveLocation(expirationHours);
    };

    const [selectedLocation, setselectedLocation] = useState({
      lat: 0,
      lng: 0,
    });
    const [selectedLocation2, setselectedLocation2] = useState({
      lat: 0,
      lng: 0,
    });
    const handleMapPress = async (event: any) => {
      const {coordinate} = event.nativeEvent;

      if (coordinate?.latitude && coordinate?.longitude) {
        setselectedLocation2({
          lat: coordinate.latitude,
          lng: coordinate.longitude,
        });

        // Update map region to center on the selected location
        setMapRegion({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=AIzaSyAbOOVcvW6QObCxDywVynr6vz6s5KuWzn0`,
            {method: 'GET'},
          );
          let res = await response.json();
          if (res?.results?.length > 0) {
            const address = res.results[0]?.formatted_address;
            setlocationArray([]);
            setinputValue(address || '');
          }
        } catch (error) {
          console.error('Error fetching location:', error);
        }
      }
    };

    const [inputValue, setinputValue] = useState('');
    const [locationArray, setlocationArray] = useState([]);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const onPressAddress = async (e: string) => {
      if (!e || e.trim().length < 2) {
        setlocationArray([]);
        return;
      }

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout to debounce API calls
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          let res = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
              e,
            )}&key=AIzaSyAbOOVcvW6QObCxDywVynr6vz6s5KuWzn0`,
            {
              method: 'GET',
            },
          );
          let response = await res.json();
          setlocationArray(response?.predictions || []);
        } catch (e) {
          console.log('erorr in goole place', e);
          setlocationArray([]);
        }
      }, 500); // 500ms debounce
    };

    const onPressSelected = async (id: string, region = true) => {
      try {
        let res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            id,
          )}&key=AIzaSyAbOOVcvW6QObCxDywVynr6vz6s5KuWzn0`,
          {
            method: 'GET',
          },
        );
        let response = await res.json();

        console.log(
          response?.results[0]?.geometry?.location,
          'locationresssssssdsfds',
        );
        const location = response?.results[0]?.geometry?.location;

        if (location?.lat && location?.lng) {
          setselectedLocation(location);

          if (region) {
            setselectedLocation2(location);
            // Update map region to center on the selected location
            setMapRegion({
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            });
          }
        }
      } catch (e) {
        console.log('erorr in goole place', e);
      }
    };

    const showAlert = (val: string) => {
      console.log('roomType147', roomType);

      Alert.alert(
        '',
        'EXPLICIT CONTENT PROHIBITED',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel button pressed'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: val == 'camera' ? onSendCameraImage : onSendImage,
          },
        ],
        {cancelable: true},
      );
    };

    const renderlocation = (item: any, index: number) => {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setlocationArray([]);
            setinputValue(item.description);
            onPressSelected(item?.description, true);
          }}>
          <ImageText
            source={imagesPath.newlocation}
            tintColor={theme.colors.themecolor2}
            mainstyle={{
              alignItems: 'center',
              paddingVertical: moderateScaleVertical(12),
            }}
            text={item.description}
            txtstyle={{fontSize: scale(16), color: theme.colors.blackOpacity70}}
          />
          {index != locationArray.length - 1 && (
            <View
              style={{height: 0.5, backgroundColor: theme.colors.blackOpacity20}}
            />
          )}
        </TouchableOpacity>
      );
    };

    const renderAttachmentOption = (
      icon: any,
      label: string,
      onPress: () => void,
      iconBg: string,
    ) => (
      <TouchableOpacity
        style={styles.attachmentOptionStyle}
        onPress={onPress}
        activeOpacity={0.75}>
        <View
          style={[
            styles.attachmentIconCircle,
            {backgroundColor: iconBg},
          ]}>
          <Image style={styles.attachmentIconImage} source={icon} />
        </View>
        <Text style={styles.attachmentLabel}>{label}</Text>
      </TouchableOpacity>
    );

    return (
      <View
        style={[
          styles.inputToolbarWrapper,
          {
            paddingBottom: isKeyboardVisible
              ? tabBarHeight > 0
                ? 0
                : moderateScale(6)
              : Math.max(insets.bottom, moderateScale(4)),
            marginBottom:
              isKeyboardVisible && tabBarHeight > 0 ? moderateScale(-10) : 0,
          },
        ]}>
        {showExtra ? (
          <View style={styles.attachmentGrid}>
            {renderAttachmentOption(
              imagesPath.ic_gallery,
              strings.galleryChat,
              () => {
                setshowExtra(false);
                if (roomType === 2) {
                  if (publicRoom) {
                    showAlert('gallery');
                  } else {
                    onSendImage();
                  }
                } else {
                  onSendImage();
                }
              },
              theme.colors.themecolor2 + '18',
            )}
            {renderAttachmentOption(
              imagesPath.camera,
              strings.cameraChat,
              () => {
                setshowExtra(false);
                if (roomType === 2) {
                  if (publicRoom) {
                    showAlert('camera');
                  } else {
                    onSendCameraImage();
                  }
                } else {
                  onSendCameraImage();
                }
              },
              theme.colors.florsentTheme + '18',
            )}
            {renderAttachmentOption(
              imagesPath.ic_photoReuse,
              strings.sharedFolder,
              () => {
                setshowExtra(false);
                setShowPreviouslySentPhotos(true);
              },
              theme.colors.activeTintColor + '18',
            )}
            {renderAttachmentOption(
              imagesPath.ic_location,
              strings.sendLocation,
              () => {
                setshowExtra(false);
                setshowMap(true);
              },
              theme.colors.red_09 + '18',
            )}
          </View>
        ) : null}

        <View style={styles.inputBarContainer}>
          {isRecording ? (
            <TouchableOpacity
              style={styles.recordingCancelBtn}
              onPress={handleCancelRecording}
              hitSlop={hitSlopProp}
              activeOpacity={0.7}>
              <Image
                source={imagesPath.ic_cross}
                style={styles.recordingCancelIcon}
              />
            </TouchableOpacity>
          ) : !settingUpLiveLocation ? (
            <TouchableOpacity
              style={styles.chatOptionStyle}
              onPress={() => {
                if (!showExtra) {
                  Keyboard.dismiss();
                }
                setshowExtra(!showExtra);
              }}
              activeOpacity={0.75}>
              <View
                style={[
                  styles.attachIconCircle,
                  showExtra && styles.attachBtnActive,
                ]}>
                <Text
                  style={[
                    styles.attachPlusText,
                    showExtra && {transform: [{rotate: '45deg'}]},
                  ]}>
                  +
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {isRecording ? (
            <View style={styles.recordingPanel}>
              <Animated.View
                style={[
                  styles.recordingDotOuter,
                  {transform: [{scale: recordPulseAnim}]},
                ]}>
                <View style={styles.recordingDotInner} />
              </Animated.View>
              <Text style={styles.recordingTimer}>
                {formatRecordTime(recordSeconds)}
              </Text>
              <Text style={styles.recordingHint}>Release to send</Text>
            </View>
          ) : settingUpLiveLocation ? (
            <View style={styles.liveLocationBanner}>
              <ActivityIndicator
                size="small"
                color={theme.colors.themecolor2}
                style={{marginRight: moderateScale(8)}}
              />
              <Text style={styles.liveLocationText}>
                Setting up live location...
              </Text>
            </View>
          ) : (
            <View style={styles.textInputWrapper}>
              <TextInput
                placeholder={hasActiveReply ? 'Reply' : 'Message'}
                style={[
                  styles.messageInput,
                  {
                    minHeight: minInputHeight,
                    maxHeight: maxInputHeight,
                  },
                ]}
                multiline
                onContentSizeChange={onMessageInputSizeChange}
                onEndEditing={onEndEditing}
                value={textValue}
                onChangeText={onChangeText}
                keyboardType="default"
                secureTextEntry={false}
                placeholderTextColor={theme.colors.blackOpacity50}
              />
            </View>
          )}

          {!settingUpLiveLocation ? (
            <View style={styles.chatActionsRow}>
              {hasText && !isRecording ? (
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => {
                    if (chatId) {
                      clearChatDraft(chatId);
                      setLastSavedDraft('');
                    }
                    onSend();
                  }}
                  activeOpacity={0.8}>
                  <Image
                    style={styles.sendBtnIcon}
                    source={imagesPath.ic_sent}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.chatOptionStyle,
                    isRecording && styles.recordingMicActive,
                  ]}
                  onLongPress={onPressRecording}
                  onPressOut={onPressRecordingOut}
                  delayLongPress={200}
                  activeOpacity={0.7}>
                  <Image
                    style={[
                      styles.chatOptionIconStyle,
                      isRecording && styles.recordingMicIconActive,
                    ]}
                    source={imagesPath.ic_microphone}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>

        {!!currentLoc?.lat ? (
          <Modal
            isVisible={showMap}
            style={{
              justifyContent: 'flex-end',
              margin: 0,
            }}>
            <View
              // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{flex: 1, justifyContent: 'flex-end'}}>
              <View
                style={{
                  backgroundColor: theme.colors.white,
                  height: height * 0.8,
                  borderTopLeftRadius: moderateScale(10),
                  borderTopRightRadius: moderateScale(10),
                  overflow: 'hidden',
                }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <MapView
                    scrollEnabled={true}
                    style={{
                      height: '100%',
                      width: '100%',
                    }}
                    initialRegion={mapRegion}
                    region={mapRegion}
                    showsUserLocation={false}
                    showsMyLocationButton={true}
                    onPress={handleMapPress}>
                    {selectedLocation2?.lat !== 0 ? (
                      <Marker
                        coordinate={{
                          latitude: Number(selectedLocation2?.lat) || 25.7617,
                          longitude: Number(selectedLocation2?.lng) || 80.1918,
                        }}
                        image={imagesPath.icLocationNew}></Marker>
                    ) : null}
                  </MapView>
                </TouchableWithoutFeedback>

                <View
                  style={{
                    position: 'absolute',
                    flexDirection: 'row',
                    top: Keyboard.isVisible()
                      ? moderateScaleVertical(150)
                      : moderateScaleVertical(20),
                    alignItems: 'center',
                    marginHorizontal: moderateScale(10),
                    zIndex: 1000,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      setselectedLocation({lat: 0, lng: 0});
                      setselectedLocation2({lat: 0, lng: 0});
                      setshowMap(false);
                    }}
                    style={{flex: 0.06}}>
                    <Image
                      source={imagesPath.backnew}
                      style={{
                        tintColor: theme.colors.blackOpacity60,
                        marginBottom: moderateScaleVertical(26),
                        marginLeft: moderateScale(8),
                      }}
                    />
                  </TouchableOpacity>

                  {/* My Location Button */}
                  <TouchableOpacity
                    onPress={() => {
                      if (currentLoc?.lat && currentLoc?.lng) {
                        setMapRegion({
                          latitude: Number(currentLoc.lat),
                          longitude: Number(currentLoc.lng),
                          latitudeDelta: 0.015,
                          longitudeDelta: 0.0121,
                        });
                        setselectedLocation2({
                          lat: currentLoc.lat,
                          lng: currentLoc.lng,
                        });
                      }
                    }}
                    style={{
                      position: 'absolute',
                      right: moderateScale(10),
                      backgroundColor: theme.colors.white,
                      borderRadius: moderateScale(25),
                      padding: moderateScale(10),
                      shadowColor: theme.colors.black,
                      shadowOffset: {width: 0, height: 2},
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}>
                    <Image
                      source={imagesPath.ic_location}
                      style={{
                        height: moderateScale(20),
                        width: moderateScale(20),
                        tintColor: theme.colors.themecolor2,
                      }}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      backgroundColor: theme.colors.white,
                      borderRadius: moderateScale(30),
                      marginLeft: moderateScale(20),
                      minHeight: moderateScale(60),
                      marginBottom: moderateScale(30),
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: moderateScale(15),
                    }}>
                    <Image
                      source={imagesPath.searchnew}
                      style={{
                        width: moderateScale(20),
                        height: moderateScale(20),
                        marginRight: moderateScale(10),
                        tintColor: theme.colors.black,
                      }}
                    />
                    <TextInput
                      value={inputValue}
                      onChangeText={(e: string) => {
                        onPressAddress(e);
                        setinputValue(e);
                      }}
                      placeholder="Search city zip code..."
                      style={{
                        fontSize: 16,
                        fontFamily: fontFamily.medium,
                        color: theme.colors.black,
                        flex: 1,
                        // height: moderateScale(40),
                        // paddingVertical: moderateScale(10),
                        // paddingHorizontal: moderateScale(5),
                      }}
                      maxLength={100}
                      secureTextEntry={false}
                      keyboardType="default"
                      autoCapitalize="sentences"
                      autoCorrect={false}
                      returnKeyType="default"
                      blurOnSubmit={false}
                      editable={true}
                      multiline={false}
                      numberOfLines={1}
                      placeholderTextColor={theme.colors.black}
                      selectionColor={theme.colors.themecolor2}
                      selectTextOnFocus={false}
                      showSoftInputOnFocus={true}
                      spellCheck={true}
                      textAlign="left"
                      textContentType="none"
                      underlineColorAndroid="transparent"
                    />
                  </View>
                </View>
                {locationArray?.length > 0 && (
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View
                      style={{
                        backgroundColor: theme.colors.white,
                        paddingVertical: moderateScale(10),
                        borderRadius: moderateScale(20),
                        position: 'absolute',
                        top: moderateScaleVertical(100),
                        width: width - moderateScale(20),
                        marginHorizontal: moderateScale(10),
                      }}>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {locationArray.map((item, index) => {
                          return renderlocation(item, index);
                        })}
                      </ScrollView>
                    </View>
                  </TouchableWithoutFeedback>
                )}

                <View
                  style={{
                    position: 'absolute',
                    flexDirection: 'row',
                    bottom: Math.max(insets.bottom, moderateScaleVertical(16)),
                    left: 0,
                    right: 0,
                    alignSelf: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: moderateScale(8),
                    paddingVertical: moderateScale(10),
                  }}>
                  <TouchableOpacity
                    disabled={currentLoc.lat === 0 ? true : false}
                    onPress={() =>
                      onSendLocation(currentLoc.lat, currentLoc.lng)
                    }
                    style={{
                      flex: 1,
                      marginHorizontal: moderateScale(1),
                      backgroundColor:
                        currentLoc.lat !== 0
                          ? theme.colors.themecolor2
                          : theme.colors.themeColor,
                      height: moderateScale(40),
                      borderRadius: moderateScale(12),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.9}>
                    <Text
                      style={{
                        ...commonStyles.font_10_SemiBold,
                        color: colors.white,
                        textAlign: 'center',
                      }}>
                      Send Current Location
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={currentLoc.lat === 0 ? true : false}
                    onPress={() => {
                      setShowExpirationModal(true);
                    }}
                    style={{
                      flex: 1,
                      marginHorizontal: moderateScale(1),
                      backgroundColor:
                        currentLoc.lat !== 0
                          ? theme.colors.themecolor2
                          : theme.colors.themeColor,
                      height: moderateScale(40),
                      borderRadius: moderateScale(12),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.9}>
                    <Text
                      style={{
                        ...commonStyles.font_10_SemiBold,
                        color: colors.white,
                        textAlign: 'center',
                      }}>
                      Send Live Location
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      console.log('hghghg', selectedLocation2);

                      if (
                        selectedLocation2?.lat !== 0 &&
                        selectedLocation2?.lng !== 0
                      ) {
                        onSendLocation(
                          selectedLocation2.lat,
                          selectedLocation2.lng,
                        );
                      } else {
                        Alert.alert('', 'Please Select Location');
                      }
                    }}
                    style={{
                      flex: 1,
                      marginHorizontal: moderateScale(1),
                      backgroundColor:
                        selectedLocation.lat !== 0 ||
                        selectedLocation2.lat !== 0
                          ? theme.colors.themecolor2
                          : theme.colors.themeColor,
                      height: moderateScale(40),
                      borderRadius: moderateScale(12),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.9}>
                    <Text
                      style={{
                        ...commonStyles.font_10_SemiBold,
                        color: colors.white,
                        textAlign: 'center',
                      }}>
                      Send Selected Location
                    </Text>
                  </TouchableOpacity>
                </View>

                <Loader isLoading={loading} message="" />
              </View>
            </View>
          </Modal>
        ) : null}

        {/* Expiration Duration Selection Modal */}
        <Modal
          isVisible={showExpirationModal}
          style={{
            justifyContent: 'flex-end',
            margin: 0,
          }}>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderTopLeftRadius: moderateScale(20),
              borderTopRightRadius: moderateScale(20),
              padding: moderateScale(20),
              paddingBottom: moderateScale(30),
            }}>
            <View style={{alignItems: 'center'}}>
              <Text
                style={{
                  ...commonStyles.font_16_SemiBold,
                  color: theme.colors.black,
                  marginBottom: moderateScale(20),
                  textAlign: 'center',
                }}>
                Select Live Location Duration
              </Text>

              <Text
                style={{
                  ...commonStyles.font_14_medium,
                  color: theme.colors.blackOpacity70,
                  marginBottom: moderateScale(25),
                  textAlign: 'center',
                }}>
                Choose how long you want to share your live location
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.themecolor2,
                  paddingVertical: moderateScale(15),
                  paddingHorizontal: moderateScale(30),
                  borderRadius: moderateScale(10),
                  marginBottom: moderateScale(15),
                  width: '100%',
                  alignItems: 'center',
                }}
                onPress={() => handleExpirationSelection(1)}
                activeOpacity={0.8}>
                <Text
                  style={{
                    ...commonStyles.font_16_SemiBold,
                    color: theme.colors.white,
                  }}>
                  1 Hour
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.themecolor2,
                  paddingVertical: moderateScale(15),
                  paddingHorizontal: moderateScale(30),
                  borderRadius: moderateScale(10),
                  marginBottom: moderateScale(20),
                  width: '100%',
                  alignItems: 'center',
                }}
                onPress={() => handleExpirationSelection(5)}
                activeOpacity={0.8}>
                <Text
                  style={{
                    ...commonStyles.font_16_SemiBold,
                    color: theme.colors.white,
                  }}>
                  5 Hours
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.themecolor2,
                  paddingVertical: moderateScale(15),
                  paddingHorizontal: moderateScale(30),
                  borderRadius: moderateScale(10),
                  marginBottom: moderateScale(20),
                  width: '100%',
                  alignItems: 'center',
                }}
                onPress={() => handleExpirationSelection(8)}
                activeOpacity={0.8}>
                <Text
                  style={{
                    ...commonStyles.font_16_SemiBold,
                    color: theme.colors.white,
                  }}>
                  8 Hours
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.lightGray,
                  paddingVertical: moderateScale(12),
                  paddingHorizontal: moderateScale(25),
                  borderRadius: moderateScale(8),
                  width: '100%',
                  alignItems: 'center',
                }}
                onPress={() => setShowExpirationModal(false)}
                activeOpacity={0.8}>
                <Text
                  style={{
                    ...commonStyles.font_14_medium,
                    color: theme.colors.black,
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Previously Sent Photos Modal */}
        <PreviouslySentPhotos
          isVisible={showPreviouslySentPhotos}
          onClose={() => setShowPreviouslySentPhotos(false)}
          onSelectPhoto={photo => {
            if (onResendPhoto) {
              onResendPhoto(photo);
            }
          }}
          onOpenGallery={() => {
            if (roomType === 2) {
              if (publicRoom) {
                showAlert('gallery');
              } else {
                onSendImage();
              }
            } else {
              onSendImage();
            }
          }}
          onOpenCamera={() => {
            if (roomType === 2) {
              if (publicRoom) {
                showAlert('camera');
              } else {
                onSendCameraImage();
              }
            } else {
              onSendCameraImage();
            }
          }}
          messages={messages || []}
          userData={userData}
        />
      </View>
    );
  },
);

interface ChatHeaderComponentProps {
  onBack: () => void;
  profileImage: string;
  name: string;
  distance: number;
  onPressAction: () => void;
  onPressCall: () => void;
  isBlocked?: boolean;
  invitees: string[];
  prevData: any;
  onPressProfile: () => void;
  subscriptionId: any;
  onPressAlertCall: any;
  onPressAlertVideo: any;
  roomType: number;
  memberImg: [];
  navigation: any;
  roomData: any;
  publicRoom: any;
}

export const ChatHeaderComponent: FC<ChatHeaderComponentProps> = React.memo(
  ({
    onBack,
    profileImage,
    name,
    distance,
    onPressAction,
    onPressCall,
    isBlocked = true,
    invitees,
    prevData,
    onPressProfile,
    subscriptionId,
    onPressAlertCall,
    onPressAlertVideo,
    roomType,
    memberImg,
    navigation,
    roomData,
    publicRoom,
  }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const commonStyles = getCommonStyles(theme);
    const userData = useSelector((state: any) => state?.authReducers?.userData || {});
    const insets = useSafeAreaInsets();
    const alertMessageOther = () => {
      Alert.alert(
        'You cannot call this user as their plan does not support this feature',
      );
    };

    const alertMessageVideoOther = () => {
      Alert.alert(
        'You cannot video call this user as their plan does not support this feature',
      );
    };

    const headerBackground = theme.colors.white;
    const zegoCallButtonProps = {
      width: moderateScale(38),
      height: moderateScale(38),
      backgroundColor: 'transparent',
      borderRadius: moderateScale(10),
      borderWidth: 1,
      borderColor: theme.colors.activeTintColor,
      resourceID: 'In-app Chat',
    };

    return (
      <View style={{backgroundColor: headerBackground}}>
        <StatusBar
          backgroundColor={headerBackground}
          barStyle="light-content"
          translucent={Platform.OS === 'android'}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: insets.top + moderateScale(8),
            paddingBottom: moderateScale(10),
            paddingHorizontal: moderateScale(16),
            backgroundColor: headerBackground,
            borderBottomWidth: 0.5,
            borderBottomColor: theme.colors.blackOpacity10,
          }}>
          <TouchableOpacity
            onPress={onBack}
            style={{...styles.boxView}}>
            <Image source={imagesPath.ic_back} style={styles.imgStyle} />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              minWidth: 0,
              paddingHorizontal: moderateScale(8),
            }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onPressProfile}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                minWidth: 0,
              }}>
              {/* <FastImage
              source={{ uri: profileImage }}
              style={{
                width: moderateScale(42),
                height: moderateScale(42),
                borderRadius: moderateScale(100),
                marginRight: moderateScale(6),
              }}
            /> */}

              <CustomImage
                source={
                  profileImage ? {uri: profileImage} : imagesPath.groupImgIcon
                }
                style={{
                  width: moderateScale(42),
                  height: moderateScale(42),
                  borderRadius: moderateScale(100),
                  marginRight: moderateScale(6),
                }}
                imgLoaderStyle={{
                  width: moderateScale(42),
                  height: moderateScale(42),
                  borderRadius: moderateScale(100),
                  marginRight: moderateScale(6),
                }}
              />

              <View style={{flex: 1, minWidth: 0}}>
                {name === '24/7 Live\nChat Room' || name?.includes('24/7 Live') ? (
                  <Text
                    style={{
                      ...commonStyles.font_16_SemiBold,
                      color: theme.colors.florsentTheme,
                    }}
                    numberOfLines={2}>
                    <Text style={{color: theme.colors.yellow}}>24/7</Text>
                    {' Live Chat Room'}
                  </Text>
                ) : (
                  <Text
                    style={{
                      ...commonStyles.font_16_SemiBold,
                      textTransform: 'capitalize',
                      color: theme.colors.florsentTheme,
                    }}
                    numberOfLines={2}>
                    {name}
                  </Text>
                )}
                {distance ?
                 <Text
                  style={{
                    ...commonStyles.font_12_medium,
                    textTransform: 'capitalize',
                    color: theme.colors.filterTxt,
                  }}
                  numberOfLines={1}>
                  { (distance * 0.621371).toFixed(2) ?? 0} miles
                </Text>
                : null}
              </View>
            </TouchableOpacity>
          </View>
          {roomType != 2 ? (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {userData?.subscription?.subscription_id === 2 ? (
                <View style={{flexDirection: 'row'}}>
                  {subscriptionId === 1 ? (
                    // <TouchableOpacity
                    //   onPress={alertMessageOther}
                    //   style={{
                    //     backgroundColor: colors.blackOpacity0,
                    //     height: moderateScale(40),
                    //     width: moderateScale(40),
                    //     borderRadius: moderateScale(40 / 2),
                    //     justifyContent: 'center',
                    //     alignItems: 'center',
                    //   }}>
                    //   <Image source={imagesPath.contact} />
                    // </TouchableOpacity>
                    <ZegoSendCallInvitationButton
                      invitees={[
                        {
                          userID: String(prevData?.id),
                          userName: prevData?.full_name || 'User',
                        },
                      ]}
                      isVideoCall={false}
                      icon={imagesPath.contact}
                      {...zegoCallButtonProps}
                    />
                  ) : subscriptionId === 2 ? (
                    !isBlocked ? (
                      <ZegoSendCallInvitationButton
                        invitees={[
                          {
                            userID: String(prevData?.id),
                            userName: prevData?.full_name || 'User',
                          },
                        ]}
                        isVideoCall={false}
                        icon={imagesPath.contact}
                        {...zegoCallButtonProps}
                      />
                    ) : (
                      <ZegoSendCallInvitationButton
                        invitees={[
                          {
                            userID: String(prevData?.id),
                            userName: prevData?.full_name || 'User',
                          },
                        ]}
                        isVideoCall={false}
                        icon={imagesPath.contact}
                        {...zegoCallButtonProps}
                      />
                    )
                  ) : (
                    <ZegoSendCallInvitationButton
                      invitees={[
                        {
                          userID: String(prevData?.id),
                          userName: prevData?.full_name || 'User',
                        },
                      ]}
                      isVideoCall={false}
                      icon={imagesPath.contact}
                      {...zegoCallButtonProps}
                    />
                    // <TouchableOpacity
                    //   onPress={alertMessageOther}
                    //   style={{
                    //     backgroundColor: colors.blackOpacity0,
                    //     height: moderateScale(40),
                    //     width: moderateScale(40),
                    //     borderRadius: moderateScale(40 / 2),
                    //     justifyContent: 'center',
                    //     alignItems: 'center',
                    //   }}>
                    //   <Image source={imagesPath.contact} />
                    // </TouchableOpacity>
                  )}
                  <View style={{width: moderateScale(6)}} />
                  {subscriptionId === 1 ? (
                    // <TouchableOpacity
                    //   onPress={alertMessageVideoOther}
                    //   style={{
                    //     backgroundColor: colors.blackOpacity0,
                    //     height: moderateScale(40),
                    //     width: moderateScale(40),
                    //     borderRadius: moderateScale(40 / 2),
                    //     justifyContent: 'center',
                    //     alignItems: 'center',
                    //   }}>
                    //   <Image source={imagesPath.ic_video_call_black} />
                    // </TouchableOpacity>
                    <ZegoSendCallInvitationButton
                      invitees={[
                        {
                          userID: String(prevData?.id),
                          userName: prevData?.full_name || 'User',
                        },
                      ]}
                      isVideoCall={true}
                      icon={imagesPath.ic_video_call}
                      {...zegoCallButtonProps}
                    />
                  ) : subscriptionId === 2 ? (
                    !isBlocked ? (
                      <ZegoSendCallInvitationButton
                        invitees={[
                          {
                            userID: String(prevData?.id),
                            userName: prevData?.full_name || 'User',
                          },
                        ]}
                        isVideoCall={true}
                        icon={imagesPath.ic_video_call}
                        {...zegoCallButtonProps}
                      />
                    ) : (
                      <ZegoSendCallInvitationButton
                        invitees={[
                          {
                            userID: String(prevData?.id),
                            userName: prevData?.full_name || 'User',
                          },
                        ]}
                        isVideoCall={true}
                        icon={imagesPath.ic_video_call}
                        {...zegoCallButtonProps}
                      />
                    )
                  ) : (
                    <ZegoSendCallInvitationButton
                      invitees={[
                        {
                          userID: String(prevData?.id),
                          userName: prevData?.full_name || 'User',
                        },
                      ]}
                      isVideoCall={true}
                      icon={imagesPath.ic_video_call}
                      {...zegoCallButtonProps}
                    />
                  )}
                </View>
              ) : userData?.subscription?.subscription_id === 1 ? (
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={onPressAlertCall}
                    style={styles.boxView}
                    >
                    <Image source={imagesPath.contact} style={styles.imgStyle} />
                  </TouchableOpacity>

                  <View style={{width: moderateScale(6)}} />
                  <TouchableOpacity
                    onPress={onPressAlertVideo}
                    style={styles.boxView}>
                    <Image source={imagesPath.ic_video_call} style={styles.videoIcon} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={onPressAlertCall}
                    style={styles.boxView}>
                    <Image source={imagesPath.contact} style={styles.imgStyle}  />
                  </TouchableOpacity>

                  <View style={{width: moderateScale(6)}} />
                  <TouchableOpacity
                    onPress={onPressAlertVideo}
                    style={styles.boxView}>
                    <Image source={imagesPath.ic_video_call} style={styles.videoIcon} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={{marginLeft: moderateScale(6),...styles.boxView,}}
                onPress={onPressAction}
                hitSlop={hitSlopProp}
                activeOpacity={0.9}>
                <Image source={imagesPath.ic_threeDots} style={styles.imgStyle}/>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(navigationString.View_Member_Group, {
                  roomMemberData: {
                    ...roomData,
                    members: roomData?.members || memberImg || [],
                  },
                })
              }
              style={styles.groupMembersPill}
              activeOpacity={0.85}>
              {memberImg?.slice(0, 3).map((item, index) => (
                <FastImage
                  key={String(item?.user?.id || index)}
                  source={
                    item?.user?.profile_image
                      ? {uri: item?.user?.profile_image}
                      : imagesPath.profileimage
                  }
                  style={[
                    styles.groupMemberAvatar,
                    index > 0 && {marginLeft: moderateScale(-8)},
                  ]}
                />
              ))}
              {memberImg?.length > 3 ? (
                <Text style={styles.groupMemberCount}>
                  +{memberImg?.length - 3}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  },
);

const getStyles = (theme: any) => {
  const commonStyles = getCommonStyles(theme);
  return (
    StyleSheet.create({
      senderStyle: {
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
        width: width / 1.25,
        marginBottom: moderateScale(2),
        paddingRight: moderateScale(16),
      },
      receiverStyle: {
        alignItems: 'flex-start',
        alignSelf: 'flex-start',
        width: width / 1.25,
        marginBottom: moderateScale(2),
        paddingLeft: moderateScale(16),
      },
      textView: {
        borderRadius: moderateScale(16),
        borderBottomLeftRadius: 0,
        padding: moderateScale(8),
        marginBottom: moderateScale(0),
      },
      voiceMessageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: moderateScale(140),
        paddingVertical: moderateScale(2),
      },
      voicePlayButton: {
        height: moderateScale(32),
        width: moderateScale(32),
        borderRadius: moderateScale(16),
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(10),
      },
      voicePlayIcon: {
        height: moderateScale(14),
        width: moderateScale(14),
      },
      voiceMessageLabel: {
        ...commonStyles.font_12_SemiBold,
        flex: 1,
      },
      swipeWrapper: {
        position: 'relative',
        justifyContent: 'center',
        // Expand swipe gesture hit area for short messages without changing bubble visuals.
        paddingHorizontal: moderateScale(14),
        marginHorizontal: moderateScale(-14),
      },
      replySwipeIconContainer: {
        position: 'absolute',
        left: moderateScale(10),
        zIndex: 1,
      },
      replySwipeIcon: {
        width: moderateScale(18),
        height: moderateScale(18),
        tintColor: theme.colors.activeTintColor,
      },
      replyMessageContainer: {
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.activeTintColor,
        paddingLeft: moderateScale(8),
        marginBottom: moderateScale(6),
        width: '100%',
      },
      replyMessageLabel: {
        ...commonStyles.font_10_SemiBold,
      },
      replyMessageText: {
        ...commonStyles.font_12_regular,
        marginTop: moderateScale(2),
      },
      timeText: {
        ...commonStyles.font_8_medium,
        color: theme.colors.blackOpacity70,
        marginLeft: moderateScale(30),
      },
      memberText: {
        ...commonStyles.font_12_bold,
        color: theme.colors.florsentTheme,
      },
      groupMembersPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.lightGray,
        borderRadius: moderateScale(20),
        paddingHorizontal: moderateScale(6),
        paddingVertical: moderateScale(4),
        borderWidth: 1,
        borderColor: theme.colors.blackOpacity20,
        maxWidth: moderateScale(110),
      },
      groupMemberAvatar: {
        height: moderateScale(28),
        width: moderateScale(28),
        borderRadius: moderateScale(14),
        borderWidth: 2,
        borderColor: theme.colors.primaryWhite,
      },
      groupMemberCount: {
        ...commonStyles.font_12_SemiBold,
        color: theme.colors.florsentTheme,
        marginLeft: moderateScale(4),
      },

      centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalView: {
        margin: 20,
        backgroundColor: theme.colors.white,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: theme.colors.black,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
      modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: theme.colors.black
      },
      deleteButton: {
        backgroundColor: theme.colors.red,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
      },
      cancelButton: {
        backgroundColor: theme.colors.darkBlack,
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
      },
      buttonText: {
        color: theme.colors.white,
      },
      alertStyle: {
        backgroundColor: theme.colors.black,
        height: moderateScale(40),
        width: moderateScale(40),
        borderRadius: moderateScale(40 / 2),
        justifyContent: 'center',
        alignItems: 'center',
      },
      txtStyle:{
        ...commonStyles.font_10_regular,
        color: theme.colors.activeTintColor,
        textDecorationLine:'underline',
        textAlign:'center'
      },
      boxView: {
        borderColor: theme.colors.activeTintColor,
        height: moderateScale(38),
        width: moderateScale(38),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
      },
      imgStyle:{
        height: moderateScale(16),
        width: moderateScale(16),
        tintColor: theme.colors.activeTintColor
      },
      videoIcon:{
        height: moderateScale(22),
        width: moderateScale(22),
        tintColor: theme.colors.activeTintColor,
        resizeMode:'contain'
      },
      chatOptionStyle:{
        justifyContent: 'center',
        alignItems: 'center',
        height: moderateScale(38),
        width: moderateScale(38),
        borderRadius: moderateScale(19),
      },
      inputToolbarWrapper: {
        width: '100%',
        paddingHorizontal: moderateScale(12),
        paddingTop: 0,
      },
      inputBarContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        width: '100%',
        backgroundColor: theme.colors.lightGray,
        borderRadius: moderateScale(28),
        minHeight: moderateScale(52),
        paddingLeft: moderateScale(6),
        paddingRight: moderateScale(6),
        paddingVertical: moderateScale(4),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.blackOpacity20,
        shadowColor: theme.colors.black,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      },
      textInputWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: moderateScale(4),
      },
      messageInput: {
        paddingVertical: moderateScale(10),
        width: '100%',
        fontSize: moderateScale(16),
        color: theme.colors.black,
        textAlignVertical: 'center',
        lineHeight: moderateScale(22),
      },
      attachIconCircle: {
        height: moderateScale(32),
        width: moderateScale(32),
        borderRadius: moderateScale(16),
        justifyContent: 'center',
        alignItems: 'center',
      },
      attachPlusText: {
        fontSize: moderateScale(28),
        lineHeight: moderateScale(30),
        color: theme.colors.florsentTheme,
        fontWeight: '400',
        includeFontPadding: false,
        textAlign: 'center',
        marginTop: Platform.OS === 'ios' ? -2 : -4,
      },
      attachBtnActive: {
        backgroundColor: theme.colors.florsentTheme + '22',
      },
      sendBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        height: moderateScale(38),
        width: moderateScale(38),
        borderRadius: moderateScale(19),
        backgroundColor: theme.colors.florsentTheme,
      },
      sendBtnIcon: {
        height: moderateScale(18),
        width: moderateScale(18),
        tintColor: theme.colors.primaryWhite,
      },
      attachmentGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.lightGray,
        borderRadius: moderateScale(16),
        paddingVertical: moderateScale(14),
        paddingHorizontal: moderateScale(8),
        marginBottom: moderateScale(10),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.blackOpacity20,
        shadowColor: theme.colors.black,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      },
      attachmentIconCircle: {
        height: moderateScale(52),
        width: moderateScale(52),
        borderRadius: moderateScale(26),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: moderateScale(6),
      },
      attachmentIconImage: {
        height: moderateScale(24),
        width: moderateScale(24),
        tintColor: theme.colors.activeTintColor,
        resizeMode: 'contain',
      },
      attachmentLabel: {
        ...commonStyles.font_10_regular,
        color: theme.colors.blackOpacity70,
        textAlign: 'center',
      },
      liveLocationBanner: {
        borderColor: theme.colors.themecolor2,
        borderWidth: 1,
        flex: 1,
        borderRadius: moderateScale(20),
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: theme.colors.themecolor2 + '10',
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(12),
        marginHorizontal: moderateScale(4),
      },
      liveLocationText: {
        ...commonStyles.font_12_SemiBold,
        color: theme.colors.florsentTheme,
      },
      recordingCancelBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        height: moderateScale(38),
        width: moderateScale(38),
        borderRadius: moderateScale(19),
      },
      recordingCancelIcon: {
        height: moderateScale(16),
        width: moderateScale(16),
        tintColor: theme.colors.red_09,
      },
      chatActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      recordingPanel: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.red_09 + '12',
        borderRadius: moderateScale(20),
        paddingVertical: moderateScale(10),
        paddingHorizontal: moderateScale(12),
        marginHorizontal: moderateScale(4),
      },
      recordingDotOuter: {
        height: moderateScale(14),
        width: moderateScale(14),
        borderRadius: moderateScale(7),
        backgroundColor: theme.colors.red_09 + '30',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(8),
      },
      recordingDotInner: {
        height: moderateScale(8),
        width: moderateScale(8),
        borderRadius: moderateScale(4),
        backgroundColor: theme.colors.red_09,
      },
      recordingTimer: {
        ...commonStyles.font_14_SemiBold,
        color: theme.colors.black,
        minWidth: moderateScale(36),
        marginRight: moderateScale(8),
      },
      recordingHint: {
        ...commonStyles.font_12_regular,
        color: theme.colors.blackOpacity70,
        flex: 1,
      },
      recordingMicActive: {
        backgroundColor: theme.colors.red_09,
        transform: [{scale: 1.1}],
      },
      recordingMicIconActive: {
        tintColor: theme.colors.primaryWhite,
      },
      chatOptionIconStyle: {
        height: moderateScale(20),
        width: moderateScale(20),
        tintColor: theme.colors.florsentTheme,
      },
      attachmentOptionStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(4),
        paddingVertical: moderateScale(2),
        minWidth: moderateScale(68),
      },
    })

  );
}
