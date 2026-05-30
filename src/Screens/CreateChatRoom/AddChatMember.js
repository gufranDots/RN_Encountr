import moment from 'moment';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
} from 'react-native';
import { useSelector } from 'react-redux'

import HeaderComp from '../../Components/HeaderComp';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import { Loader } from '../../Components/Loader';
import TextInputComp from '../../Components/TextInputComp';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import colors from '../../styles/colors';
import  { getCommonStyles, hitSlopProp } from '../../styles/commonStyles';
import {
  moderateScale,
  moderateScaleVertical,
} from '../../styles/responsiveSize';
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions';
import { enableFreeze } from 'react-native-screens';
import CustomImage from '../../Components/CustomImage';
import { addMembers, getChatMembers, saveUserGroupListingToStore } from '../../redux/reduxActions/chatActions';
import { navigationString } from '../../constants';
import ButtonComp from '../../Components/ButtonComp';
import { useTheme } from '../../theme/ThemeProvider';
import { stableKeyExtractor } from '../../utils/stableKeyExtractor';

enableFreeze();
// create a component
const AddChatMember = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles)
  const { navigation,route } = props;

  const userData = useSelector(state => state?.authReducers?.userData || {});

  const listRef = useRef(null);

  const [isLoading, setLoading] = useState(true);
  const [userListing, setUserListing] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newMembers, setNewMembers] = useState([])
  const groupUsers = useSelector((state) => state?.homeReducers?.groupUsers)
  const {groupId,addMember} = route?.params

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      _hitFromStart();
    });
    return unsubscribe;
  }, [pageNo]);

  useEffect(() => {
    _hitFromStart();
  }, [searchText]);

  useEffect(() => {
    _getUserChatListing();
  }, [pageNo]);

  const _hitFromStart = () => {
    if (pageNo === 1) {
      _getUserChatListing();
    } else {
      setPageNo(1);
    }
    _scrollTop();
  };


  const _scrollTop = () => {
    if (listRef.current) {
      listRef.current?.scrollToOffset({ y: 0, animated: true });
    }
  };

  const _getUserChatListing = () => {
    const apiData = {
      pageNo:pageNo,
      searchText:searchText,
    }
    getChatMembers(apiData).then(res => {
      if (pageNo == 1) {
          setUserListing(res?.data?.data || []);
      } else {
        setUserListing(
          [...userListing, ...res?.data?.data] || [],
        );
      }
      if (res?.data?.next_page_url != null) {
        setHasMoreData(true);
      } else {
        setHasMoreData(false);
      }
      setRefreshing(false);
      setLoading(false);
    }).catch(error => {
      setHasMoreData(false);
      setRefreshing(false);
      showError(ApiError(error));
      setLoading(false);
    });
  };

  const _onRefresh = () => {
    setRefreshing(true);
    if (pageNo == 1) {
      _getUserChatListing();
    } else {
      setPageNo(1);
    }
  };

  const _onEndReached = () => {
    if (hasMoreData == true) {
      setPageNo(pageNo + 1);
    }
  };


  const onJoinBtnPress = async (data) => {

    if (addMember == 1) {
      setNewMembers(prevSelectedItems => [...prevSelectedItems, data?.id]);
    }else{
      const modifiedUserData = {
        id: data.id,
        image: data.profile_image,
        name: data.full_name
      };
      await saveUserGroupListingToStore(modifiedUserData);
      navigation.navigate(navigationString.CREATE_CHAT_ROOM,{addMember: 3});
    } 
  };
  
  const onAddUserPress =  () => {

    setLoading(true)
    let payload = {
      group_id: groupId,
      user_id: newMembers,
    };
    console.log("payload",payload);

    addMembers(payload)
      .then(async res => {
        if (res?.data) {
          // await resetGroupList();
          showSuccess(res?.message)
          navigation.navigate(navigationString.GROUP_LIVE_SCREEN)
          // navigation.navigate(navigationString.GROUP_LIVE_SCREEN, {
          //   addMember: addMember
          // })
          setLoading(false)
          return
        }
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
    // navigation.goBack()
  }

  const _renderAllUsers = useCallback(
    ({ item, index }) => {
      const idExists = (id, array) => array.includes(id);
      const isJoined = groupUsers.some(user => user.id === item.id) || idExists(item.id, newMembers);
      return (
        // <></>
        <View style={styles.tapMainContainer}
          activeOpacity={0.8}>
          <View style={styles.userDetailContainer}>
            <View>
              <CustomImage
                source={item?.profile_image ? { uri: item?.profile_image }: imagesPath.profileimage}
                style={styles.userImg}
                imgLoaderStyle={styles.userImg}
                imgLoaderSize={ Platform.OS == 'android' ? moderateScale(20): 'small'}
              />
              {!!item?.online_status && (
                <Image
                  source={imagesPath.dotIcon}
                  style={{
                    ...commonStyles.iconStyle12,
                    position: 'absolute',
                    right: 12,
                  }}
                />
              )}
            </View>
            <View>
              <Text
                style={[commonStyles.font_16_medium,{width:'98%'}]}
                numberOfLines={4}
                ellipsizeMode="tail">
                {item?.full_name }
              </Text>
              {/* <Text
                style={{
                  ...commonStyles.font_14_regular,
                  color: colors.viewProfilePlaceHolder,
                }}>
                {strings.viewProfile}
              </Text> */}
            </View>
          </View>
          <TouchableOpacity  
            activeOpacity={0.8}
            hitSlop={hitSlopProp} 
            disabled={isJoined? true: false}
            onPress={() => onJoinBtnPress(item)}
            style={[styles.btnContainer, !isJoined ?  styles.activeBorderColor: styles.inActiveBorderColor]}>
            <Text style={{...commonStyles.font_12_regular, color: !isJoined ? theme.colors.dullGray : theme.colors.activeTintColor}}>{isJoined ? strings.Joined : strings.Invite}</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [userListing, newMembers],
  );

  let timeoutId;
  const _onChangeSearchText = val => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setSearchText(val);
    }, 800);
  };

  return (
    <WrapperContainer isSafeAreaAvailable>
      <HeaderComp
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
        centerText={strings.People}
        centertextstyle={{
          ...commonStyles.font_20_bold,
          color: theme.colors.black
        }}
      />
      <>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={!isLoading && isRefreshing}
              onRefresh={_onRefresh}
            />
          }
          ListHeaderComponent={
            <View style={{ backgroundColor:theme.colors.white, marginBottom:moderateScaleVertical(20) }}>
              <TextInputComp
                placeholder={strings.search}
                placeholderTextColor={theme.colors.likePink}
                onChangeText={_onChangeSearchText}
                textInputStyle={{ paddingVertical: moderateScale(16)}}
                inputView={styles.searchContainer}
              />
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
          // stickyHeaderIndices={[0]}
          data={userListing}
          extraData={userListing}
          renderItem={_renderAllUsers}
          keyExtractor={stableKeyExtractor}
          contentContainerStyle={{
            paddingBottom: moderateScale(5),
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading && (
              <ListEmptyComponent
                firstMessage={strings.No_Data_Available}
              />
            )
          }
          // ListFooterComponent={
          //   hasMoreData ? (
          //     <ActivityIndicator
          //       animating={hasMoreData}
          //       size={'large'}
          //       color={colors.likePink}
          //     />
          //   ) : (
          //     <></>
          //   )
          // }
          onEndReached={_onEndReached}
          onEndReachedThreshold={0.5}
        />

        {addMember == 1 ? (
          <ButtonComp
          btnText={strings.ADD_USER}
          onPressBtn={onAddUserPress}
          btnStyle={styles.addBtnStyle}
          />
        ):null}
        <Loader isLoading={isLoading} />
      </>
    </WrapperContainer>
  );
};

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundGrey,
  },
  lineView: {
    borderColor: theme.colors.likePink,
    borderWidth: 0.5,
    width: '100%',
    marginTop: moderateScale(16),
    alignSelf: 'flex-end',
    opacity: 0.5,
  },
  searchView: {
    flexDirection: 'row',
    borderRadius: moderateScale(12),
    borderColor: theme.colors.blackOpacity40,
    borderWidth: moderateScale(0.5),
    height: moderateScale(48),
    marginTop: moderateScale(24),
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    marginBottom: moderateScale(24),
  },
  itemStyle: {
    flexDirection: 'column',
    flex: 0.2,
    alignItems: 'flex-end',
    marginRight: 14,
    marginTop: moderateScale(6),
  },
  imgStyle: {
    height: moderateScale(52),
    width: moderateScale(52),
    borderRadius: moderateScale(26),
  },
  nameStyle: {
    flexDirection: 'column',
    flex: 0.6,
    marginTop: moderateScale(6),
  },
  nameText: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.black,
    textTransform: 'capitalize',
  },
  msgStyle: {
    backgroundColor: theme.colors.themeColor,
    height: moderateScale(22),
    width: moderateScale(22),
    borderRadius: moderateScale(11),
    marginTop: moderateScale(4),
    justifyContent: 'center',
  },
  timeStyle: {
    ...commonStyles.font_10_medium,
    color: theme.colors.black,
  },
  numStyle: {
    ...commonStyles.font_10_medium,
    alignSelf: 'center',
  },
  absolute: {
    position: 'absolute',
    top: moderateScale(120),
    left: 0,
    bottom: 0,
    right: 0,
  },
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    marginTop: moderateScale(20),
  },
  activeTxtStyle: {
    ...commonStyles.font_13_medium,
  },
  inActiveTxtStyle: {
    ...commonStyles.font_13_medium,
    color: theme.colors.blackOpacity70,
  },
  inActiveBtnStyle: {
    paddingVertical: moderateScale(10),
    width: '30%',
    alignItems: 'center',
    borderRadius: moderateScale(20),
  },
  activeBtnStyle: {
    paddingVertical: moderateScale(10),
    width: '30%',
    alignItems: 'center',
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.themecolor2,
  },
  tapMainContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:'center',
    paddingVertical: moderateScale(15),
  },
  userImg: {
    ...commonStyles.iconStyle48,
    marginRight: moderateScale(10),
  },

  viewProfileTxt: {
    ...commonStyles.font_12_regular,
    color: theme.colors.viewProfilePlaceHolder,
  },
  userDetailContainer: {
    flex: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tapContainer: {
    flex: 2,
    alignItems: 'center',
  },
  btnContainer:{
    alignItems:'center',
    justifyContent:'center',
    height:moderateScaleVertical(25),
    width: '20%',
    borderWidth:moderateScale(1),
    borderRadius:moderateScale(50)
  },
  activeBorderColor:{
    borderColor:theme.colors.dullGray
    
  },
  inActiveBorderColor:{
    borderColor:theme.colors.activeTintColor,
    backgroundColor: theme.colors.florsentTheme
  },
  searchContainer:{
    backgroundColor:theme.colors.backgroundBlue, 
    borderWidth:0
  },
  addBtnStyle:{
    marginBottom:moderateScale(25)
  }
});

// make this component available to the app
export default AddChatMember;
