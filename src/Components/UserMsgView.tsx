import moment from 'moment';
import React, { FC } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import FastImage from '../utils/FastImageCompat';
import colors from '../styles/colors';
import { moderateScale } from '../styles/responsiveSize';
import CustomImage from './CustomImage';
import imagesPath from '../constants/imagesPath';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

interface UserMsgViewType {
    onPress: () => void
    onLongPress: () => void
    pic: string
    name: string
    lastMessage: string
    unReadMessages: number
    msgUpdateAt: string
}

const UserMsgView: FC<UserMsgViewType> = ({
    onPress,
    onLongPress,
    pic,
    name,
    lastMessage,
    unReadMessages,
    msgUpdateAt,
}) => {
    const {theme} = useTheme();
    const commonStyles = getCommonStyles(theme);
    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={1}
            style={{ marginTop: moderateScale(16) }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <View style={{ flex: 0.2 }}>
                    {/* <FastImage style={{
                        height: moderateScale(52),
                        width: moderateScale(52),
                        borderRadius: moderateScale(26),
                    }} source={{
                        uri: pic
                    }} /> */}
                    <CustomImage
                        source={pic ? { uri: pic } : imagesPath.userRoundIcon}
                        style={{
                            height: moderateScale(52),
                            width: moderateScale(52),
                            borderRadius: moderateScale(26),
                        }}
                        imgLoaderStyle={{
                            height: moderateScale(52),
                            width: moderateScale(52),
                            borderRadius: moderateScale(26),
                        }}
                    />
                </View>
                <View style={{
                    flexDirection: 'column',
                    flex: 0.6,
                    marginTop: moderateScale(6),
                }}>
                    <Text style={{
                        ...commonStyles.font_14_SemiBold,
                        color: theme.colors.black,
                        textTransform: "capitalize"
                    }}>{name}</Text>
                    {lastMessage ?
                        <Text
                            style={{
                                ...commonStyles.font_12_regular,
                                marginTop: moderateScale(6),
                                color: theme.colors.black,

                            }}
                            numberOfLines={1}
                            ellipsizeMode='tail'>
                            {lastMessage}
                        </Text>
                        :
                        <Text></Text>
                    }
                </View>
                {Number(unReadMessages) > 0 ? <View style={{
                    flexDirection: 'column',
                    flex: 0.2,
                    alignItems: 'flex-end',
                    marginRight: 14,
                    marginTop: moderateScale(6),
                }}>
                    <Text style={{ ...commonStyles.font_10_medium }}>{moment(msgUpdateAt).format('LT')}</Text>
                    <View style={{
                        height: moderateScale(22),
                        width: moderateScale(22),
                        borderRadius: moderateScale(11),
                        marginTop: moderateScale(4),
                        justifyContent: 'center',
                        backgroundColor: theme.colors.themecolor2
                    }}>
                        <Text style={{
                            ...commonStyles.font_10_medium,
                            color: theme.colors.black,
                            alignSelf: 'center',
                        }}>{unReadMessages}</Text>
                    </View>
                </View>
                    :
                    <></>
                }

                
            </View>
            <View style={{
                borderColor: theme.colors.likePink,
                borderWidth: 0.5,
                width: '100%',
                marginTop: moderateScale(16),
                alignSelf: 'flex-end',
                opacity: 0.5,
            }} />
        </TouchableOpacity >
    )
}

export default UserMsgView;
