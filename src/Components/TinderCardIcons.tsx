import React from 'react';
import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {moderateScale} from '../styles/responsiveSize';

type TinderCardIconsType = {
    onPress: () => void;
    name: any; 
    backgroundColor: string;
}

const TinderCardIcons = ({onPress, name, backgroundColor}: TinderCardIconsType) => (
  <TouchableOpacity
    // style={[styles.singleButton, {backgroundColor}]}
    onPress={onPress}
    activeOpacity={0.85}>
    <Image
      source={name}
      style={{
        height: moderateScale(64),
        width: moderateScale(64),
        resizeMode: 'contain',
        tintColor: backgroundColor
      }}
    />
  </TouchableOpacity>
);

export default TinderCardIcons;

const styles = StyleSheet.create({
  singleButton: {
    backgroundColor: 'transparent',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 6,
    shadowOpacity: 0.3,
    elevation: 2,
    padding: 15,
  },
});
