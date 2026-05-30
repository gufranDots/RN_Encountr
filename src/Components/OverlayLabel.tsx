import React from 'react';
import {View, Text, StyleSheet, Image, Platform} from 'react-native';
import {height, moderateScale, width} from '../styles/responsiveSize';
import {getColorCodeWithOpactiyNumberHASHES} from '../utils/helperFunctions';

type OverlayLabelTypes = {
  label: any;
  color: string;
};

const OverlayLabel = ({label, color}: OverlayLabelTypes) => (
  <View
    style={[
      styles.overlayLabel,
      {backgroundColor: getColorCodeWithOpactiyNumberHASHES(color, 20)},
    ]}>
    <Image
      source={label}
      style={{
        height: moderateScale(94),
        width: moderateScale(94),
        resizeMode: 'contain',
        tintColor: color
      }}
    />
  </View>
);

export default OverlayLabel;

const styles = StyleSheet.create({
  overlayLabel: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    height: Platform.OS === 'ios' ? height / 1.8 : height/1.6,
    width: width / 1.2,
  },
  overlayLabelText: {
    fontSize: 25,
    fontFamily: 'Avenir',
    textAlign: 'center',
  },
});
