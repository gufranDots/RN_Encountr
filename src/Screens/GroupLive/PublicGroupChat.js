import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import strings from '../../constants/Languages';
import imagesPath from '../../constants/imagesPath';
import WrapperContainer from '../../Components/WrapperContainer';
import {
    moderateScale,
    moderateScaleVertical,
    textScale,
    width,
} from '../../styles/responsiveSize';
import fontFamily from '../../styles/fontFamily';
import ButtonComp from '../../Components/ButtonComp';
import { navigationString } from '../../constants';
import { groupChatConversations } from '../../redux/reduxActions/homeActions';
import { deleteGroupChatConversation } from '../../redux/reduxActions/chatActions';
import { Loader } from '../../Components/Loader';
import HeaderComp from '../../Components/HeaderComp';
import CustomImage from '../../Components/CustomImage';
import { ApiError, showError, showSuccess } from '../../utils/helperFunctions';
import { stableKeyExtractor } from '../../utils/stableKeyExtractor';
import { useTheme } from '../../theme/ThemeProvider';


const PublicGroupChat = ({ navigation }) => {
    const  {theme} = useTheme();
    const styles = getStyles(theme);
    const [data, setData] = useState([]);
    const [publicMemberImg, setPublicMemberImg] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [hasMoreData, setHasMoreData] = useState(false);
    const [pageNo, setPageNo] = useState(1);
    const [isRefreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);


    useEffect(() => {
        chatApiCalling()
    }, [])


    const chatApiCalling = () => {
        groupChatConversations()
            .then(res => {
                const filterDataPublic = res?.data?.data.filter((item) => { return item?.chat_type == 'public' })
                setData(filterDataPublic)
                setPublicMemberImg(filterDataPublic[0]?.members)
                setLoading(false);
                setRefreshing(false);
            })
            .catch(error => {
                setLoading(false);
                setRefreshing(false);
                showError(ApiError(error));
            });
    };


    const _onEndReached = () => {
        if (hasMoreData == true) {
            setPageNo(pageNo + 1);
        }
    };

    const _onRefresh = () => {
        setRefreshing(true);
        if (pageNo == 1) {
            chatApiCalling();
        } else {
            setPageNo(1);
        }
    };

    const onPressDeleteforMe = () => {
        if (!selectedItem || isDeleting) return;
        
        setIsDeleting(true);
        const payload = {
            chat_conversation_id: selectedItem.id
        };
        
        deleteGroupChatConversation(payload)
            .then(res => {
                showSuccess(res?.message || 'Chat room deleted successfully');
                setModalVisible(false);
                setSelectedItem(null);
                setIsDeleting(false);
                // Refresh the list
                chatApiCalling();
            })
            .catch(error => {
                showError(ApiError(error));
                setModalVisible(false);
                setSelectedItem(null);
                setIsDeleting(false);
            });
    };


    const _renderAllUsers = ({ item, index }) => {
        return (

            <TouchableOpacity onLongPress={()=>{
                setSelectedItem(item);
                setModalVisible(true);
            }}
                style={{
                    padding: moderateScale(14),
                    borderRadius: moderateScale(12),
                    backgroundColor: theme.colors.white,
                    marginTop: moderateScaleVertical(34)
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                        style={{
                            fontSize: textScale(20),
                            color: theme.colors.activeTintColor,
                            fontFamily: fontFamily.SemiBold,
                        }}>
                        {item?.group_name}
                    </Text>
                </View>

                {/* <Text
                    style={{
                        fontSize: textScale(16),
                        color: theme.colors.grey,
                        marginTop: moderateScaleVertical(10),
                    }}>
                    There are many variations of passages of Lorem Ipsum available.
                </Text> */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: moderateScaleVertical(20),
                        justifyContent: 'space-between',
                        marginBottom: moderateScaleVertical(10),
                    }}>
                    <View style={{ flex: 0.6, flexDirection: 'row', alignItems: 'center' }}>
                        {item?.members?.slice(0, 7).map((items, index) => {
                            return (
                                <CustomImage
                                    source={{ uri: items?.user?.profile_image }}
                                    imgLoaderStyle={{
                                        borderWidth: 2,
                                        borderColor: theme.colors.white,
                                        borderRadius: moderateScale(20),
                                        right: index == 0 ? 0 : moderateScale(6 * index + 2),
                                        zIndex: -index,
                                        height: moderateScale(30),
                                        width: moderateScale(30),
                                    }}
                                    style={{
                                        borderWidth: 2,
                                        borderColor: theme.colors.white,
                                        borderRadius: moderateScale(20),
                                        right: index == 0 ? 0 : moderateScale(6 * index + 2),
                                        zIndex: -index,
                                        height: moderateScale(30),
                                        width: moderateScale(30),
                                    }}
                                />
                            );
                        })}
                    </View>

                    <View style={{ flex: 0.35 }}>
                        <ButtonComp
                            btnView={{
                                borderRadius: moderateScale(40),
                                height: moderateScaleVertical(38),
                                backgroundColor: theme.colors.orangenew,
                            }}
                            onPressBtn={() => {
                                navigation.navigate(navigationString.CHATSCREEN, {
                                    prevData: item?.other_user,
                                    data: item,
                                    MemberImg: item?.members,
                                    public: true
                                })
                            }}
                            txtStyle={{ fontSize: textScale(12) }}
                            btnStyle={{
                                borderRadius: moderateScale(40),
                                width: moderateScale(120),
                            }}
                            btnText={'Enter now'}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <WrapperContainer
            statusbarcolorr={theme.colors.backgroundBlue}
            mainViewStyle={{ backgroundColor: theme.colors.backgroundBlue }}
            isSafeAreaAvailable={true}>
            <HeaderComp
                leftIcon={imagesPath.ic_back}
                onPressBack={() => navigation.goBack()}
                centerText={strings.PublicChatRoom}
                centertextstyle={{ fontSize: textScale(18), fontFamily: fontFamily.bold }}
            />
            <FlatList
                showsVerticalScrollIndicator={false}
                data={data}
                bounces={true}
                renderItem={_renderAllUsers}
                keyExtractor={stableKeyExtractor}
                refreshControl={
                    <RefreshControl
                        refreshing={!isLoading && isRefreshing}
                        onRefresh={_onRefresh}
                    />
                }
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

                    <ActivityIndicator
                        animating={hasMoreData}
                        size={'large'}
                        color={theme.colors.likePink}
                        style={{ marginVertical: moderateScale(48) }}
                    />

                }
                onEndReached={_onEndReached}
                onEndReachedThreshold={0.5}
            />
            <Loader isLoading={isLoading} />
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Are you sure you want to delete "{selectedItem?.group_name}"?
            </Text>
            <Text style={styles.modalSubText}>
              This action cannot be undone.
            </Text>
            <TouchableOpacity
              style={[styles.deleteButton, isDeleting && styles.disabledButton]}
              onPress={() => {
                onPressDeleteforMe();
              }}
              disabled={isDeleting}>
              <Text style={styles.buttonText}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                setSelectedItem(null);
              }}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        </WrapperContainer>
    );
};

export default PublicGroupChat;

const getStyles = (theme) => StyleSheet.create({
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
        marginBottom: 10,
        textAlign: 'center',
        fontSize: textScale(16),
        fontFamily: fontFamily.SemiBold,
        color: theme.colors.blackDark,
      },
      modalSubText: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: textScale(14),
        fontFamily: fontFamily.medium,
        color: theme.colors.grey,
      },
      deleteButton: {
        backgroundColor: theme.colors.likePink,
        padding: moderateScale(12),
        borderRadius: moderateScale(8),
        marginBottom: moderateScale(10),
        width: '100%',
        alignItems: 'center',
      },
      cancelButton: {
        backgroundColor: theme.colors.grey,
        padding: moderateScale(12),
        borderRadius: moderateScale(8),
        width: '100%',
        alignItems: 'center',
      },
      buttonText: {
        color: theme.colors.white,
        fontSize: textScale(14),
        fontFamily: fontFamily.SemiBold,
      },
      disabledButton: {
        opacity: 0.6,
      },





})
