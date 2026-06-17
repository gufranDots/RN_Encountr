import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Platform, StyleSheet, Text, View } from 'react-native';

import BlockedUser from '../../Components/BlockedUser';
import HeaderComp from '../../Components/HeaderComp';
import { Loader } from '../../Components/Loader';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import { unblockUserApi } from '../../redux/reduxActions/chatActions';
import { getAllBlockedUsersApi } from '../../redux/reduxActions/profileActions';
import { height, moderateScaleVertical } from '../../styles/responsiveSize';
import { ApiError, ApplyEaseOutAnimation, showError, showSuccess } from '../../utils/helperFunctions';
import { enableFreeze } from 'react-native-screens'
import { useTheme } from '../../theme/ThemeProvider';
import { getCommonStyles } from '../../styles/commonStyles';
enableFreeze()


const BlockedUsers = (props) => {
    const {theme} = useTheme();
    const commonStyles = getCommonStyles(theme);
    const styles = getStyles(theme)
    const { navigation } = props;

    const [isLoading, setLoading] = useState(true)
    const [allBlockedUsers, setAllBlockedUsers] = useState([])

    useEffect(() => {
        _getBlockedUsersApi()
    }, [])

    const _getBlockedUsersApi = () => {
        getAllBlockedUsersApi().then((res) => {
            setAllBlockedUsers(res?.data)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
            showError(ApiError(error))
        })
    }

    const _renderAllUsers = useCallback(({ item, index }) => {
        return (
            <BlockedUser
                itemData={item}
                unblockUser={() => _askToUnblockUser(item)}
            />
        )
    }, [allBlockedUsers])

    const _askToUnblockUser = (item) => {
        Alert.alert(
            strings.Alert,
            strings.Areyousurenyouwanttounblockthisuser,
            [
                {
                    text: strings.yes,
                    onPress: () => _unblockUser(item)
                },
                {
                    text: strings.no,
                    style: 'destructive'
                }
            ]
        )
    }

    const _unblockUser = (item) => {
        setLoading(false)
        let apiData = {
            user_id: item?.to_user?.id
        }
        unblockUserApi(apiData).then((res) => {
            const _arr = allBlockedUsers.filter((val => item.id != val?.id))
            setAllBlockedUsers(_arr)
            ApplyEaseOutAnimation()
            // showSuccess(res?.message)
            setLoading(false)
        }).catch((error) => {
            setLoading(false)
            showError(ApiError(error))
        })
    }

    return (
        <WrapperContainer isSafeAreaAvailable={true}>
            <HeaderComp
                viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
                leftIcon={imagesPath.ic_back}
                onPressBack={() => navigation.goBack()}
                centerText={strings.blockedUsers}
            />

            <FlatList
                data={allBlockedUsers}
                extraData={allBlockedUsers}
                renderItem={_renderAllUsers}
                ListEmptyComponent={
                    <View style={styles.emptyListView}>
                        <Image source={imagesPath.ic_user_blocked}
                            style={styles.blockedUser}
                        />
                        <Text style={commonStyles.font_16_SemiBold}>{strings.youhavenotblockanyuseryet}</Text>
                    </View>
                }
                ListHeaderComponent={()=> <View style={{height:moderateScaleVertical(20)}}/>}
            />
            <Loader isLoading={isLoading} />
        </WrapperContainer>
    )
}

const getStyles = (theme) => StyleSheet.create({
    emptyListView: {
        marginTop: height / 3,
        justifyContent: "center",
        alignItems: "center",
    },
    blockedUser: {
        tintColor: theme.colors.black,
        marginBottom: moderateScaleVertical(10)
    }
})

export default BlockedUsers;
