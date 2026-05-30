// import liraries
import moment from 'moment'
import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  BackHandler,
  Modal
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import ListEmptyComponent from '../../Components/ListEmptyComponent'
import { Loader } from '../../Components/Loader'
import TextInputComp from '../../Components/TextInputComp'
import UserMsgView from '../../Components/UserMsgView'
import WrapperContainer from '../../Components/WrapperContainer'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import {
  bonkChatConversationsApi,
  chatDelete,
  getAllTaps,
  getChatCount,
  saveChatCounter
} from '../../redux/reduxActions/chatActions'
import colors from '../../styles/colors'
import {getCommonStyles} from '../../styles/commonStyles'
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale
} from '../../styles/responsiveSize'
import { ApiError, showError } from '../../utils/helperFunctions'
import { ConnectingSocket, socketRef } from '../../utils/utils'
import { stableKeyExtractor } from '../../utils/stableKeyExtractor'
import { enableFreeze } from 'react-native-screens'
import CustomImage from '../../Components/CustomImage'
import notifee, { AndroidImportance, EventType } from '@notifee/react-native'
import { chnageCount } from '../../redux/reduxReducers/homeReducers'
import { updateChatCOunt } from '../../redux/reduxActions/homeActions'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../theme/ThemeProvider'
enableFreeze()
// create a component
const MessageScreen = props => {
  const {theme , isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const { navigation } = props
  const userData = useSelector(state => state?.authReducers?.userData || {})
  const listRef = useRef(null)
  const [isLoading, setLoading] = useState(true)
  const [allUserChatListing, setAllUserChatListing] = useState([])
  const [pageNo, setPageNo] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(false)
  const [isRefreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [tapData, setTapData] = useState([])
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch()
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => { navigation.navigate('Home'); return true })
    return () => {
      backHandler.remove()
    }
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      _hitFromStart()
      notifee.setBadgeCount(0).then(() => console.log('Badge count removed!'))
      // Clear the notification dot when user visits the message screen
      updateChatCOunt(false)
    })
    return unsubscribe
  }, [pageNo])

  useEffect(() => {
    _hitFromStart()
  }, [searchText])

  useEffect(() => {
    _getUserChatListing()
  }, [pageNo])

  const _hitFromStart = () => {
    _connectSocket()
    if (pageNo === 1) {
      _getUserChatListing()
    } else {
      setPageNo(1)
    }
    _scrollTop()
  }

  const chatCounter = () => {
    getChatCount()
      .then(res => {
        saveChatCounter(res?.data)
      })
      .catch(error => {
      })
  }

  const _scrollTop = () => {
    if (listRef.current) {
      listRef.current?.scrollToOffset({ y: 0, animated: true })
    }
  }

  const _connectSocket = () => {
    ConnectingSocket(userData)

    socketRef.on('connect', () => {
      console.log('===== socket connected =====')
    })
    socketRef.on('sendMessage', response => {
      chatCounter()
      // Immediately show notification dot for new messages
      updateChatCOunt(true)
      notifee.setBadgeCount(0).then(() => { })
      _hitFromStart()
    })
    socketRef.on('disconnect', () => {
      console.log('socket disconnected')
      ConnectingSocket(userData)
    })
    socketRef.on('connect_error', err => {
      console.log('socket connection error: ', JSON.stringify(err))
      ConnectingSocket(userData)
    })
    socketRef.on('error', err => {
      console.log('socket error: ', JSON.stringify(err))
      ConnectingSocket(userData)
    })

    socketRef.on('connection', () => {
      console.log('response from server')
    })
  }

  const _getUserChatListing = () => {
    const apiData = {
      pageNo,
      searchText
    }

    const API_TYPE =
      bonkChatConversationsApi(apiData)

    API_TYPE.then(res => {
      if (pageNo == 1) {
        setAllUserChatListing(res?.data?.data || [])
      } else {
        setAllUserChatListing(
          [...allUserChatListing, ...res?.data?.data] || []
        )
      }
      if (res?.data?.next_page_url != null) {
        setHasMoreData(true)
      } else {
        setHasMoreData(false)
      }
      setRefreshing(false)
      setLoading(false)
    }).catch(error => {
      setHasMoreData(false)
      setRefreshing(false)
      showError(ApiError(error))
      setLoading(false)
    })
  }

  const _onRefresh = () => {
    setRefreshing(true)
    if (pageNo == 1) {
      _getUserChatListing()
    } else {
      setPageNo(1)
    }
  }

  const _onEndReached = () => {
    if (hasMoreData == true) {
      setPageNo(pageNo + 1)
    }
  }

  const deleteUser = id => {
    Alert.alert(
      strings.appName,
      'Are you sure you want delete this conservation?',
      [
        {
          text: 'Yes',
          onPress: () => {
            deleteChat(id)
          }
        },
        {
          text: 'No',
          style: 'destructive'
        }
      ]
    )
  }

  const deleteChat = id => {
    setLoading(true)
    const apiData = {
      chat_conversation_id: id
    }
    chatDelete(apiData)
      .then(res => {
        _hitFromStart()
        setLoading(false)
      })
      .catch(err => {
        console.log(err?.message)
        setLoading(false)
      })
  }

  const _renderAllUsers = useCallback(
    ({ item, index }) => {
      if (item?.last_message?.deleted_by != undefined) {
        const value = item?.last_message?.deleted_by
        var findData = value?.includes(userData?.id)
      }
      const chatParams = {
        ...item,
        prevData: item?.other_user,
        data: item,
        favorite: false
      }
      return (
        <UserMsgView
          onLongPress={() =>
            deleteUser(item?.last_message?.chat_conversation_id)
          }
          onPress={() => {
            updateChatCOunt(false)
            const parentStackNavigation = navigation?.getParent?.()?.getParent?.()
            if (parentStackNavigation?.navigate) {
              parentStackNavigation.navigate(navigationString.CHATSCREEN, chatParams)
            } else {
              navigation.navigate(navigationString.CHATSCREEN, chatParams)
            }
          }
          }
          pic={
            item?.other_user?.profile_image_thumb ||
            item?.other_user?.profile_image
          }
          name={item?.other_user?.first_name}
          lastMessage={findData !== true
            ? (
              !item?.last_message
                ? ''
                : item?.last_message?.type === 'text'
                  ? item?.last_message?.message
                  : item?.last_message?.type === 'image'
                    ? '📸  Photo'
                    : item?.last_message?.type == "location" ? "Live Location" : '♫ Audio Message')
            : 'Message Deleted'
          }
          unReadMessages={item?.unread_messages}
          msgUpdateAt={item?.last_message?.updated_at}
        />
      )
    },
    [allUserChatListing,theme]
  )

  const getTimeDifference = (timestamp) => {
    const currentTime = new Date()
    const previousTime = new Date(timestamp)
    const difference = currentTime - previousTime
    const minutes = Math.floor(difference / 60000) // 1 minute = 60000 milliseconds

    if (minutes < 1) {
      return 'Just now'
    } else if (minutes === 1) {
      return '1 minute ago'
    } else if (minutes < 60) {
      return `${minutes} minutes ago`
    } else {
      const hours = Math.floor(minutes / 60)
      if (hours === 1) {
        return '1 hour ago'
      } else if (hours < 48) {
        return `${hours} hours ago`
      }
    }
  }
  const renderAllTaps = useCallback(
    ({ item, index }) => {
      return (
        <TouchableOpacity style={styles.tapMainContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(navigationString.VIEWPROFILE, {
            prevScreenData: item?.sent_from
            // from: '_MY_MATCHES',
          })}>
          <View style={styles.userDetailContainer}>
            <View>
              <CustomImage
                source={{ uri: item?.sent_from?.profile_image }}
                style={styles.userImg}
                imgLoaderStyle={styles.userImg}
              />
              {item?.online_status && (
                <Image
                  source={imagesPath.dotIcon}
                  style={{
                    ...commonStyles.iconStyle12,
                    position: 'absolute',
                    right: 12
                  }}
                />
              )}
            </View>
            <View>
              <Text
                style={commonStyles.font_16_medium}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item?.sent_from?.first_name}
              </Text>
              <Text
                style={{
                  ...commonStyles.font_14_regular,
                  color: theme.colors.viewProfilePlaceHolder
                }}>
                {strings.viewProfile}
              </Text>
            </View>
          </View>
          <View style={styles.tapContainer}>
            <Text style={styles.viewProfileTxt}>
              {moment(item?.created_at).format('MM/DD/YYYY')}
            </Text>
            <Image
              source={imagesPath.wavingHand}
              tintColor={theme.colors.activeTintColor}
              style={commonStyles.iconStyle20}
            />
            <Text style={styles.viewProfileTxt}>{getTimeDifference(item?.created_at)}</Text>
          </View>
        </TouchableOpacity>
      )
    },
    [tapData, theme]
  )
  const _onChangeSearchText = val => {
    setTimeout(() => {
      setSearchText(val)
    }, 700)
  }
  const headerList = [
    {
      name: strings.messages,
      index: 0
    },
    {
      name: strings.taps,
      index: 1
    },
    {
      name: strings.album,
      index: 2
    }
  ]
  const handleCategoryPress = index => {
    setSelectedIndex(index)
    if (index == 1) {
      setLoading(true)
      getAllTaps()
        .then(res => {
          setLoading(false)
          setTapData(res?.data.online_likes?.data)
          console.log('Tapssss', res?.data.online_likes?.data)
        })
        .catch(error => {
          showError(ApiError(error))
          setLoading(false)
        })
    }
  }

  return (
    <WrapperContainer>
      <SafeAreaView style={styles.headerStyle}>
        {headerList.map(item => (
          <TouchableOpacity
            key={item.index}
            style={[
              selectedIndex === item.index
                ? styles.activeBtnStyle
                : styles.inActiveBtnStyle
            ]}
            onPress={() => handleCategoryPress(item.index)}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                selectedIndex === item.index
                  ? styles.activeTxtStyle
                  : styles.inActiveTxtStyle
              ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
      {userData?.is_notification_exist && (
        <View
          style={{
            position: 'absolute',
            height: moderateScale(20),
            width: moderateScale(20),
            borderRadius: moderateScale(20 / 2),
            backgroundColor: theme.colors.themecolor2,
            right: moderateScale(12),
            top: height / 18
          }}
        />
      )}
      <>
        {selectedIndex == 0
          ? (
            <FlatList
              refreshControl={
                <RefreshControl
                  refreshing={!isLoading && isRefreshing}
                  onRefresh={_onRefresh}
                />
              }
              ListHeaderComponent={
                <View style={{ backgroundColor: theme.colors.white }}>
                  <TextInputComp
                    placeholder={strings.search}
                    placeholderTextColor={theme.colors.likePink}
                    onChangeText={_onChangeSearchText}
                    textInputStyle={{ paddingVertical: moderateScale(16) }}
                  />
                  {!isLoading &&
                    Array.isArray(allUserChatListing) &&
                    allUserChatListing.length > 0 && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text
                          style={{
                            ...commonStyles.font_18_SemiBold,
                            marginVertical: moderateScale(20)
                          }}>
                          {strings.messages}
                        </Text>
                        {/* <TouchableOpacity onPress={() => { navigation.navigate(navigationString.FAVORITE_CHAT) }}>

                          <Text
                            style={{
                              ...commonStyles.font_16_SemiBold,
                              marginVertical: moderateScale(20),
                              color: theme.colors.blue,
                              textDecorationLine: 'underline'
                            }}>
                            {strings.FAVORITE_CHAT}
                          </Text>
                        </TouchableOpacity> */}
                      </View>
                    )}

                  {!isLoading && isRefreshing && (
                    <ActivityIndicator
                      animating={isRefreshing}
                      size={'large'}
                      color={theme.colors.likePink}
                      style={{ marginVertical: moderateScale(48) }}
                    />
                  )}
                </View>
              }
              stickyHeaderIndices={[0]}
              data={allUserChatListing}
              extraData={allUserChatListing}
              renderItem={_renderAllUsers}
              keyExtractor={stableKeyExtractor}
              contentContainerStyle={{
                paddingBottom: moderateScale(60)
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                !isLoading && (
                  <ListEmptyComponent
                    icon={imagesPath.ic_empty_inbox}
                    firstMessage={'There are no conversations to display'}
                    secondMessage={
                      'A list of people you’re conversing with will be displayed here'
                    }
                  />
                )
              }
              ListFooterComponent={
                hasMoreData
                  ? (
                    <ActivityIndicator
                      animating={hasMoreData}
                      size={'large'}
                      color={theme.colors.likePink}
                      style={{ marginVertical: moderateScale(48) }}
                    />
                  )
                  : (
                    <></>
                  )
              }
              onEndReached={_onEndReached}
              onEndReachedThreshold={0.5}
            />
          )
          : selectedIndex == 1
            ? (
              <>
                <FlatList
                  data={tapData}
                  extraData={tapData}
                  renderItem={renderAllTaps}
                  keyExtractor={stableKeyExtractor}
                  contentContainerStyle={{
                    paddingBottom: moderateScale(60)
                  }}
                  style={{ marginTop: moderateScale(10) }}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    !isLoading && (
                      <ListEmptyComponent
                        icon={imagesPath.ic_empty_inbox}
                        firstMessage={'No Taps yet'}
                        secondMessage={
                          'A list of people that have tapped you will be displayed here'
                        }
                      />
                    )
                  }
                  ListFooterComponent={
                    hasMoreData
                      ? (
                        <ActivityIndicator
                          animating={hasMoreData}
                          size={'large'}
                          color={theme.colors.likePink}
                          style={{ marginVertical: moderateScale(48) }}
                        />
                      )
                      : (
                        <></>
                      )
                  }
                  onEndReached={_onEndReached}
                  onEndReachedThreshold={0.5}
                />
              </>
            )
            : selectedIndex == 2
              ? (
                <>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => navigation.navigate(navigationString.ALL_GALLERY_IMAGES, {
                      showBottomBtn: true,
                      privateAlbum: false
                    })}
                      style={{
                        height: moderateScaleVertical(110),
                        width: moderateScale(110),
                        backgroundColor: theme.colors.lightGray,
                        borderRadius: moderateScale(8),
                        marginTop: moderateScaleVertical(30),
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                      <View style={{ alignItems: 'center' }}>
                        <Image source={imagesPath.album} tintColor={ isDark ? theme.colors.grey : null} />
                        <Text
                          style={{
                            fontSize: textScale(14),
                            color: isDark ? theme.colors.blackOpacity40 : theme.colors.themecolor2,
                            marginTop: moderateScaleVertical(6)
                          }}>
                          Gallery
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate(navigationString.ALL_PRIVATE_GALLERY_IMAGES, {
                      showBottomBtn: true,
                      privateAlbum: true
                    })}
                      style={{
                        height: moderateScaleVertical(110),
                        width: moderateScale(110),
                        backgroundColor: theme.colors.lightGray,
                        borderRadius: moderateScale(8),
                        marginTop: moderateScaleVertical(30),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: moderateScale(10)
                      }}>
                      <View style={{ alignItems: 'center' }}>
                        <Image source={imagesPath.album1} />
                        <Text
                          style={{
                            fontSize: textScale(14),
                            color: isDark ? theme.colors.blackOpacity40 : theme.colors.themecolor2,
                            marginTop: moderateScaleVertical(6)
                          }}>
                          Private Gallery
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )
              : (
                <></>
              )}
      </>

      {/* <Modal
        animationType="slide" // You can use "fade", "slide", or "none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // For Android back button
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>Favorite Chat </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>Chat Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  )
}

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.blackOpacity50
  },
  lineView: {
    borderColor: theme.colors.likePink,
    borderWidth: 0.5,
    width: '100%',
    marginTop: moderateScale(16),
    alignSelf: 'flex-end',
    opacity: 0.5
  },
  searchView: {
    flexDirection: 'row',
    borderRadius: moderateScale(12),
    bordercolor: theme.colors.blackOpacity40,
    borderWidth: moderateScale(0.5),
    height: moderateScale(48),
    marginTop: moderateScale(24),
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    marginBottom: moderateScale(24)
  },
  itemStyle: {
    flexDirection: 'column',
    flex: 0.2,
    alignItems: 'flex-end',
    marginRight: 14,
    marginTop: moderateScale(6)
  },
  imgStyle: {
    height: moderateScale(52),
    width: moderateScale(52),
    borderRadius: moderateScale(26)
  },
  nameStyle: {
    flexDirection: 'column',
    flex: 0.6,
    marginTop: moderateScale(6)
  },
  nameText: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.black,
    textTransform: 'capitalize'
  },
  msgStyle: {
    backgroundColor: theme.colors.themeColor,
    height: moderateScale(22),
    width: moderateScale(22),
    borderRadius: moderateScale(11),
    marginTop: moderateScale(4),
    justifyContent: 'center'
  },
  timeStyle: {
    ...commonStyles.font_10_medium,
    color: theme.colors.black
  },
  numStyle: {
    ...commonStyles.font_10_medium,
    alignSelf: 'center'
  },
  absolute: {
    position: 'absolute',
    top: moderateScale(120),
    left: 0,
    bottom: 0,
    right: 0
  },
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    // marginTop: moderateScale(20)
  },
  activeTxtStyle: {
    ...commonStyles.font_13_medium,
    color: theme.colors.primaryWhite
  },
  inActiveTxtStyle: {
    ...commonStyles.font_13_medium,
    color: theme.colors.blackOpacity70
  },
  inActiveBtnStyle: {
    paddingVertical: moderateScale(10),
    width: '30%',
    alignItems: 'center',
    borderRadius: moderateScale(20)
  },
  activeBtnStyle: {
    paddingVertical: moderateScale(10),
    width: '30%',
    alignItems: 'center',
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.themecolor2
  },
  tapMainContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: moderateScale(10)
  },
  userImg: {
    ...commonStyles.iconStyle48,
    marginRight: moderateScale(10)
  },

  viewProfileTxt: {
    ...commonStyles.font_12_regular,
    color: theme.colors.viewProfilePlaceHolder
  },
  userDetailContainer: {
    flex: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  tapContainer: {
    width: moderateScale(80),
    alignItems: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: theme.colors.msgBlue,
    padding: 15,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: theme.colors.red,
    padding: 15,
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
  },
  modalContainer: {
    width: 300,
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
  },
})

// make this component available to the app
export default MessageScreen
