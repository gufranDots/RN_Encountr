import React from 'react';
import { Image, StyleSheet, Text, View, ScrollView } from 'react-native';

import ButtonComp from '../../Components/ButtonComp';
import HeaderComp from '../../Components/HeaderComp';
import WrapperContainer from '../../Components/WrapperContainer';

import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';

import colors from '../../styles/colors';
import fontFamily from '../../styles/fontFamily';
import { moderateScale, textScale } from '../../styles/responsiveSize';
import { enableFreeze } from 'react-native-screens'
enableFreeze()
// create a component
const EnableNotify = ({ navigation }) => {
    return (
        <WrapperContainer>
            <ScrollView
                contentContainerStyle={{ flex: 1 }}
                bounces={false}>
                <HeaderComp rightText="Skip" />

                <View style={styles.firstView}>
                    <Image source={imagesPath.ic_chatImage} />
                </View>

                <View style={styles.secView}>
                    <Text style={styles.textStyle}>{strings.enableNotification}</Text>
                    <Text style={styles.secText}>
                        {strings.getPushNotificationWhenYouGetThe}
                    </Text>
                    <Text style={styles.secTextSec}>
                        {strings.MatchOrRecieveaMessage}
                    </Text>
                </View>

                <View style={{ flex: 0.5, justifyContent: 'flex-end' }}>
                    <ButtonComp
                        btnText={strings.IWantToBeNotified}
                        onPressBtn={() =>
                            navigation.navigate(navigationString.ONBOARDING_SCREEN)
                        }
                        txtStyle={{
                            fontFamily: fontFamily.SemiBold,
                            fontSize: textScale(16),
                        }}
                        btnView={{
                            backgroundColor: colors.themeColor,
                            bottom: moderateScale(48),
                        }}
                    />
                </View>
            </ScrollView>
        </WrapperContainer>
    );
};

// define your styles
const styles = StyleSheet.create({
    firstView: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    secView: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textStyle: {
        fontSize: textScale(24),
        fontFamily: fontFamily.bold,
        marginTop: moderateScale(24),
        alignSelf: 'center',
    },
    secText: {
        fontSize: textScale(14),
        marginTop: moderateScale(24),
        textAlign: 'center',
        fontFamily: fontFamily.extraLight,
    },
    secTextSec: {
        fontSize: textScale(14),
        marginTop: moderateScale(4),
        textAlign: 'center',
        fontFamily: fontFamily.extraLight,
    },
});

//make this component available to the app
export default EnableNotify;