//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import imagesPath from '../constants/imagesPath';
import {textScale} from '../styles/responsiveSize';
import colors from '../styles/colors';
import fontFamily from '../styles/fontFamily';

// create a component
const TextImage = ({righticon,righttext,lefttext,mainstyle}) => {
  return (
    <View style={{...styles.container,...mainstyle}}>
      <Text
        style={{
          fontSize: textScale(14),
          color: colors.black,
          fontFamily: fontFamily.SemiBold,
        }}>
        {lefttext}
      </Text>
      {righticon ? (
        <Image source={righticon} style={{tintColor: colors.black}} />
      ) : null}
      {righttext? (<Text
        style={{
          fontSize: textScale(14),
          color: colors.blackOpacity70,
          fontFamily: fontFamily.regular,
        }}>
        {righttext}
      </Text>):null}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

//make this component available to the app
export default TextImage;
