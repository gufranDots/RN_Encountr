//import liraries
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { WrapperContainer } from '../../Components';
import colors from '../../styles/colors';
import imagesPath from '../../constants/imagesPath';
import Modal from 'react-native-modal';
import { moderateScale, moderateScaleVertical, textScale, width } from '../../styles/responsiveSize';
import { FlatList } from 'react-native-gesture-handler';
import CustomImage from '../../Components/CustomImage';
import fontFamily from '../../styles/fontFamily';
import navigationString from '../../constants/navigationString';
import {
  deleteChatGroup,
  exitGroupApi,
  muteUnmuteNotificationApi,
  resetGroupList,
} from '../../redux/reduxActions/chatActions';
import { Loader } from '../../Components/Loader';
import { showError, showSuccess } from '../../utils/helperFunctions';
import { useSelector } from 'react-redux';
import FastImage from '../../utils/FastImageCompat';
import moment from 'moment';
import HomeComponent from '../../Components/HomeComponent';
import MemberComponent from '../../Components/MemberComponent';
import { useTheme } from '../../theme/ThemeProvider';
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// create a component
const ViewMemberGroup = ({ navigation, route }) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const commonStyles= getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles)
  const numColumns = 3;
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const groupData = route?.params?.roomMemberData;
  const [memberData, setMemberData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleDeteils, setModalVisibleDeteils] = useState(false);
  const [myItemData, setMyItemData] = useState({});
  const [loading, setLoading] = useState(false);
  const [mute, setMute] = useState(false);
  var groupId = route?.params?.roomMemberData?.id;
  var adminId = route?.params?.roomMemberData?.admin_id;
  let notify_muted_by = route?.params?.roomMemberData?.notify_muted_by;

  useEffect(() => {
    const members = route?.params?.roomMemberData?.members || [];
    setMemberData(members);

    const result =
      members.find(
        item =>
          item?.user_id === userData?.id || item?.user?.id === userData?.id,
      ) || {};

    setMyItemData(result);
  }, [route?.params?.roomMemberData, userData?.id]);

  const viewProfile = item => {
    const FindAdminId = item?.user?.id;
    if (userData?.id === FindAdminId) {
      navigation.navigate(navigationString.PROFILESCREEN);
    } else {
      navigation.navigate(navigationString.VIEWPROFILE, {
        prevScreenData: item?.user,
        room_typr: 2,
      });
    }
  };

  const onAddMemberPress = () => {
    setModalVisible(false);
    navigation.navigate(navigationString.ADD_CHAT_MEMBER, {
      addMember: 1,
      groupId: groupData?.id,
    });
  };

  const onEditGroupPress = () => {
    setModalVisible(false);
    navigation.navigate(navigationString.CREATE_CHAT_ROOM, {
      addMember: 2,
      groupDetails: groupData,
    });
  };
  const onClose = () => {
    setModalVisible(!modalVisible);
  };
  const onCloseDeteilsModel = () => {
    setModalVisibleDeteils(!modalVisibleDeteils);
  };
  const onPressDeleteAccount = () => {
    setModalVisible(!modalVisible);
    Alert.alert('', 'Are you sure you want to delete your account?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: () => deleteAccountApi() },
    ]);
  };
  const deleteAccountApi = () => {
    console.log('fffaa', groupId);
    setLoading(true);
    payload = { chat_conversation_id: groupId };
    deleteChatGroup(payload)
      .then(async res => {
        navigation.navigate(navigationString.GROUP_LIVE_SCREEN);
        showSuccess(res?.message);
        // viewChat()
        setLoading(false);
        return;
      })
      .catch(error => {
        setLoading(false);
        // showError(ApiError(error));
      });
  };

  useEffect(() => {
    setMute(!!notify_muted_by);
  }, []);

  const viewChat = () => {
    resetGroupList();
    navigation.goBack();
  };
  const onPressMuteAndUnmuteNotification = async () => {
    try {
      const response = await muteUnmuteNotificationApi({
        group_id: groupId,
      });
      console.log('MuteResponse: ' + JSON.stringify(response));
      if (response?.success) {
        // setMute(!mute);
        showSuccess(myItemData?.is_notify !== "1" ? 'Unmute Successfully' : 'Mute Successfully');
        navigation.navigate(navigationString?.GROUP_LIVE_SCREEN);
      }
    } catch (error) {
      console.log(error);
      showError(error?.message || 'Something went wrong');
    }
  };


  const onPressExitGroupAlert = () => {
    Alert.alert('', 'Are you sure you want to exit this group?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: () => onPressExitGroup() },
    ]);
  };

  const onPressExitGroup = async () => {
    try {
      const response = await exitGroupApi({
        chat_conversation_id: groupId,
        user_id: userData?.id
      });
      if (response?.success) {
        showSuccess(response?.message)
        navigation.navigate(navigationString?.GROUP_LIVE_SCREEN);
      }
    } catch (error) {
      console.log(error);
      showError(error?.message || 'Something went wrong');
    }
  };


  const onPressDeleteUser = (FindAdminId) => {
    Alert.alert('', 'Are you sure you want to delete this user?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: () => deleteUserByAdmin(FindAdminId) },
    ]);
  };




  const deleteUserByAdmin = async (userID) => {
    setLoading(true)
    try {
      const response = await exitGroupApi({
        chat_conversation_id: groupId,
        user_id: userID
      });
      if (response?.success) {
        showSuccess(response?.message)
        setLoading(false)
        navigation.navigate(navigationString?.GROUP_LIVE_SCREEN);
      }
    } catch (error) {
      setLoading(false)
      console.log(error);
      showError(error?.message || 'Something went wrong');
    }
  };


  const renderProfileListItem = useCallback(
    ({ item, index }) => {
      const FindAdminId = item?.user?.id
      return (
        <MemberComponent
          item={item}
          index={index}
          AdminId={adminId}
          onPress={() => viewProfile(item)}
          onLongPress={() => { adminId == userData?.id ? onPressDeleteUser(FindAdminId) : null }}
        />
      );
    },
    [memberData],
  );

  return (
    <WrapperContainer
      paddingAvailable={false}
      statusBarAvailable={false}
      mainViewStyle={{ backgroundColor: theme.colors.white }}
      isSafeAreaAvailable={false}>
      <View style={{ flex: 1 }}>
        <View style={{backgroundColor: theme.colors.white}}>
          <StatusBar
            backgroundColor={theme.colors.white}
            barStyle="light-content"
            translucent={Platform.OS === 'android'}
          />
          <View style={[styles.headerRow, {paddingTop: insets.top + moderateScale(8)}]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.boxView}
              hitSlop={hitSlopProp}>
              <Image source={imagesPath.ic_back} style={styles.headerIcon} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <CustomImage
                source={{ uri: groupData?.group_image }}
                imgLoaderStyle={styles.itemImage}
                style={styles.itemImage}
              />
              <Text
                numberOfLines={2}
                style={styles.headerTitle}>
                {groupData?.group_name || 'Group'}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={onPressMuteAndUnmuteNotification}
                style={styles.boxView}>
                <FastImage
                  resizeMode="contain"
                  style={styles.headerActionIcon}
                  source={myItemData?.is_notify == "1" ? imagesPath.volume : imagesPath.mute}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(!modalVisible)}
                style={[styles.boxView, {marginHorizontal: moderateScale(6)}]}>
                <Image
                  style={styles.headerIcon}
                  resizeMode="contain"
                  source={imagesPath.ic_dot}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={viewChat} style={styles.boxView}>
                <Image
                  style={[styles.headerIcon, {width: moderateScale(14), height: moderateScale(14)}]}
                  source={imagesPath.crossnew}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.blackOpacity20,
            borderRadius: moderateScale(10),
            marginTop: moderateScale(12),
            marginHorizontal: moderateScale(12),
            marginBottom: moderateScale(12),
            overflow: 'hidden',
          }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={memberData}
            renderItem={renderProfileListItem}
            keyExtractor={(item, index) =>
              String(item?.id || item?.user?.id || item?.user_id || index)
            }
            numColumns={numColumns}

            extraData={memberData || []}
            bounces={true}
          />
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={onClose}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { alignItems: 'center', }]}>
              <TouchableOpacity
                onPress={() => onClose()}
                style={{
                  position: 'absolute',
                  alignSelf: 'flex-end',
                  backgroundColor: theme.colors.red,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: moderateScale(30),
                  borderRadius: moderateScale(20),
                  height: moderateScale(30),
                  top: moderateScale(-10),
                  right: moderateScale(-10)
                }}>
                <Image
                  style={{ tintColor: theme.colors.white }}
                  source={imagesPath.crossnew}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false)
                  setTimeout(() => {
                    setModalVisibleDeteils(!modalVisibleDeteils)
                  }, 200)
                }
                }
                style={styles.buttonView}>
                <Text
                  style={{
                    ...commonStyles.font_14_SemiBold,
                    color: theme.colors.primaryWhite,
                  }}>
                  Group Info
                </Text>
              </TouchableOpacity>

              {groupData?.chat_type !== 'universal' ? (
                <View style={styles.Seprater}></View>
              ) : null}

              {(groupData?.chat_type !== 'universal' && userData?.id == adminId) ? (
                <TouchableOpacity
                  onPress={() => onAddMemberPress()}
                  style={styles.buttonView}>
                  <Text
                    style={{
                      ...commonStyles.font_14_SemiBold,
                      color: theme.colors.white,
                    }}>
                    Add Member
                  </Text>
                </TouchableOpacity>
              ) : null}

              {(groupData?.chat_type !== 'universal' && userData?.id == adminId) ? (
                <View style={styles.Seprater}></View>
              ) : null}

              {(groupData?.chat_type !== 'universal' && userData?.id == adminId) ? (
                <TouchableOpacity
                  onPress={() => onEditGroupPress()}
                  style={styles.buttonView}>
                  <Text
                    style={{
                      ...commonStyles.font_14_SemiBold,
                      color: theme.colors.white,
                    }}>
                    Edit Group
                  </Text>
                </TouchableOpacity>
              ) : null}

              {(groupData?.chat_type !== 'universal' && userData?.id == adminId) ? (
                <View style={styles.Seprater}></View>
              ) : null}

              {(userData?.id !== adminId && groupData?.chat_type != 'universal') ? (
                <TouchableOpacity
                  onPress={() => onPressExitGroupAlert()}
                  style={styles.buttonView}>
                  <Text
                    style={{
                      ...commonStyles.font_14_SemiBold,
                      color: theme.colors.white,
                    }}>
                    Exit Group
                  </Text>
                </TouchableOpacity>
              ) : null}

              {(userData?.id !== adminId && groupData?.chat_type != 'universal') ? (
                <View style={styles.Seprater}></View>
              ) : null}


              {(groupData?.chat_type !== 'universal' && userData?.id == adminId) ? (
                <TouchableOpacity
                  onPress={() => onPressDeleteAccount()}
                  style={styles.buttonView}>
                  <Text
                    style={{
                      ...commonStyles.font_14_SemiBold,
                      color: theme.colors.white,
                    }}>
                    Delete Group
                  </Text>
                </TouchableOpacity>
              ) : null}

            </View>
          </View>
        </Modal>





        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisibleDeteils}
          onRequestClose={onClose}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                onPress={() => onCloseDeteilsModel()}
                style={{
                  position: 'absolute',
                  alignSelf: 'flex-end',
                  backgroundColor: theme.colors.red,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: moderateScale(30),
                  borderRadius: moderateScale(20),
                  height: moderateScale(30),
                  top: moderateScale(-10),
                  right: moderateScale(-10)

                }}>
                <Image
                  style={{ tintColor: theme.colors.white }}
                  source={imagesPath.crossnew}
                />
              </TouchableOpacity>


              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: moderateScale(20) }}>
                <Text style={{ color: theme.colors.black, fontSize: moderateScale(16), fontFamily: fontFamily.SemiBold }}>Group Create</Text>
                <Text style={{ color: theme.colors.black, fontSize: moderateScale(16), fontFamily: fontFamily.SemiBold }}>{moment(groupData?.created_at).format('DD MMM YYYY')}</Text>



              </View>



            </View>
          </View>
        </Modal>



      </View>
      <Loader isLoading={loading} />
    </WrapperContainer>
  );
};

