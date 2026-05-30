import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react'
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    FlatList,
    RefreshControl,
    StyleSheet
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import ListEmptyComponent from '../../Components/ListEmptyComponent'
import { Loader } from '../../Components/Loader'
import UserMsgView from '../../Components/UserMsgView'
import WrapperContainer from '../../Components/WrapperContainer'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import {
    chatDelete,
    getChatCount,
    saveChatCounter
} from '../../redux/reduxActions/chatActions'
import colors from '../../styles/colors'
import {
    moderateScale,
    textScale
} from '../../styles/responsiveSize'

import notifee from '@notifee/react-native'
import { enableFreeze } from 'react-native-screens'
import HeaderComp from '../../Components/HeaderComp'
import { favoriteChatList } from '../../redux/reduxActions/chatActions'
import { updateChatCOunt } from '../../redux/reduxActions/homeActions'
import fontFamily from '../../styles/fontFamily'
import { ApiError, showError } from '../../utils/helperFunctions'
import { stableKeyExtractor } from '../../utils/stableKeyExtractor'
import { ConnectingSocket, socketRef } from '../../utils/utils'
import { useTheme } from '../../theme/ThemeProvider'
import { getCommonStyles } from '../../styles/commonStyles'
enableFreeze()
// create a component
const FavoriteChat = props => {
    const {theme} = useTheme();
    const commonStyles = getCommonStyles(theme);
    const styles = getStyles(theme, commonStyles)
    const { navigation } = props
    const userData = useSelector(state => state?.authReducers?.userData || {})
    const listRef = useRef(null)
    const [isLoading, setLoading] = useState(true)
    const [allUserChatListing, setAllUserChatListing] = useState([])
    const [pageNo, setPageNo] = useState(1)
    const [hasMoreData, setHasMoreData] = useState(false)
    const [isRefreshing, setRefreshing] = useState(false)
    const [searchText, setSearchText] = useState('')
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
        favoriteChatList()
            .then(res => {
                console.log("res1454", JSON.stringify(res));

                setAllUserChatListing(res?.data?.data)
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
                prevData: item?.other_user,
                data: item,
                favorite: true
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
        [allUserChatListing]
    )







    return (

        <WrapperContainer isSafeAreaAvailable>
            <HeaderComp
                leftIcon={imagesPath.ic_back}
                onPressBack={() => navigation.goBack()}
                centerText={strings.FAVORITE_CHAT}
                centertextstyle={{ fontSize: textScale(18), fontFamily: fontFamily.bold }}
            />

            <FlatList
                refreshControl={
                    <RefreshControl
                        refreshing={!isLoading && isRefreshing}
                        onRefresh={_onRefresh}
                    />
                }

                data={allUserChatListing}
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
        backgroundColor: theme.colors.fadeGray
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
        marginTop: moderateScale(20)
    },
    activeTxtStyle: {
        ...commonStyles.font_13_medium
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
        color: colors.viewProfilePlaceHolder
    },
    userDetailContainer: {
        flex: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    tapContainer: {
        width: moderateScale(80),
        alignItems: 'center'
    }
})

// make this component available to the app
export default FavoriteChat
