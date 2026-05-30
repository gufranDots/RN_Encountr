//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { moderateScale, textScale } from '../styles/responsiveSize';
import colors from '../styles/colors';
import imagesPath from '../constants/imagesPath';
import { Image } from 'react-native';
import fontFamily from '../styles/fontFamily';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

// create a component
const ImageText = ({
    tintColor,
    source,
    text,
    mainstyle,
    txtstyle
}) => {
    const searchTerm = "Incognito"
    const position = text.indexOf(searchTerm);
    const {theme} = useTheme();
    const commonStyles = getCommonStyles(theme);
    return (


        <View style={{ flexDirection: 'row', marginHorizontal: moderateScale(20), ...mainstyle }}>
            <View style={{ flex: 0.1 }}>
                <Image source={source} style={{ tintColor: tintColor }} />
            </View>
            <View style={{ flex: 0.9, }}>
                {position == 0?(

                    <Text style={{ ...commonStyles.font_14_medium, color: theme.colors.white, ...txtstyle }}>
                        <Text style={{ ...commonStyles.font_14_bold, color:  theme.colors.white, ...txtstyle }}>
                        Incognito 
                        </Text>
                        {" "}mode allows users to appear offline to others, and viewing profiles won't trigger notifications
                        </Text>
                ):(
                    
                    <Text style={{ ...commonStyles.font_14_medium, color:  theme.colors.white, ...txtstyle }}>{text}</Text>
                )}
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({

});

//make this component available to the app
export default ImageText;
