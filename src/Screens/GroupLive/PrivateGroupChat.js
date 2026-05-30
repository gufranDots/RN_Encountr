import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import strings from '../../constants/Languages';
import imagesPath from '../../constants/imagesPath';
import WrapperContainer from '../../Components/WrapperContainer';
import colors from '../../styles/colors';
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
import { Loader } from '../../Components/Loader';
import HeaderComp from '../../Components/HeaderComp';
import CustomImage  from '../../Components/CustomImage';
import { stableKeyExtractor } from '../../utils/stableKeyExtractor';

const PrivateGroupChat = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [privateMemberImg, setPrivateMemberImg] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [hasMoreData, setHasMoreData] = useState(false);
    const [pageNo, setPageNo] = useState(1);
    const [isRefreshing, setRefreshing] = useState(false);


    useEffect(() => {
        chatApiCalling()
    }, [])


    const chatApiCalling = () => {
        groupChatConversations()
            .then(res => {
                const filterDataPrivate = res?.data?.data.filter((item)=>{return item?.chat_type == 'private'  })
                setData(filterDataPrivate)
                setPrivateMemberImg(filterDataPrivate[0]?.members)
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


    const _renderAllUsers = useCallback(
        ({ item, index }) => {
            return (
                <View
                    style={{
                        padding: moderateScale(14),
                        borderRadius: moderateScale(12),
                        backgroundColor: colors.white,
                        marginTop: moderateScaleVertical(34),
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            style={{
                                fontSize: textScale(20),
                                color: colors.blackDark,
                                fontFamily: fontFamily.SemiBold,
                            }}>
                            {item?.group_name}
                        </Text>
                    </View>

                    {/* <Text
                        style={{
                            fontSize: textScale(16),
                            color: colors.grey,
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
                                      borderColor: colors.white,
                                      borderRadius: moderateScale(20),
                                      right: index == 0 ? 0 : moderateScale(6 * index + 2),
                                      zIndex: -index,
                                      height: moderateScale(30),
                                      width: moderateScale(30),
                                    }}
                                    style={{
                                      borderWidth: 2,
                                      borderColor: colors.white,
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
                                    backgroundColor: colors.orangenew,
                                }}
                                onPressBtn={() =>
                                    navigation.navigate(navigationString.CHATSCREEN, {
                                      prevData: item?.other_user,
                                      data:item,
                                      MemberImg: item?.members
                                    })
                                  }
                                txtStyle={{ fontSize: textScale(12) }}
                                btnStyle={{
                                    borderRadius: moderateScale(40),
                                    width: moderateScale(120),
                                }}
                                btnText={'Join now'}
                            />
                        </View>
                    </View>
                </View>
            )
        })

    return (
        <WrapperContainer
        statusbarcolorr={colors.backgroundBlue}
        mainViewStyle={{ backgroundColor: colors.backgroundBlue }}
        isSafeAreaAvailable={true}>
            <HeaderComp
                leftIcon={imagesPath.ic_back}
                onPressBack={() => navigation.goBack()}
                centerText={strings.PrivateChatRoom}
                centertextstyle={{ fontSize: textScale(18), fontFamily: fontFamily.bold }}
            />
            <View>
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
                color={colors.likePink}
                style={{ marginVertical: moderateScale(48) }}
                />
                
            }
            onEndReached={_onEndReached}
            onEndReachedThreshold={0.5}
            />

            </View>
            <Loader isLoading={isLoading} />

        </WrapperContainer>
    );
};

export default PrivateGroupChat;







