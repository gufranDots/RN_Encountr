import React from 'react';
import {StyleSheet, View} from 'react-native';
import {COLORS} from '../../../constants/cypher/colors';
import {moderateScale} from '../../../styles/responsiveSize';

const SIZE = moderateScale(18);
const STROKE = 1.5;
const INSET = moderateScale(12);

const HudCorners = () => (
  <View pointerEvents="none" style={styles.container}>
    <View style={[styles.corner, styles.topLeft]}>
      <View style={styles.h} />
      <View style={styles.v} />
    </View>
    <View style={[styles.corner, styles.topRight]}>
      <View style={[styles.h, styles.mirrorH]} />
      <View style={[styles.v, styles.alignRight]} />
    </View>
    <View style={[styles.corner, styles.bottomLeft]}>
      <View style={[styles.h, styles.alignBottom]} />
      <View style={[styles.v, styles.alignBottomV]} />
    </View>
    <View style={[styles.corner, styles.bottomRight]}>
      <View style={[styles.h, styles.alignBottom, styles.mirrorH]} />
      <View style={[styles.v, styles.alignRight, styles.alignBottomV]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
  },
  h: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: STROKE,
    backgroundColor: COLORS.hudDim,
  },
  v: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: STROKE,
    height: SIZE,
    backgroundColor: COLORS.hudDim,
  },
  mirrorH: {
    left: undefined,
    right: 0,
  },
  alignRight: {
    left: undefined,
    right: 0,
  },
  alignBottom: {
    top: undefined,
    bottom: 0,
  },
  alignBottomV: {
    top: undefined,
    bottom: 0,
  },
  topLeft: {top: INSET, left: INSET},
  topRight: {top: INSET, right: INSET},
  bottomLeft: {bottom: INSET, left: INSET},
  bottomRight: {bottom: INSET, right: INSET},
});

export default HudCorners;
