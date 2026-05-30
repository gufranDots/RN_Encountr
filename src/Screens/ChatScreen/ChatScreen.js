import notifee from '@notifee/react-native';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  ActivityIndicator,
  BackHandler,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
import {GiftedChat} from 'react-native-gifted-chat';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import {enableFreeze} from 'react-native-screens';
import {useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import ButtonComp from '../../Components/ButtonComp';
import ChatBubble, {ChatHeaderComponent} from '../../Components/ChatComponents';
import ChatInputToolBar from '../../Components/ChatInputToolBar';
import GalleryImageModal from '../../Components/GalleryImageModal';
import {Loader} from '../../Components/Loader';
import TextInputComp from '../../Components/TextInputComp';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import {
  addRemoveFavorateChat,
  blockUserApi,
  getAllChatMessagesApi,
  getChatCount,
  getLikedChatUserListApi,
  muteUnmuteNotificationApi,
  reportUserApi,
  saveChatCounter,
  unblockUserApi,
  uploadAudioFile,
} from '../../redux/reduxActions/chatActions';
import {
  deleteChatMessage,
  grantPrivateGallery,
  likeDislikeUserApi,
  removePrivateGallery,
} from '../../redux/reduxActions/homeActions';
import {
  height,
  moderateScale,
  scale,
  verticalScale,
} from '../../styles/responsiveSize';
import {
  ApiError,
  ApplyEaseOutAnimation,
  selectSingleImageFromCamera,
  selectSingleImageFromGallery,
  showError,
  showSuccess,
} from '../../utils/helperFunctions';
import {AskVoicePermission, checkLocationSevice} from '../../utils/miscellaneous';
import {
  ConnectingSocket,
  removeItem,
  setItem,
  socketRef,
} from '../../utils/utils';
import {stableKeyExtractor} from '../../utils/stableKeyExtractor';
import FastImage from '../../utils/FastImageCompat';
import ItsAMatchModal from '../../Components/ItsAMatchModal';
import {configureZegoCloud} from '../../utils/zegoConfigureFile';
import SoundPlayer from 'react-native-sound-player';
import CustomImage from '../../Components/CustomImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles';
import { useTheme } from '../../theme/ThemeProvider';
import { ImageEnum } from '../../constants';
import { DeleteMsg } from '../../constants/Enum';

enableFreeze();
const DEFAULT_MODAL_HEIGHT = height / 3.4;
const HEIGHT_WITH_TEXT_INPUT = Platform.OS === 'ios' ? height / 1.1 : height / 1.9;
const audioRecorderPlayer = new AudioRecorderPlayer();

const ChatScreen = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles)
  const {navigation, route} = props;
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const [isLoading, setLoading] = useState(true);
  const [prevData, setPrevData] = useState(
    route?.params?.prevData?.id ? route?.params?.prevData : null,
  );
  const [publicRoom, setPublicRoom] = useState(!!route?.params?.public);
  const [showPrivateGallery, setShowPrivateGallery] = useState(prevData?.has_private_gallery_access);
  const [favTab, setFavTab] = useState(!!route?.params?.favorite);
  const [muteUser, setMuteUser] = useState(userData?.id == route?.params?.data?.notify_muted_by);
  const [roomDataID, setRoomDataID] = useState(route?.params?.data);
  const [roomData, setRoomData] = useState(route?.params?.data);
  const [memberImgData, setMemberImgData] = useState(route?.params?.MemberImg);
  const [pageNo, setPageNo] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [actionModal, showActionModal] = useState(false);
  const [isReporting, setReporting] = useState(false);
  const [reportingText, setReportText] = useState('');
  const [oneTimeView, setOneTimeView] = useState(false);
  const [showGroupImage, setShowGroupImage] = useState(false);
  const [data, setData] = useState([]);
  const [distance, setDistance] = useState(null)
  const [itsMatchModal, setItsMatchModal] = useState({
    isVisible: false,
    userPic: null,
    data: {},
  });
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [invitees, setInvitees] = useState([String(prevData?.id)]);
  const [pressedIndexParent, setPressedIndexParent] = useState(null);
  const [selectedImageToShow, setSelectedImageToShow] = useState({
    isVisible: false,
    image: null,
  });
  const [showLikedByList, setShowLikedByList] = useState({
    visible: false,
    list: '',
  });
  const [currentLoc, setcurrentLoc] = useState({lat: 0, lng: 0});
  const [mapRegion, setMapRegion] = useState({
    latitude: 25.7617,
    longitude: 80.1918,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });
  const [likedUsers, setLikedUsers] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const chatListRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const message = [
    'Hey :)',
    'Hello',
    'How are you',
    'Who are you',
    'Good Morning',
    'Good Night',
  ];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    if (showGroupImage) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [showGroupImage, scaleAnim]);

  const playNotificationSound = async () => {
    try {
      // Ensure the sound is loaded before trying to play it
      SoundPlayer.loadSoundFile('zego_incoming', 'mp3');
      SoundPlayer.playSoundFile('zego_incoming', 'mp3');
      SoundPlayer.onFinishedPlaying(success => {
        if (success) {
          console.log('Sound played successfully');
        } else {
          console.log('Failed to play the sound');
        }
      });
    } catch (error) {
      console.log('Failed to load or play the sound', error);
    }
  };

  useEffect(() => {
    console.log('Starting location service...');
    checkLocationSevice()
      .then(coords => {
        console.log('Location service success:', coords);
        if (coords && coords.latitude && coords.longitude) {
          setcurrentLoc({lat: coords.latitude, lng: coords.longitude});
          setMapRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
          console.log('Location set successfully:', {
            lat: coords.latitude,
            lng: coords.longitude,
          });
        }
      })
      .catch(error => {
        console.error('Location service failed:', error);
        Geolocation.getCurrentPosition(
          position => {
            console.log('Fallback geolocation success:', position);
            const {latitude, longitude} = position.coords;
            setcurrentLoc({lat: latitude, lng: longitude});
            setMapRegion({
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            });
          },
          fallbackError => {
            console.error('Fallback geolocation failed:', fallbackError);
          },
          {enableHighAccuracy: false, timeout: 10000, maximumAge: 300000},
        );
      });

    AskVoicePermission();
    _connectSocket();
    configureZegoCloud({
      id: String(userData?.id),
      user_name: userData?.user_name || 'Encountr',
    });
  }, []);

  useEffect(() => {
    const nextPrevData = route?.params?.prevData?.id ? route?.params?.prevData : null;
    const nextRoomData = route?.params?.data || null;

    setPrevData(nextPrevData);
    setRoomDataID(nextRoomData);
    setRoomData(nextRoomData);
    setMemberImgData(route?.params?.MemberImg);
    setPublicRoom(!!route?.params?.public);
    setFavTab(!!route?.params?.favorite);
    setMuteUser(userData?.id == nextRoomData?.notify_muted_by);
    setShowPrivateGallery(nextPrevData?.has_private_gallery_access);
    setInvitees(nextPrevData?.id ? [String(nextPrevData?.id)] : []);
    setMessages([]);
    setReplyMessage(null);
    setHasMoreData(true);
    setPageNo(1);
    setIsTyping(false);
  }, [
    route?.params?.data?.id,
    route?.params?.prevData?.id,
    route?.params?.public,
    route?.params?.favorite,
    route?.params?.MemberImg,
    userData?.id,
  ]);

  const updateLikedBy = (
    messageId,
    receiverId,
    roomType,
    userId,
    newLikedByValue,
  ) => {
    setMessages(prevMessages =>
      prevMessages.map(message => {
        if (message.id === messageId) {
          return {...message, liked_by: newLikedByValue};
        }
        return message;
      }),
    );

    // const messageIndex = messages.findIndex(
    //   message =>
    //     message.id === messageId &&
    //     message.receiver_id === receiverId &&
    //     message.sender_id === userId,
    // );


    // // If the message is found, update only that message
    // if (messageIndex !== -1) {
    //   // setMessages(previousMessages =>
    //   //   GiftedChat.append(previousMessages,  {...message, liked_by: newLikedByValue}),
    //   // );

    // }
  };

  // liked on
  useEffect(() => {
    socketRef.on('likeMessage', item => {
      let liked_by = item?.likey_by ? item?.likey_by?.join(',') : '';
      updateLikedBy(
        item?.message_id,
        item?.receiver_id,
        item?.room_type,
        item?.user_id,
        liked_by,
      );
    });
    return () => {
      socketRef.removeListener('likeMessage');
    };
  }, [socketRef]);

  const onSetLikedUsers = async likedby => {
    try {
      let response = await getLikedChatUserListApi({
        user_ids: likedby?.split(','),
      });
      if (response?.success) {
        setLikedUsers(response?.data?.data);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    if (currentLoc?.lat !== 0 && currentLoc?.lng !== 0) {
      _getAllChatMessages();
    }
    if (prevData?.id) {
      _connectSocket();
    }
  }, [pageNo, prevData, data, currentLoc?.lat, currentLoc?.lng]);
  const chatCounter = () => {
    getChatCount()
      .then(res => {
        saveChatCounter(res?.data);
      })
      .catch(error => {
        console.log(error, 'CHAT_ID error');
      });
  };
  useEffect(() => {
    if (!actionModal) {
      setReporting(false);
    }
  }, [actionModal]);

  useEffect(() => {
    if (prevData?.id) {
      (async () => {
        await setItem('CHAT_ID', prevData?.id).then(res => {
        });
      })();
    }
    return async () => {
      await removeItem('CHAT_ID');
    };
  }, [prevData]);

  const onMessageRead = useCallback(
    response => {
      const messageId = response?.data?.id;

      setMessages(previousMessages => {
        return previousMessages.map(message => {
          if (message._id === messageId) {
            return {...message, read_at: new Date()};
          }
          return message;
        });
      });
    },
    [messages],
  );

  useEffect(() => {
    socketRef.on('message-read', onMessageRead);

    return () => {
      // Cleanup function
      socketRef.off('message-read', onMessageRead);
    };
  }, [onMessageRead]);

  const _connectSocket = () => {
    ConnectingSocket(userData);

    socketRef.on('connect', () => {
      console.log('===== socket connected =====');
    });
    socketRef.on('sendMessage', response => {
      socketRef.emit(
        'message-read',
        {
          id: response.id,
          user_id: prevData?.id,
          group_id: roomData?.id,
          room_type: 1,
        },
        (response, err) => {
          console.log('USEError', err);
        },
      );
      if (roomData?.room_type == 2) {
        _updateReceivedMessage(response);
        return;
      }
      if (prevData?.id !== response?.sender_id) {
        return;
      }
      _updateReceivedMessage(response);
      notifee.setBadgeCount(0).then(() => console.log('Badge count removed!'));
    });
    socketRef.on('disconnect', () => {
      ConnectingSocket(userData);
      console.log('socket disconnected');
    });
    socketRef.on('connect_error', err => {
      console.log('socket connection error: ', (err));
    });
    socketRef.on('error', err => {
      console.log('socket error: ', JSON.stringify(err));
    });
    socketRef.on('connection', () => {
      console.log('response from server');
    });

    socketRef.on('block-status', (response, err) => {
      setPrevData(prevData => ({
        ...prevData,
        you_are_blocked: prevData?.you_are_blocked === 0 ? 1 : 0,
      }));
      console.log(
        err,
        'SOCKET BLOCK RESPONSE sendMessage 1111111',
        response?.is_blocked,
      );
    });
  };

  const normalizeReplyMeta = item => {
    const replyObj =
      item?.reply ||
      item?.reply_to ||
      item?.replied_message ||
      item?.quoted_message ||
      item?.parent_message ||
      null;

    const reply_to_id =
      item?.reply_to_id ||
      item?.reply_message_id ||
      item?.reply_id ||
      item?.parent_message_id ||
      replyObj?.id ||
      null;

    const reply_message =
      item?.reply_message ||
      item?.reply_to_message ||
      item?.quoted_text ||
      item?.reply_text ||
      replyObj?.message ||
      '';

    const reply_type =
      item?.reply_type ||
      item?.quoted_type ||
      item?.reply_message_type ||
      replyObj?.type ||
      null;

    const reply_sender_id =
      item?.reply_sender_id ||
      item?.quoted_sender_id ||
      replyObj?.sender_id ||
      null;

    const reply_sender_name =
      item?.reply_sender_name ||
      item?.quoted_sender_name ||
      replyObj?.senders?.first_name ||
      replyObj?.users?.first_name ||
      replyObj?.user?.name ||
      null;

    return {
      reply_to_id,
      reply_message,
      reply_type,
      reply_sender_id,
      reply_sender_name,
    };
  };

  const _updateReceivedMessage = item => {
    const replyMeta = normalizeReplyMeta(item);
    const socketMessage = {
      ...item,
      ...replyMeta,
      _id: item?.id,
      text: item?.message,
      createdAt: item?.created_at,
      user: {
        _id: userData?.id,
        name:
          userData?.id === item?.sender_id
            ? userData?.first_name
            : prevData?.first_name,
        avatar:
          userData?.id === item?.sender_id
            ? userData?.profile_image
            : prevData?.profile_image,
      },
      loading: false,
    };
    setMessages(previousMessages =>{
      const x = GiftedChat.append(previousMessages, socketMessage)
      console.log('=-=-09-09-09-09-09-09-09-090-9-0-00900-0909090-0',x)
      return x
    });
  };
  useEffect(() => {
    // console.log('=-=-=-=-=-=-=-=-=-=messages =-=-=-=-=-==-=-=-=-=-=-==-==--',messages)
  }, [messages])
  const _getAllChatMessages = () => {
    if (currentLoc?.lat === 0 || currentLoc?.lng === 0) {
      return;
    }

    const apiData = {
      id: prevData?.id ? prevData?.id : userData?.id,
      room_type: roomData?.room_type ? roomData?.room_type : 1,
      page: pageNo,
      group_id: roomData?.id,
      lat: currentLoc?.lat || '',
      long: currentLoc?.lng || '',
    };
    getAllChatMessagesApi(apiData)
      .then(res => {
        setDistance(res.data?.user?.distance ?? null)
                const allMessages = res.data.messages.data.map((item, indexedDB) => {
          // console.log('Raw API message item:', JSON.stringify(item, null, 2));
          
          const replyMeta = normalizeReplyMeta(item);
          const obj = {
            ...item,
            ...replyMeta,
            _id: item?.id,
            text: item?.message,
            createdAt: item?.created_at,
            liked_by: item?.liked_by,
            user: {
              _id: item?.id,
              name:
                userData?.id === item?.sender_id
                  ? userData?.first_name
                  : prevData?.first_name,
              avatar:
                userData?.id === item?.sender_id
                  ? userData?.profile_image
                  : prevData?.profile_image,
            },
            loading: false,
          };
          return obj;
        });
        // console.log('=-=-=-=-=-=-=-=-=-=allMessages =-=-=-=-=-==-=-=-=-=-=-==-==--',allMessages)
        if (pageNo === 1) {
          setMessages(allMessages);
        } else {
          setMessages(state => GiftedChat.prepend(state, allMessages));
        }

        if (res?.data?.messages?.next_page_url != null) {
          setHasMoreData(true);
        } else {
          setHasMoreData(false);
        }
        setLoading(false);
        setIsLoadingEarlier(false);
        chatCounter();
      })
      .catch(error => {
        setHasMoreData(false);
        setLoading(false);
        setIsLoadingEarlier(false);
        showError(ApiError(error));
      });
  };

  const onSend = useCallback(
    (message = [], type, oldMsgs = []) => {
      let socketMessage = {};
      const activeReply = replyMessage;
      const replyPayload = activeReply
        ? {
            reply_to_id: activeReply?.id,
            reply_message: activeReply?.message,
            reply_type: activeReply?.type || 'text',
            reply_sender_id: activeReply?.sender_id,
            reply_sender_name: activeReply?.sender_name,
          }
        : {};
      // Only emit typing events for Plus subscription users
      if (userData?.subscription?.subscription_name != "Free") {
        socketRef.emit('typing', {
          user_id: userData?.id,
          receiver_id: roomData?.room_type == '2' ? userData?.id : prevData.id,
          is_typing: false,
          room_type: roomData?.room_type == '2' ? 2 : 1,
          group_id: roomData?.id,
        });
      }

      const msg = message[0]?.text;
      if (type === 'text') {
        if (msg.trim() === '') return;
        socketMessage = {
          sender_id: userData?.id,
          user_id: roomData?.room_type != 2 ? prevData?.id : userData?.id,
          receiver_id: roomData?.room_type != 2 ? prevData?.id : null,
          room_type: roomData?.room_type ? roomData?.room_type : 1,
          group_id: roomData?.id ? roomData?.id : null,
          _id: userData?.id,
          text: msg,
          is_see_once: oneTimeView ? 1 : 0,
          message: msg,
          type: type || 'text',
          createdAt: String(new Date()),
          ...replyPayload,
          user: {
            _id: userData?.id,
            name: userData?.first_name,
            avatar: userData?.profile_image,
          },
        };
      } else {
        socketMessage = {
          ...message[0],
          ...replyPayload,
        };
      }

      const oldMessages = messages.map(item => item);

      socketRef.emit('sendMessage', socketMessage, (response, err) => {
        if (response) {
          try {
            if (Platform.OS === 'ios') {
              SoundPlayer.playAsset(
                require('../../assets/audios/zego_incoming.mp3'),
              );
              SoundPlayer.stop();
            } else {
              playNotificationSound();
            }
          } catch (error) {
            console.log('sound error', error);
          }
        }

        const sentMsgRes = response?.data;
        if (response.status === 'error') {
          showError(response?.message || 'Error');
          setMessages(oldMessages);
          return;
        }
        let newMsg = {
          ...sentMsgRes,
          _id: sentMsgRes?.id,
          text: sentMsgRes?.message,
          createdAt: sentMsgRes?.created_at,
          reply_to_id: sentMsgRes?.reply_to_id ?? activeReply?.id,
          reply_message: sentMsgRes?.reply_message ?? activeReply?.message,
          reply_type: sentMsgRes?.reply_type ?? activeReply?.type,
          reply_sender_id:
            sentMsgRes?.reply_sender_id ?? activeReply?.sender_id,
          reply_sender_name:
            sentMsgRes?.reply_sender_name ?? activeReply?.sender_name,
          user: {
            _id: sentMsgRes?.id,
            name:
              userData?.id === sentMsgRes?.sender_id
                ? userData?.first_name
                : prevData?.first_name,
            avatar:
              userData?.id === sentMsgRes?.sender_id
                ? userData?.profile_image
                : prevData?.profile_image,
          },
          loading: false,
        };

        if (type === 'image') {
          newMsg = {
            ...newMsg,
            message: newMsg?.message,
            text: newMsg?.text,
          };
        }

        if (type === 'voice_message' || type === 'image') {
          setMessages(previousMessages => GiftedChat.append(oldMsgs, newMsg));
        } else {
          setMessages(previousMessages =>
            GiftedChat.append(previousMessages, newMsg),
          );
        }
        setReplyMessage(null);
      });
    },
    [prevData, messages, replyMessage],
  );
  
  const likeSubmit = (id, newLikedByValue) => {
    setMessages(prevMessages =>
      prevMessages.map(message => {
        if (message.id === id) {
          return {...message, liked_by: newLikedByValue};
        }
        return message;
      }),
    );
  };

  const onPressAlertCall = () => {
    Alert.alert(
      strings.appName,
      'You cannot call this user as your plan does not support this feature. Do you want to subscribe now?',
      [
        {
          text: 'Yes',
          onPress: () =>
            navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
              isBack: true,
              from: 'ChatScreen',
            }),
        },
        {
          text: 'No',
          style: 'destructive',
        },
      ],
    );
  };

  const onPressAlertVideo = () => {
    Alert.alert(
      strings.appName,
      'You cannot video call this user as your plan does not support this feature. Do you want to subscribe now?',
      [
        {
          text: 'Yes',
          onPress: () =>
            navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
              isBack: true,
              from: 'ChatScreen',
            }),
        },
        {
          text: 'No',
          style: 'destructive',
        },
      ],
    );
  };
  const chatHeader = () => {
    return (
      <ChatHeaderComponent
        roomData={roomData}
        navigation={navigation}
        memberImg={memberImgData}
        prevData={roomData?.room_type == 2 ? roomData : prevData}
        roomType={roomData?.room_type}
        onBack={() => {
          // Only emit typing events for Plus subscription users
          if (userData?.subscription?.subscription_id === 3) {
            socketRef.emit('typing', {
              user_id: userData?.id,
              receiver_id:
                roomData?.room_type == 2 ? userData?.id : prevData.id,
              is_typing: false,
              room_type: roomData?.room_type == 2 ? 2 : 1,
              group_id: roomData?.id,
            });
          }
          setIsTyping(false);
          startTypeing(0);
          navigation.goBack();
        }}
        profileImage={
          roomData?.room_type == 2
            ? roomData?.group_image
            : prevData?.profile_image_thumb || prevData?.profile_image
        }
        isBlocked={prevData?.is_blocked || prevData?.you_are_blocked}
        name={
          roomData?.room_type == 2 ? roomData?.group_name : prevData?.first_name
        }
        distance={ roomData?.room_type == 2 ? null : distance}
        subscriptionId={prevData?.subscription?.subscription_id}
        onPressAction={() => setTimeout(() => showActionModal(true), 600)}
        invitees={invitees}
        onPressAlertCall={onPressAlertCall}
        onPressAlertVideo={onPressAlertVideo}
        onPressProfile={() => {
          if (roomData?.room_type != 2) {
            prevData?.is_matched
              ? navigation.navigate(navigationString.VIEWPROFILE, {
                  prevScreenData: prevData,
                  from: '_MY_MATCHES',
                })
              : navigation.navigate(navigationString.VIEWPROFILE, {
                  prevScreenData: prevData,
                  // from: '_MY_MATCHES',
                });
          } else {
            // alert("huhu")
            setShowGroupImage(true);
          }
        }}
      />
    );
  };

  const scrollToRepliedMessage = useCallback(
    replyToId => {
      if (!replyToId) {
        return;
      }

      const targetIndex = messages.findIndex(
        item =>
          String(item?.id) === String(replyToId) ||
          String(item?._id) === String(replyToId),
      );

      if (targetIndex < 0) {
        showError('Original message is not loaded yet');
        return;
      }

      try {
        chatListRef?.current?.scrollToIndex?.({
          index: targetIndex,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (error) {
      }

      setHighlightedMessageId(replyToId);
      setTimeout(() => setHighlightedMessageId(null), 1300);
    },
    [messages],
  );

  const onMessageDeleteSuccess = useCallback(
    (deleteId, type) => {
      const cloneArray = JSON.parse(JSON.stringify(messages));

      if (type == 1) {
        // 1 indicate to delete message only for me
        const updateArray = cloneArray.map((val, i) => {
          if (val.id == deleteId) {
            return {...val, deleted_by: String(userData?.id)};
          }
          return {...val};
        });
        setMessages(updateArray);
      } else {
        const updateArray = cloneArray.filter((val, i) => val.id !== deleteId);
        setMessages(updateArray);
      }
    },
    [messages],
  );

  const renderMessages = useCallback(
    ({currentMessage}) => {
      const receiverImg = currentMessage?.users?.avatar
        ? currentMessage?.users?.avatar
        : currentMessage?.senders?.profile_image;

      let myDeleteMes = false;
      if (currentMessage?.deleted_by != undefined) {
        const value = currentMessage?.deleted_by;
        const findData = value?.includes(userData?.id);
        myDeleteMes = findData;
      }
      
      return (
        <ChatBubble
          readMessage={currentMessage?.read_at}
          myDeleteMes={myDeleteMes}
          onMessageDeleteSuccess={onMessageDeleteSuccess}
          currentMessage={currentMessage}
          img={receiverImg}
          oneTime={!!currentMessage?.is_see_once}
          itemData={currentMessage}
          sender_id={currentMessage?.sender_id}
          myId={userData?.id}
          roomType={roomData?.room_type}
          created_at={currentMessage?.created_at}
          type={currentMessage?.type}
          text={currentMessage?.message}
          activeIndex={pressedIndexParent}
          messageId={currentMessage?.chat_conversation_id}
          pressedIndex={val => {
            setPressedIndexParent(val);
          }}
          showImageFromChild={val => {
            setTimeout(() => {
              setSelectedImageToShow({
                isVisible: true,
                image: val,
              }),
                600;
            });
            if (currentMessage?.sender_id != userData?.id) {
              if (currentMessage?.is_see_once == 1) {
                apiPayload = {
                  message_id: currentMessage?.id,
                  delete_type: DeleteMsg.DeleteOneTime,
                };
                deleteChatMessage(apiPayload)
                  .then(res => {})
                  .catch(error => {});
              }
            }
          }}
          likeSubmit={likeSubmit}
          likedListSubmit={(value, likedby) => {
            onSetLikedUsers(likedby);
            setShowLikedByList({visible: value, list: likedby});
          }}
          onReplyPress={scrollToRepliedMessage}
          isHighlighted={
            String(currentMessage?.id) === String(highlightedMessageId) ||
            String(currentMessage?._id) === String(highlightedMessageId)
          }
          onSwipeToReply={messageData => {
            const senderName =
              messageData?.sender_id === userData?.id
                ? 'You'
                : messageData?.senders?.first_name ||
                  messageData?.users?.first_name ||
                  messageData?.user?.name ||
                  prevData?.first_name ||
                  'User';
            setReplyMessage({
              id: messageData?.id,
              sender_id: messageData?.sender_id,
              message: messageData?.message,
              type: messageData?.type || 'text',
              sender_name: senderName,
            });
          }}
        />
      );
    },
    [
      messages,
      pressedIndexParent,
      userData?.id,
      roomData?.room_type,
      highlightedMessageId,
      scrollToRepliedMessage,
    ],
  );

  const _startRecording = async () => {
    const dirs = RNFetchBlob.fs.dirs;
    const audioSet = {
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    const path = Platform.select({
      android: `${dirs.CacheDir}/name.mp3`,
      ios: 'hhhh.m4a',
    });

    let result;
    if (Platform.OS === 'android') {
      result = await audioRecorderPlayer.startRecorder(path);
    } else {
      result = await audioRecorderPlayer.startRecorder(path, audioSet);
    }

    audioRecorderPlayer.addRecordBackListener(e => {
    });
  };

  const _stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();

    const obj = {
      loading: true,
      chat_conversation_id: Math.random(),
      createdAt: String(new Date()),
      filename: null,
      id: Math.random(),
      message: result,
      product_id: 0,
      read_at: null,
      receiver_id: prevData?.id,
      sender_id: userData?.id,
      room_type: roomData?.room_type ? roomData?.room_type : 1,
      group_id: roomData?.id,
      is_see_once: oneTimeView ? 1 : 0,
      type: 'voice_message',
      updated_at: '2023-04-13T06:37:30.000Z',
      user_id: prevData?.id,
      _id: userData?.id,
      text: 'Voice',
      ...(replyMessage
        ? {
            reply_to_id: replyMessage?.id,
            reply_message: replyMessage?.message,
            reply_type: replyMessage?.type || 'text',
            reply_sender_id: replyMessage?.sender_id,
            reply_sender_name: replyMessage?.sender_name,
          }
        : {}),
      user: {
        _id: userData?.id,
        name: userData?.first_name,
        avatar: userData?.profile_image,
      },
    };

    const oldMessages = messages.map((item, index) => item);
    _uploadAudio(result, oldMessages);
    setMessages(previousMessages => GiftedChat.append(previousMessages, obj));
  };

  const _onStartPlay = async () => {
    const msg = await audioRecorderPlayer.startPlayer();

    audioRecorderPlayer.addPlayBackListener(e => {
    });
  };

  const onSendLiveLocation = (latitude, longitude) => {
    const obj = {
      sender_id: userData?.id,
      user_id: prevData?.id,
      receiver_id: prevData?.id ? prevData?.id : userData?.id,
      _id: userData?.id,
      message: '' + latitude + ',' + longitude,
      text: 'Location',
      room_type: roomData?.room_type ? roomData?.room_type : 1,
      is_see_once: oneTimeView ? 1 : 0,
      group_id: roomData?.id,
      type: 'location',
      createdAt: String(new Date()),
      user: {
        _id: userData?.id,
        name: userData?.first_name,
        avatar: userData?.profile_image,
      },
    };
    const oldMessages = messages.map((item, index) => item);
    onSend([obj], 'Live_Location', oldMessages);
  };

  const _uploadAudio = (audioFile, oldMsgs) => {
    const apiData = new FormData();
    apiData.append('file', {
      // uri: audioFile,
      uri: audioFile,
      name: 'audio.mp3',
      type: 'audio/mp3',
      fileName: 'audio/mp3',
    });

    uploadAudioFile(apiData)
      .then(res => {
        const obj = {
          sender_id: userData?.id,
          user_id: prevData?.id,
          receiver_id: prevData?.id ? prevData?.id : userData?.id,
          _id: userData?.id,
          text: 'Voice',
          room_type: roomData?.room_type ? roomData?.room_type : 1,
          is_see_once: oneTimeView ? 1 : 0,
          message: res?.data,
          group_id: roomData?.id,
          type: 'voice_message',
          createdAt: String(new Date()),
          user: {
            _id: userData?.id,
            name: userData?.first_name,
            avatar: userData?.profile_image,
          },
        };

        onSend([obj], 'voice_message', oldMsgs);

      })
      .catch(error => {
        console.log(error, 'error uploadAudioFile');
        showError(ApiError(error));
        _stopRec();
      });
  };

  const _stopRec = async () => {
    await audioRecorderPlayer.stopRecorder();
  };

  const onSendCameraImage = () => {
    selectSingleImageFromCamera()
      .then(res => {
        navigation.navigate(navigationString.ONE_TIME_READ, {
          roomType: roomData?.room_type,
          res,
          screenCallback,
        });
      })
      .catch(err => {
        console.log(err, 'eeror from img picker');
      });
  };
  const sendImageInChat = () => {
    selectSingleImageFromGallery()
      .then(res => {
        navigation.navigate(navigationString.ONE_TIME_READ, {
          roomType: roomData?.room_type,
          res,
          screenCallback,
        });
      })
      .catch(err => {
        console.log(err, 'eeror from img picker');
      });
  };

  const screenCallback = data => {
    setOneTimeView(data?.oneTime);

    const obj = {
      loading: true,
      chat_conversation_id: Math.random(),
      createdAt: String(new Date()),
      filename: null,
      is_see_once: data?.oneTime ? 1 : 0,
      id: Math.random(),
      message: data?.image?.path,
      product_id: 0,
      read_at: null,
      receiver_id: prevData?.id,
      sender_id: userData?.id,
      room_type: roomData?.room_type ? roomData?.room_type : 1,
      type: 'image',
      updated_at: moment().format(),
      user_id: prevData?.id,
      _id: userData?.id,
      text: 'Image',
      ...(replyMessage
        ? {
            reply_to_id: replyMessage?.id,
            reply_message: replyMessage?.message,
            reply_type: replyMessage?.type || 'text',
            reply_sender_id: replyMessage?.sender_id,
            reply_sender_name: replyMessage?.sender_name,
          }
        : {}),
      user: {
        _id: userData?.id,
        name: userData?.first_name,
        avatar: userData?.profile_image,
      },
    };

    _uploadImage(data?.image?.path, messages, data?.oneTime);
    setMessages(previousMessages => GiftedChat.append(previousMessages, obj));
  };

  const _uploadImage = (imageFile, oldMsgs, isOneTimeView) => {
    const currentTime = new Date().getTime();
    const apiData = new FormData();
    apiData.append('file', {
      uri: imageFile,
      name: userData?.id + '/' + currentTime + '.png',
      type: 'image/png',
      fileName: 'image',
    });

    uploadAudioFile(apiData)
      .then(res => {
        const obj = {
          sender_id: userData?.id,
          user_id: prevData?.id ? prevData?.id : userData?.id,
          receiver_id: prevData?.id ? prevData?.id : userData?.id,
          _id: userData?.id,
          text: 'Image',
          message: res?.data,
          type: 'image',
          room_type: roomData?.room_type ? roomData?.room_type : 1,
          createdAt: String(new Date()),
          group_id: roomData?.id,
          is_see_once: isOneTimeView,
          user: {
            _id: userData?.id,
            name: userData?.first_name,
            avatar: userData?.profile_image,
          },
        };
        onSend([obj], 'image', oldMsgs);
      })
      .catch(error => {
        showError(ApiError(error));
      });
  };

  useEffect(() => {
    socketRef.on(
      'typing',
      ({user_id, receiver_id, is_typing, room_type, group_id}) => {
        if (
          Number(userData.id) !== Number(user_id) &&
          group_id == roomData?.id
        ) {
          // Only show typing indicator for Plus subscription users
          if (userData?.subscription?.subscription_name != "Free") {
            setIsTyping(is_typing);
          }
        }
      },
    );
    return () => {
      socketRef.removeListener('typing');
      setIsTyping(false);
    };
  }, []);

  const startTypeing = textlength => {
    // Only emit typing events for Plus subscription users
    if (userData?.subscription?.subscription_name != "Free") {
      socketRef.emit('typing', {
        user_id: userData?.id,
        receiver_id: roomData?.room_type == '2' ? userData?.id : prevData.id,
        is_typing: textlength > 0,
        room_type: roomData?.room_type == '2' ? 2 : 1,
        group_id: roomData?.id,
      });
    }
  };
  const startTypeings = textlength => {
    // Only emit typing events for Plus subscription users
    if (userData?.subscription?.subscription_name != "Free") {
      socketRef.emit('typing', {
        user_id: userData?.id,
        receiver_id: roomData?.room_type == '2' ? userData?.id : prevData.id,
        is_typing: false,
        room_type: roomData?.room_type == '2' ? 2 : 1,
        group_id: roomData?.id,
      });
    }
  };

  const AiMessages = msg => {
    const type = 'text';
    let socketMessage = {};
    const activeReply = replyMessage;
    const replyPayload = activeReply
      ? {
          reply_to_id: activeReply?.id,
          reply_message: activeReply?.message,
          reply_type: activeReply?.type || 'text',
          reply_sender_id: activeReply?.sender_id,
          reply_sender_name: activeReply?.sender_name,
        }
      : {};
    if (type === 'text') {
      if (msg.trim() === '') return;
      socketMessage = {
        sender_id: userData?.id,
        user_id: roomData?.room_type != 2 ? prevData?.id : userData?.id,
        receiver_id: roomData?.room_type != 2 ? prevData?.id : null,
        room_type: roomData?.room_type ? roomData?.room_type : 1,
        group_id: roomData?.id ? roomData?.id : null,
        _id: userData?.id,
        text: msg,
        is_see_once: oneTimeView ? 1 : 0,
        message: msg,
        type: 'text',
        createdAt: String(new Date()),
        ...replyPayload,
        user: {
          _id: userData?.id,
          name: userData?.first_name,
          avatar: userData?.profile_image,
        },
      };
    } else {
      socketMessage = message[0];
    }

    const oldMessages = messages.map(item => item);

    socketRef.emit('sendMessage', socketMessage, (response, err) => {
      const sentMsgRes = response?.data;
      if (response.status === 'error') {
        showError(response?.message || 'Error');
        setMessages(oldMessages);
        return;
      }
      let newMsg = {
        ...sentMsgRes,
        _id: sentMsgRes?.id,
        text: sentMsgRes?.message,
        createdAt: sentMsgRes?.created_at,
        reply_to_id: sentMsgRes?.reply_to_id ?? activeReply?.id,
        reply_message: sentMsgRes?.reply_message ?? activeReply?.message,
        reply_type: sentMsgRes?.reply_type ?? activeReply?.type,
        reply_sender_id:
          sentMsgRes?.reply_sender_id ?? activeReply?.sender_id,
        reply_sender_name:
          sentMsgRes?.reply_sender_name ?? activeReply?.sender_name,
        user: {
          _id: sentMsgRes?.id,
          name:
            userData?.id === sentMsgRes?.sender_id
              ? userData?.first_name
              : prevData?.first_name,
          avatar:
            userData?.id === sentMsgRes?.sender_id
              ? userData?.profile_image
              : prevData?.profile_image,
        },
        loading: false,
      };

      if (type === 'image') {
        newMsg = {
          ...newMsg,
          message: newMsg?.message,
          text: newMsg?.text,
        };
      }

      if (type === 'voice_message' || type === 'image') {
        setMessages(previousMessages => GiftedChat.append(oldMsgs, newMsg));
      } else {
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, newMsg),
        );
      }
      setReplyMessage(null);
    });
  };

  const renderMessageItem = ({item}) => (
    <TouchableOpacity
      onPress={() => AiMessages(item)}
      style={{
        borderColor: theme.greenTheme,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        paddingHorizontal: moderateScale(10),
        marginHorizontal: moderateScale(10),
        borderRadius: moderateScale(10),
        marginBottom:
          Platform.OS === 'android' ? moderateScale(10) : moderateScale(0),
      }}>
      <Text style={{color: theme.colors.black}}>{item}</Text>
    </TouchableOpacity>
  );

  const renderInputToolbar = props => {
    const showQuickReplies =
      messages.length == 0 &&
      prevData?.is_blocked != 1 &&
      prevData?.you_are_blocked != 1;

    const getReplyPreviewText = () => {
      if (!replyMessage?.message) {
        return '';
      }
      if (replyMessage?.type === 'image') {
        return 'Image';
      }
      if (replyMessage?.type === 'voice_message') {
        return 'Voice message';
      }
      if (replyMessage?.type === 'location') {
        return 'Location';
      }
      return String(replyMessage?.message);
    };

    return (
      <View style={{alignItems: 'center',}}>
        {replyMessage ? (
          <View style={styles.replyPreviewContainer}>
            <View style={{flex: 1}}>
              <Text style={styles.replyPreviewTitle}>
                Replying to {'this message'}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.replyPreviewText}>
                {getReplyPreviewText()}
              </Text>
            </View>
            <TouchableOpacity
              hitSlop={hitSlopProp}
              onPress={() => setReplyMessage(null)}>
              <Text style={styles.replyCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {showQuickReplies ? (
          <View
            style={{
              alignItems: 'center',
              width: '90%',
              bottom: Platform.OS === 'ios' ? moderateScale(10) : 0,
              height: moderateScale(50),
              justifyContent: 'center',
            }}>
            <FlatList
              data={message}
              showsHorizontalScrollIndicator={false}
              horizontal
              renderItem={renderMessageItem}
              keyExtractor={stableKeyExtractor}
            />
          </View>
        ) : null}
        <ChatInputToolBar
          roomData={roomData?.room_type}
          publicRoom={publicRoom}
          sender_id={prevData?.id}
          isBlocked={prevData?.is_blocked}
          AskToBlockUnblock={() => _askToBlockUnblock(2)}
          areYouBlocked={prevData?.you_are_blocked}
          onChangeInputText={val => {
            if (val.length >= 0) {
              startTypeing(val.length);
              props?.onTextChanged(val);
            }
          }}
          onSend={(newVal, type = 1) => {
            if (type == 1) {
              props.onSend({text: props.text?.trim() || ''}, true);
            } else if (type == 2) {
              props.onSend({text: newVal}, true);
            }
          }}
          subscriptionId={prevData?.subscription?.subscription_id}
          textValue={props?.text || ''}
          onStartRecAudio={_startRecording}
          onStopRecAudio={_stopRecording}
          onSendImage={sendImageInChat}
          onSendCameraImage={onSendCameraImage}
          onSendLiveLocation={onSendLiveLocation}
          chatId={roomData?.room_type == 2 ? `group_${roomData?.id}` : `user_${prevData?.id}`}
          onDraftLoaded={(draftText) => {
            props?.onTextChanged(draftText);
          }}
          messages={messages}
          userData={userData}
          onResendPhoto={handleResendPhoto}
          currentLoc={currentLoc}
          mapRegion={mapRegion}
          setMapRegion={setMapRegion}
          hasActiveReply={!!replyMessage}
        />
      </View>
    );
  };

  const _onLoadEarlier = () => {
    if (hasMoreData) {
      setIsLoadingEarlier(true);
      setPageNo(prev => prev + 1);
    }
  };

  const _askToBlockUnblock = type => {
    Alert.alert(
      strings.Alert,
      `Are you sure you want to ${type === 1 ? 'Block' : 'Unblock'} this user?`,
      [
        {
          text: strings.yes,
          onPress: () => (type === 1 ? _blockUser() : _unblockUser()),
        },
        {
          text: strings.no,
          style: 'destructive',
        },
      ],
    );
  };

  const _blockUser = () => {
    setTimeout(() => showActionModal(false), 600);
    setLoading(false);
    const apiData = {
      user_id: prevData?.id,
    };
    blockUserApi(apiData)
      .then(res => {
        setPrevData(prevData => ({...prevData, is_blocked: 1}));
        setLoading(false);

        _blockedRes();
      })
      .catch(error => {
        setTimeout(() => showActionModal(true), 600);
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const _unblockUser = () => {
    setTimeout(() => showActionModal(false), 600);
    setLoading(false);
    const apiData = {
      user_id: prevData?.id,
    };
    unblockUserApi(apiData)
      .then(res => {
        setPrevData(prevData => ({...prevData, is_blocked: 0}));
        setLoading(false);
        _blockedRes();
      })
      .catch(error => {
        setTimeout(() => showActionModal(true), 600);
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const _blockedRes = () => {
    socketRef.emit('block-status', {user_id: prevData?.id}, (response, err) => {
      console.log(
        'message-read blick response',
        response,
        'message-read block err===>',
        err,
      );
    });
  };

  const _unMatchUser = () => {
    Alert.alert(strings.Alert, strings.areyousureyouWantUnmatch, [
      {
        text: strings.yes,
        onPress: () => _unMatchUserApi(),
      },
      {
        text: strings.no,
        style: 'destructive',
      },
    ]);
  };

  const _unMatchUserApi = () => {
    setTimeout(() => showActionModal(false), 600);
    setLoading(true);
    const apiData = {
      status: 3,
      // from_user: userData?.id,
      user_id: prevData?.id,
      request_type: 1,
    };
    likeDislikeUserApi(apiData)
      .then(res => {
        navigation.goBack();
        setLoading(false);
      })
      .catch(error => {
        showError(ApiError(error));
        setLoading(false);
      });
  };

  const _onReport = () => {
    if (reportingText.trim() === '') {
      setTimeout(() => showActionModal(true), 600);
      setReporting(true);
      return;
    }
    setLoading(true);

    setTimeout(() => showActionModal(false), 600);
    setReporting(false);

    const apiData = {
      user_id: prevData?.id,
      reason: reportingText.trim(),
    };

    reportUserApi(apiData)
      .then(res => {
        setLoading(false);
        setReportText('');
      })
      .catch(error => {
        setReportText('');
        setLoading(false);
        setTimeout(() => showActionModal(true), 600);
        setReporting(true);
        showError(ApiError(error));
      });
  };

  const onPressFavorite = async() => {




    try {
      const response = await addRemoveFavorateChat({
        chat_id: roomDataID?.id,
      });
      if (response?.success) {
        showSuccess(response?.message)
        navigation.goBack()
      }
    } catch (error) {
      console.log(error);
      showError(error?.message || 'Something went wrong');
    }

  }
  const onPressMuteChat = async() => {
    
    try {
      const response = await muteUnmuteNotificationApi({
        group_id: roomDataID?.id,
      });
      if (response?.success) {
        setMuteUser(!muteUser);
        showActionModal(false)
        showSuccess(muteUser ? 'Unmute Successfully' : 'Mute Successfully');
      }
    } catch (error) {
      console.log(error);
      showError(error?.message || 'Something went wrong');
    }

  }

  const handleResendPhoto = (photo) => {
    const activeReply = replyMessage;
    // Create a new message object for the resent photo
    const obj = {
      loading: true,
      chat_conversation_id: Math.random(),
      createdAt: String(new Date()),
      filename: null,
      is_see_once: photo?.is_see_once || 0,
      id: Math.random(),
      message: photo?.message, // Use the original photo URL
      product_id: 0,
      read_at: null,
      receiver_id: prevData?.id,
      sender_id: userData?.id,
      room_type: roomData?.room_type ? roomData?.room_type : 1,
      type: 'image',
      updated_at: moment().format(),
      user_id: prevData?.id,
      _id: userData?.id,
      text: 'Image',
      ...(activeReply
        ? {
            reply_to_id: activeReply?.id,
            reply_message: activeReply?.message,
            reply_type: activeReply?.type || 'text',
            reply_sender_id: activeReply?.sender_id,
          }
        : {}),
      user: {
        _id: userData?.id,
        name: userData?.first_name,
        avatar: userData?.profile_image,
      },
    };

    // Add the message to the chat immediately
    setMessages(previousMessages => GiftedChat.append(previousMessages, obj));

    // Send the message through socket
    socketRef.emit('sendMessage', obj, (response, err) => {
      if (response) {
        try {
          if (Platform.OS === 'ios') {
            SoundPlayer.playAsset(
              require('../../assets/audios/zego_incoming.mp3'),
            );
            SoundPlayer.stop();
          } else {
            playNotificationSound();
          }
        } catch (error) {
          console.log('sound error', error);
        }
      }

      const sentMsgRes = response?.data;
      if (response.status === 'error') {
        showError(response?.message || 'Error');
        return;
      }

      // Update the message with the server response
      let newMsg = {
        ...sentMsgRes,
        _id: sentMsgRes?.id,
        text: sentMsgRes?.message,
        createdAt: sentMsgRes?.created_at,
        is_see_once: sentMsgRes?.is_see_once,
        read_at: sentMsgRes?.is_see_once === 1 ? sentMsgRes?.created_at : null,
        reply_to_id: sentMsgRes?.reply_to_id ?? activeReply?.id,
        reply_message: sentMsgRes?.reply_message ?? activeReply?.message,
        reply_type: sentMsgRes?.reply_type ?? activeReply?.type,
        reply_sender_id:
          sentMsgRes?.reply_sender_id ?? activeReply?.sender_id,
        reply_sender_name:
          sentMsgRes?.reply_sender_name ?? activeReply?.sender_name,
        user: {
          _id: sentMsgRes?.id,
          name:
            userData?.id === sentMsgRes?.sender_id
              ? userData?.first_name
              : prevData?.first_name,
          avatar:
            userData?.id === sentMsgRes?.sender_id
              ? userData?.profile_image
              : prevData?.profile_image,
        },
        loading: false,
      };

      // Update the messages array with the server response
      setMessages(previousMessages => {
        return previousMessages.map(message => {
          if (message.id === obj.id) {
            return newMsg;
          }
          return message;
        });
      });
      setReplyMessage(null);
    });
  };

  const privateGallaryAccess = () => {
    setLoading(true);

    const apiData = {
      user_id: prevData?.id,
    };

    if (showPrivateGallery == false) {
      grantPrivateGallery(apiData)
        .then(res => {
          setShowPrivateGallery(true);
          setLoading(false);
        })
        .catch(error => {
          console.log('grantPrivateGalleryerrer', error);
          showError(ApiError(error));
          setLoading(false);
        });
    } else
      removePrivateGallery(apiData)
        .then(res => {
          setShowPrivateGallery(false);
          setLoading(false);
        })
        .catch(error => {
          console.log('grantPrivateGalleryerrer', error);
          showError(ApiError(error));
          setLoading(false);
        });
  };

  const _onSayHello = () => {
    if (userData?.subscription?.subscription_id === 3) {
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
                from: 'ChatScreen',
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
    navigation.navigate(navigationString.HOME);
  };
  // console.log('jaskjasjkdakjshdjashdjkahskjdashdahs',messages)

  return (    
    <WrapperContainer paddingAvailable={false}>
      {chatHeader()}
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.chatContainer}>
        <GiftedChat
          onSend={messages => onSend(messages, 'text')}
          renderMessage={renderMessages}
          messages={messages}
          extraData={{messages, highlightedMessageId}}
          renderDay={() => null}
          keyboardShouldPersistTaps={'always'}
          renderInputToolbar={renderInputToolbar}
          // renderInputToolbar={(props) => <ChatInputToolBar {...props} />} 
          wrapInSafeArea={false}
          user={{_id: userData?.id}}
          loadEarlier={hasMoreData}
          onLoadEarlier={_onLoadEarlier}
          isLoadingEarlier={isLoadingEarlier}
          infiniteScroll={true}
          renderLoadEarlier={() => {
            if (isLoadingEarlier) {
              return (
                <View style={{ marginVertical: 10, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={theme.colors.activeTintColor} />
                </View>
              );
            }
            return null;
          }}
          renderAvatarOnTop={true}
          isTyping={isTyping}
          scrollToBottom={true}
          listViewProps={{
            ref: chatListRef,
            initialNumToRender: 1000,
            keyboardShouldPersistTaps: 'handled',
            keyboardDismissMode:
              Platform.OS === 'ios' ? 'interactive' : 'on-drag',
            nestedScrollEnabled: true,
            onScrollToIndexFailed: info => {
              setTimeout(() => {
                chatListRef?.current?.scrollToOffset?.({
                  offset: info?.averageItemLength * info?.index,
                  animated: true,
                });
              }, 250);
            },
          }}
          bottomOffset={Platform.OS === 'ios' ? moderateScale(-100) : 0}
        />
      </SafeAreaView>
      <Modal isVisible={actionModal} style={{margin: 0}}>
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}
          onPress={() => showActionModal(false)}>
          <View
            style={{
              borderTopLeftRadius: moderateScale(24),
              borderTopRightRadius: moderateScale(24),
              paddingTop: moderateScale(16),
              paddingBottom: moderateScale(40),
              height: !isReporting
                ? DEFAULT_MODAL_HEIGHT
                : HEIGHT_WITH_TEXT_INPUT,
              backgroundColor: theme.colors.white,
              paddingHorizontal: moderateScale(24),
            }}>
            <TouchableOpacity
              style={{alignItems: 'flex-end'}}
              hitSlop={hitSlopProp}
              onPress={() => showActionModal(false)}>
              <Image
                source={imagesPath.ic_Cross}
                style={{
                  tintColor: theme.colors.black,
                }}
              />
            </TouchableOpacity>

            <View
              style={{
                marginTop: moderateScale(16),
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                hitSlop={hitSlopProp}
                onPress={() => {
                  privateGallaryAccess();
                }}>
                <Text style={{...commonStyles.font_16_SemiBold}}>
                  Private Gallery Access
                </Text>
              </TouchableOpacity>

              {showPrivateGallery == true ? (
                <View>
                  <Image
                    style={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                      resizeMode: 'contain',
                    }}
                    source={imagesPath.ic_greenTick}
                  />
                </View>
              ) : null}
            </View>


            <View
              style={{
                marginTop: moderateScale(16),
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                hitSlop={hitSlopProp}
                onPress={() => {
                  onPressMuteChat();
                }}>
                <Text style={{...commonStyles.font_16_SemiBold}}>
                  Mute Chat
                </Text>
              </TouchableOpacity>

              {muteUser == true ? (
                <View>
                  <Image
                    style={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                      resizeMode: 'contain',
                    }}
                    source={imagesPath.ic_greenTick}
                  />
                </View>
              ) : null}
            </View>


            <View
              style={{
                marginTop: moderateScale(16),
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                hitSlop={hitSlopProp}
                onPress={() => {
                  onPressFavorite();
                }}>
                <Text style={{...commonStyles.font_16_SemiBold}}>
              {!favTab?"Add to Favorite":"Remove Favorite"}
                </Text>
              </TouchableOpacity>

              {/* {muteUser == true ? (
                <View>
                  <Image
                    style={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                      resizeMode: 'contain',
                    }}
                    source={imagesPath.ic_greenTick}
                  />
                </View>
              ) : null} */}
            </View>

            {isReporting ? (
              <KeyboardAwareScrollView keyboardShouldPersistTaps={'always'}>
                <Text
                  style={{
                    ...commonStyles.font_14_SemiBold,
                  }}>
                  {strings.pleaseTellUsWhyYouAreReporting}
                </Text>
                <TextInputComp
                  placeholder={strings.enterReason}
                  value={reportingText}
                  multiline
                  inputView={{marginTop: moderateScale(10)}}
                  textInputStyle={{
                    height: moderateScale(80),
                    marginVertical: moderateScale(10),
                  }}
                  autoFocus={true}
                  onChangeText={val => setReportText(val)}
                />

                <ButtonComp
                  btnText={strings.report}
                  btnView={{
                    marginTop: moderateScale(16),
                    height: moderateScale(44),
                    width: '70%',
                  }}
                  onPressBtn={_onReport}
                />
              </KeyboardAwareScrollView>
            ) : (
              <>
                <TouchableOpacity
                  style={{marginTop: moderateScale(16)}}
                  hitSlop={hitSlopProp}
                  onPress={() =>
                    _askToBlockUnblock(prevData?.is_blocked ? 2 : 1)
                  }>
                  <Text style={{...commonStyles.font_16_SemiBold}}>
                    {prevData?.is_blocked ? strings.unblock : strings.block}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    marginTop: moderateScale(16),
                    marginBottom: moderateScale(40),
                  }}
                  onPress={() => {
                    setReporting(true);
                    ApplyEaseOutAnimation();
                  }}>
                  <Text style={{...commonStyles.font_16_SemiBold}}>
                    {strings.reportThisUser}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={selectedImageToShow?.isVisible} style={{margin: 0}}>
        <GalleryImageModal
          currentIndex={0}
          data={[{thumb_path: selectedImageToShow?.image}]}
          onPressClose={() =>
            setSelectedImageToShow({
              isVisible: false,
              image: null,
            })
          }
        />
      </Modal>

      <Loader isLoading={isLoading} />
      <ItsAMatchModal
        isVisible={itsMatchModal?.isVisible}
        userImage={itsMatchModal?.userPic}
        onSayHello={_onSayHello}
        onKeepSwiping={_onKeepSwiping}
      />
      <Modal animationType="none" transparent={true} visible={showGroupImage}>
        <Pressable
          onPress={() => setShowGroupImage(!showGroupImage)}
          style={styles.modalBackground}>
          <Animated.View
            style={[styles.modalView, {transform: [{scale: scaleAnim}]}]}>
            <FastImage
              style={styles.groupImage}
              source={
                roomData?.group_image
                  ? {uri: roomData?.group_image}
                  : imagesPath?.userRoundIcon
              }
            />
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Liked By List */}
      <Modal
        isVisible={showLikedByList?.visible}
        onBackButtonPress={() => {
          setShowLikedByList({visible: false, list: ''});
        }}
        onBackdropPress={() => {
          setShowLikedByList({visible: false, list: ''});
        }}
        style={{margin: 0, justifyContent: 'flex-end'}}>
        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            minHeight: verticalScale(300),
            maxHeight: verticalScale(600),
            borderTopEndRadius: moderateScale(20),
            borderTopStartRadius: moderateScale(20),
            padding: moderateScale(20),
          }}>
          <ScrollView>
            {likedUsers.map((item, index) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setShowLikedByList({visible: false, list: ''});
                    navigation.navigate(navigationString.VIEWPROFILE, {
                      prevScreenData: item,
                    });
                  }}
                  style={{
                    marginBottom: verticalScale(10),
                    padding: moderateScale(15),
                    backgroundColor: theme.colors.themecolor2,
                    borderRadius: moderateScale(10),
                    shadowColor: theme.colors.black,
                    borderWidth: 1,
                    borderColor: theme.colors.themecolor2,
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <CustomImage
                      source={{uri: item?.profile_image}}
                      imgLoaderStyle={{
                        borderWidth: 2,
                        borderColor: theme.colors.white,
                        borderRadius: moderateScale(20),
                        right: index == 0 ? 0 : moderateScale(6 * index + 2),
                        zIndex: -index,
                        width: moderateScale(60),
                        height: moderateScale(60),
                      }}
                      style={{
                        width: moderateScale(60),
                        height: moderateScale(60),
                        borderRadius: 100,
                        backgroundColor: theme.colors.grey,
                      }}
                    />

                    <Text
                      style={{
                        color: theme.colors.black,
                        marginLeft: scale(10),
                        fontSize: scale(19),
                        fontWeight: '600',
                      }}>
                      {item?.full_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </WrapperContainer>
  );
};

const getStyles = (theme, commonStyles) => StyleSheet.create({
  chatContainer: {
    flex:1,
    paddingBottom: 0,
    backgroundColor: theme.colors.white,
  },
  replyPreviewContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // borderWidth: 1,
    borderColor: theme.colors.activeTintColor,
    borderTopLeftRadius: moderateScale(10),
    borderTopRightRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    marginBottom: moderateScale(-4),
    backgroundColor: theme.colors.blackOpacity10
    // backgroundColor: theme.colors.blackOpacity50,
  },
  replyPreviewTitle: {
    ...commonStyles.font_12_SemiBold,
    color: theme.colors.florsentTheme,
  },
  replyPreviewText: {
    ...commonStyles.font_12_regular,
    color: theme.colors.activeTintColor,
    marginTop: moderateScale(2),
  },
  replyCloseText: {
    ...commonStyles.font_12_SemiBold,
    color: theme.colors.red,
    marginLeft: moderateScale(10),
  },
  keyboardContainer:{
    flex:1,
    backgroundColor: theme.colors.lightGray
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: theme.colors.likePink,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.blackOpacity50,
    margin: moderateScale(-20),
  },
  modalView: {
    width: moderateScale(300),
    height: moderateScale(300),
    borderRadius: moderateScale(150),
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
    textAlign: 'center',
  },
  groupImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(150),
    resizeMode: ImageEnum.contain,
  },
});

export default ChatScreen;
