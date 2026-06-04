import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {ANIM} from '../../../constants/cypher/animations';
import {COLORS} from '../../../constants/cypher/colors';
import {moderateScale, textScale} from '../../../styles/responsiveSize';
import fontFamily from '../../../styles/fontFamily';

const HudLabel = ({state = 'IDLE', label}) => {
  const blink = useRef(new Animated.Value(1)).current;
  const blinkDuration = ANIM.hudBlink[state];

  useEffect(() => {
    if (!blinkDuration) {
      blink.setValue(1);
      return undefined;
    }
    blink.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 0.25,
          duration: blinkDuration / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: blinkDuration / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [blink, blinkDuration, state]);

  return (
    <Animated.Text style={[styles.label, {opacity: blink}]}>
      {label}
    </Animated.Text>
  );
};

const CypherStatusBar = () => (
  <View style={styles.bar}>
    <View style={styles.dot} />
    <View style={styles.titleWrap}>
      <Animated.Text style={styles.title}>CYPHER</Animated.Text>
      <Animated.Text style={styles.sub}>AI ASSISTANT</Animated.Text>
    </View>
    <View style={styles.dot} />
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(8),
    gap: moderateScale(12),
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.hudActive,
    opacity: 0.6,
  },
  titleWrap: {
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(14),
    color: COLORS.purple100,
    letterSpacing: 4,
  },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(9),
    color: COLORS.textDim,
    letterSpacing: 2,
    marginTop: 2,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    color: COLORS.hudActive,
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: moderateScale(4),
  },
});

export {CypherStatusBar, HudLabel};