const getStyles = (theme, commonStyles) => StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.blackOpacity10,
  },
  boxView: {
    borderColor: theme.colors.activeTintColor,
    height: moderateScale(38),
    width: moderateScale(38),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    height: moderateScale(16),
    width: moderateScale(16),
    tintColor: theme.colors.activeTintColor,
  },
  headerActionIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: moderateScale(8),
  },
  headerTitle: {
    flex: 1,
    marginLeft: moderateScale(8),
    ...commonStyles.font_16_SemiBold,
    color: theme.colors.florsentTheme,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    marginTop: 20,
  },
  item: {
    justifyContent: 'center',
    width: width / 3.3,
    height: moderateScale(120),
    borderWidth: 1,
    borderColor: theme.colors.primaryWhite,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemText: {
    position: 'absolute',
    bottom: 0,
    marginLeft: moderateScale(5),
    fontSize: textScale(12),
    color: theme.colors.primaryWhite,
    fontFamily: fontFamily.bold,
  },
  adminText: {
    fontFamily: fontFamily.bold,
    color: theme.colors.red,
    fontSize: moderateScale(10),
  },
  itemImage: {
    borderWidth: 2,
    borderColor: theme.colors.primaryWhite,
    borderRadius: moderateScale(20),
    height: moderateScale(36),
    width: moderateScale(36),
  },
  btnViewSty: {
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 30,
  },
  btnSty: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: moderateScale(40),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.white,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '80%',
    backgroundColor: theme.colors.backgroundGrey,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(20),
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
    backgroundColor: theme.colors.gray2,
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
  Seprater: {
    width: '100%',
    height: '1%',
    backgroundColor: theme.colors.gray2,
    marginVertical: moderateScale(10),
  },
  buttonView: {
    backgroundColor: theme.colors.themecolor2,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(10),
    marginTop: moderateScale(1),
  },
});

export default ViewMemberGroup;
