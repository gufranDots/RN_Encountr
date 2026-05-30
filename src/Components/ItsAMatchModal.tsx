
import React, { FC, useEffect } from 'react';
import { Text, View, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import FastImage from '../utils/FastImageCompat';
import ReactNativeModal from 'react-native-modal';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSelector } from 'react-redux';

import imagesPath from '../constants/imagesPath';
import strings from '../constants/Languages';
import colors from '../styles/colors';
import { height, moderateScale, width } from '../styles/responsiveSize';
import ButtonComp from './ButtonComp';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

interface ItsAMatchModalProps {
    isVisible: boolean
    userImage: string
    onSayHello: () => void
    onKeepSwiping: () => void
}

type stateType = {
    authReducers: {
        userData: {
            profile_image: string
            profile_image_thumb: string
        }
    },
}

const MARGIN_START = -(width / 5)
const DURATION = 1200

const ItsAMatchModal: FC<ItsAMatchModalProps> = ({
    isVisible,
    userImage,
    onSayHello,
    onKeepSwiping
}) => {
    const { theme } = useTheme();
    const commonStyles = getCommonStyles(theme);
    const userData = useSelector((state: stateType) => state.authReducers?.userData);

    const rotate1 = useSharedValue('0deg')
    const marginStart1 = useSharedValue(0)
    const top1 = useSharedValue(0)

    const rotate2 = useSharedValue('0deg')

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: rotate1.value }]
        }
    })

    const rSecondStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: rotate2.value }],
            marginStart: marginStart1.value,
            top: top1.value
        }
    })

    useEffect(() => {
        setTimeout(() => {
            _startAnimation()
        }, 500);
    }, [isVisible])

    const _startAnimation = () => {
        if (isVisible) {
            rotate1.value = withTiming("15deg", { duration: DURATION })
            top1.value = withTiming(80, { duration: DURATION })
            marginStart1.value = withTiming(MARGIN_START, { duration: DURATION })

            rotate2.value = withTiming("-15deg", { duration: DURATION })
        } else {
            rotate1.value = withTiming("0deg", { duration: DURATION })
            top1.value = withTiming(0, { duration: DURATION })
            marginStart1.value = withTiming(0, { duration: DURATION })

            rotate2.value = withTiming("0deg", { duration: DURATION })
        }
    }


    return (
        <ReactNativeModal
            isVisible={isVisible}
            backdropOpacity={1}
            backdropColor={theme.colors.white}
        >
            {/* <ScrollView> */}
            <View style={{
                flex: 1,
                paddingTop: moderateScale(48),
                backgroundColor: theme.colors.white
            }}>
                <View style={{
                    flex: 0.65,
                    // height: height / 1.8,
                    alignSelf: "center"
                }}>
                    <Animated.View style={[{ position: "absolute" }, rStyle]}>
                        <FastImage
                            source={{ uri: userImage }}
                            style={{
                                height: height / 2.8 || moderateScale(250),
                                width: width / 2.4 || moderateScale(170),
                                borderRadius: moderateScale(16),
                                backgroundColor: theme.colors.blackOpacity20
                            }}
                        />
                        <Image
                            source={imagesPath.like_pink_blue}
                            style={{
                                position: "absolute",
                                left: moderateScale(-22),
                                top: moderateScale(-22)
                            }}
                        />
                    </Animated.View>

                    <Animated.View style={[rSecondStyle]}>
                        <FastImage
                            source={{ uri: userData?.profile_image_thumb || userData?.profile_image }}
                            style={{
                                height: height / 2.8 || moderateScale(250),
                                width: width / 2.4 || moderateScale(170),
                                borderRadius: moderateScale(16),
                                backgroundColor: theme.colors.blackOpacity25
                            }}
                        />
                        <Image
                            source={imagesPath.like_pink_blue}
                            style={{
                                position: "absolute",
                                left: moderateScale(-22),
                                bottom: moderateScale(-22),
                            }}
                        />
                    </Animated.View>
                </View>

                <View
                    style={{
                        flex: 0.1,
                    }}
                >
                    {/* <Image
                        source={imagesPath.bonkers_text}
                        style={{ width: width / 2, height: moderateScale(50), alignSelf: "center" }}
                        resizeMode="contain"
                    /> */}
                    <Text style={{...commonStyles.font_20_bold, color: theme.colors.themecolor2}}>Encountr</Text>
                    <Text style={{
                        ...commonStyles.font_18_SemiBold,
                        textAlign: "center"
                    }}>{strings.Its_a_match}</Text>
                </View>



                <View style={{
                    flex: 0.25,
                    paddingTop: moderateScale(24),
                    paddingHorizontal: moderateScale(10),
                }}>
                    {/* {userData?.subscription?.subscription_id > 1 && */}
                    <ButtonComp
                        btnText={strings.sayHello}
                        btnStyle={{ paddingTop: moderateScale(10) }}
                        onPressBtn={onSayHello}
                    />
                    {/* } */}
                    <ButtonComp
                        btnText={strings.keepSwiping}
                        btnStyle={{
                            paddingTop: moderateScale(20),
                        }}
                        btnView={{ backgroundColor: theme.colors.chatBackground }}
                        txtStyle={{ color: theme.colors.white }}
                        onPressBtn={onKeepSwiping}
                    />
                </View>

            </View>
            {/* </ScrollView> */}
        </ReactNativeModal>
    );
};

export default React.memo(ItsAMatchModal);

const styles = StyleSheet.create({
    container: {}
});
