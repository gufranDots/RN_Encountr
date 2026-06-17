import notifee from '@notifee/react-native';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import colors from '../../styles/colors';
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
import {AskVoicePermission} from '../../utils/miscellaneous';
import {
  ConnectingSocket,
  removeItem,
  setItem,
  socketRef,
} from '../../utils/utils';
import FastImage from '../../utils/FastImageCompat';
import ItsAMatchModal from '../../Components/ItsAMatchModal';
import {stableKeyExtractor} from '../../utils/stableKeyExtractor';
import {configureZegoCloud} from '../../utils/zegoConfigureFile';
import SoundPlayer from 'react-native-sound-player';
import CustomImage from '../../Components/CustomImage';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { getCommonStyles } from '../../styles/commonStyles';
import { DeleteMsg } from '../../constants/Enum';

enableFreeze();
const DEFAULT_MODAL_HEIGHT = height / 3.4;
const HEIGHT_WITH_TEXT_INPUT = Platform.OS === 'ios' ? height / 1.1 : height / 1.9;
const audioRecorderPlayer = new AudioRecorderPlayer();

const ChatScreen2 = props => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardBottomInset = Platform.OS === 'ios' ? insets.bottom : 0;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles)
  const {navigation, route} = props;
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const [isLoading, setLoading] = useState(true);
  const [prevData, setPrevData] = useState(route?.params?.prevData?.id ? route?.params?.prevData : null);
  const publicRoom = route?.params?.public || false;
  const [showPrivateGallery, setShowPrivateGallery] = useState(prevData?.has_private_gallery_access);
  const favTab = route?.params?.favorite
  
  const [muteUser, setMuteUser] = useState(userData?.id == route?.params?.data?.notify_muted_by);
  const [roomDataID, setRoomDataID] = useState(route?.params?.data);
  const [roomData, setRoomData] = useState(route?.params?.Data);
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
  const [likedUsers, setLikedUsers] = useState([]);
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
    AskVoicePermission();
    _connectSocket();
    configureZegoCloud({
      id: String(userData?.id),
      user_name: userData?.user_name || 'Encountr',
    });
  }, []);

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
    _getAllChatMessages();
    if (prevData?.id) {
      _connectSocket();
    }
  }, [pageNo, prevData, data]);
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
      console.log('socket connection error: ', JSON.stringify(err));
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
  const _updateReceivedMessage = item => {
    const socketMessage = {
      ...item,
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
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, socketMessage),
    );
  };

  const _getAllChatMessages = () => {
    const apiData = {
      id: prevData?.id ? prevData?.id : userData?.id,
      room_type: roomData?.room_type ? roomData?.room_type : 1,
      page: pageNo,
      group_id: roomData?.id,
    };
    getAllChatMessagesApi(apiData)
      .then(res => {
        const allMessages = res.data.messages.data.map((item, indexedDB) => {
          const obj = {
            ...item,
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

        if (pageNo === 1) {
          setMessages(allMessages);
        } else {
          setMessages([...messages, ...allMessages]);
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
      socketRef.emit('typing', {
        user_id: userData?.id,
        receiver_id: roomData?.room_type == '2' ? userData?.id : prevData.id,
        is_typing: false,
        room_type: roomData?.room_type == '2' ? 2 : 1,
        group_id: roomData?.id,
      });

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
      });
    },
    [prevData, messages],
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
      console.log("koko",prevData?.subscription?.subscription_id),
      
      <ChatHeaderComponent
        roomData={roomData}
        navigation={navigation}
        memberImg={memberImgData}
        prevData={roomData?.roomType == 2 ? roomData : prevData}
        roomType={roomData?.room_type ? 2 : 1}
        onBack={() => {
          socketRef.emit('typing', {
            user_id: userData?.id,
            receiver_id:
              roomData?.room_type == '2' ? userData?.id : prevData.id,
            is_typing: false,
            room_type: roomData?.room_type == '2' ? 2 : 1,
            group_id: roomData?.id,
          });
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
        />
      );
    },
    [messages, pressedIndexParent],
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
          setIsTyping(is_typing);
        }
      },
    );
    return () => {
      socketRef.removeListener('typing');
      setIsTyping(true);
    };
  }, []);

  const startTypeing = textlength => {
    socketRef.emit('typing', {
      user_id: userData?.id,
      receiver_id: roomData?.room_type == '2' ? userData?.id : prevData.id,
      is_typing: textlength > 0,
      room_type: roomData?.room_type == '2' ? 2 : 1,
      group_id: roomData?.id,
    });
  };
  const startTypeings = textlength => {
    socketRef.emit('typing', {
      user_id: userData?.id,
      receiver_id: roomData?.room_type == '2' ? userData?.id : prevData.id,
      is_typing: false,
      room_type: roomData?.room_type == '2' ? 2 : 1,
      group_id: roomData?.id,
    });
  };

  const AiMessages = msg => {
    const type = 'text';
    let socketMessage = {};
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
    });
  };

  const renderMessageItem = ({item}) => (
    <TouchableOpacity
      onPress={() => AiMessages(item)}
      style={{
        borderColor: theme.colors.greenTheme,
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
    return (
      <View
        style={{
          alignItems: 'center',
          paddingBottom: isKeyboardVisible ? 0 : keyboardBottomInset,
        }}>
        <View
          style={{
            alignItems: 'center',
            width: '90%',
            height: moderateScale(50),
            justifyContent: 'center',
            marginBottom: moderateScale(4),
          }}>
          {messages.length == 0 &&
          prevData?.is_blocked != 1 &&
          prevData?.you_are_blocked != 1 ? (
            <FlatList
              data={message}
              showsHorizontalScrollIndicator={false}
              horizontal
              renderItem={renderMessageItem}
              keyExtractor={stableKeyExtractor}
            />
          ) : null}
        </View>
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
              props.onTextChanged(val);
            }
          }}
          onSend={(newVal, type = 1) => {
            if (type == 1) {
              props.onSend({text: props.text.trim()}, true);
            } else if (type == 2) {
              props.onSend({text: newVal}, true);
            }
          }}
          subscriptionId={prevData?.subscription?.subscription_id}
          textValue={props?.text}
          onStartRecAudio={_startRecording}
          onStopRecAudio={_stopRecording}
          onSendImage={sendImageInChat}
          onSendCameraImage={onSendCameraImage}
          onSendLiveLocation={onSendLiveLocation}
        />
      </View>
    );
  };

  const _onLoadEarlier = () => {
    if (hasMoreData) {
      setIsLoadingEarlier(true);
      setPageNo(pageNo + 1);
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

  return (    
    <WrapperContainer
      paddingAvailable={false}
      statusBarAvailable={false}
      mainViewStyle={{backgroundColor: theme.colors.white}}>
      {chatHeader()}
      <SafeAreaView edges={['left', 'right']} style={styles.chatContainer}>
        <GiftedChat
          onSend={messages => onSend(messages, 'text')}
          renderMessage={renderMessages}
          messages={messages}
          extraData={messages}
          keyboardShouldPersistTaps={'always'}
          renderInputToolbar={renderInputToolbar}
          wrapInSafeArea={false}
          bottomOffset={
            isKeyboardVisible ? keyboardBottomInset : 0
          }
          user={{_id: userData?.id}}
          loadEarlier={hasMoreData}
          onLoadEarlier={_onLoadEarlier}
          isLoadingEarlier={isLoadingEarlier}
          renderAvatarOnTop={true}
          isTyping={isTyping}
        />
      </SafeAreaView>

      <Modal isVisible={actionModal} style={{margin: 0}}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
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
                  tintcolor: theme.colors.black,
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
        </View>
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
                    borderColor: theme.colors.themecolor2
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
                        color:theme.colors.black,
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
    flex: 1,
    paddingBottom: 0,
    backgroundColor: theme.colors.white,
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
    color: theme.colors.white,
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
    resizeMode: 'contain',
  },
});

export default ChatScreen2;
