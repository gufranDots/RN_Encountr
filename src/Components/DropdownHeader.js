//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import strings from '../constants/Languages';
import colors from '../styles/colors';

import fontFamily from '../styles/fontFamily';
import { moderateScale, textScale } from '../styles/responsiveSize';

// create a component
const DropdownHeader = ({
    centerText = "",
    rightText = strings.close,
    leftCustomView = () => { },
    isLeftView = false,
    containerStyle = {},
    rightTextStyle = {},
    onPressRight = () => { },
    isRight = true,
    rightPressActive = true,
    rightImg = ''
}) => {
    return (
        <View style={{
            ...styles.container,
            ...containerStyle,
        }}>
            {isLeftView ? leftCustomView() : <View />}
            <Text style={styles.centerTextStyle}>{centerText}</Text>
            {isRight ? <TouchableOpacity onPress={onPressRight}>
                {rightImg ? <Image source={rightImg} /> : <Text style={{ ...styles.rightTextStyle, ...rightTextStyle }}>{rightText}</Text>}
            </TouchableOpacity> : <View />}
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.6,
        borderColor: 'grey',
        paddingBottom: 12,
        paddingHorizontal: 12,
        marginTop: moderateScale(8),

    },
    centerTextStyle: {
        color: colors.darkBlack,
        fontFamily: fontFamily.SemiBold,
        fontSize: textScale(16)
    },
    rightTextStyle: {
        color: colors.grey,
        fontFamily: fontFamily.regular,
        fontSize: textScale(18)
    }
});

//make this component available to the app
export default React.memo(DropdownHeader);
