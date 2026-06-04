import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {ANIM} from '../../../constants/cypher/animations';
import {
  COLORS,
  GLOW_COLORS_BY_STATE,
  RING_COLORS_BY_STATE,
} from '../../../constants/cypher/colors';
import {moderateScale} from '../../../styles/responsiveSize';

const RING_CONFIG = [
  {size: 170, scaleY: 0.38, key: 'r1', reverse: false},
  {size: 150, scaleY: 0.55, key: 'r2', reverse: true},
  {size: 130, scaleY: 0.72, key: 'r3', reverse: false},
  {size: 110, scaleY: 0.88, key: 'r4', reverse: true},
];

const OrbitRing = ({size, color, duration, reverse, scaleY, dashed}) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    spin.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          width: moderateScale(size),
          height: moderateScale(size),
          borderRadius: moderateScale(size / 2),
          borderColor: color,
          borderStyle: dashed ? 'dashed' : 'solid',
          transform: [{scaleY}, {rotate}],
        },
      ]}
    />
  );
};

const OrbitRings = ({state = 'IDLE'}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const ringColor = RING_COLORS_BY_STATE[state] || COLORS.ringIdle;
  const glowColor = GLOW_COLORS_BY_STATE[state] || COLORS.glowIdle;
  const speeds = ANIM.ring[state] || ANIM.ring.IDLE;
  const glowDuration = ANIM.glowPulse[state] || ANIM.glowPulse.IDLE;
  const isThinking = state === 'THINKING';

  useEffect(() => {
    glowAnim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: glowDuration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: glowDuration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim, glowDuration]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            backgroundColor: glowColor,
            opacity: glowOpacity,
          },
        ]}
      />
      {RING_CONFIG.map((cfg, index) => (
        <OrbitRing
          key={cfg.size}
          size={cfg.size}
          color={ringColor}
          duration={speeds[cfg.key]}
          reverse={cfg.reverse}
          scaleY={cfg.scaleY}
          dashed={isThinking && index % 2 === 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(220),
    height: moderateScale(220),
  },
  glow: {
    position: 'absolute',
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
});

export default OrbitRings;
