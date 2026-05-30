import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { moderateScale } from '../styles/responsiveSize';
import colors from '../styles/colors';
import { useTheme } from '../theme/ThemeProvider';

const InfoBubble = ({ message }:any) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    return (
        <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
            <View style={styles.arrow} />
        </View>
    );
};

export default InfoBubble


const getStyles = (theme:any) => StyleSheet.create({
    bubble: {
        backgroundColor: theme.colors.themecolor2, // Bubble background color (e.g., a shade of blue)
        padding: 10,
        borderRadius: 10,
        left:moderateScale(117),
        bottom:moderateScale(17),
        maxWidth: '60%',
        alignSelf: 'flex-start', // Aligns the bubble to the start of the container (left side)
        position: "absolute",
        marginBottom: moderateScale(10),
    },
    bubbleText: {
        color: theme.colors.black, // Text color (white)
        fontWeight:"700",
        fontSize: moderateScale(13),
       
    },
    arrow: {
        position: 'absolute',
        left: 10, // Position the arrow relative to the bubble
        bottom: moderateScale(-6),
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: theme.colors.themecolor2, // Same color as the bubble
        transform:[
            {
                rotate:"180deg"
            }
        ]
    },
});
