import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {ANIM} from '../../../constants/cypher/animations';
import {COLORS} from '../../../constants/cypher/colors';
import {moderateScale} from '../../../styles/responsiveSize';

const SIZE = moderateScale(200);

const ArcLine = ({state = 'IDLE'}) => {
  const spin1 = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;
  const duration = ANIM.arc[state] || ANIM.arc.IDLE;

  useEffect(() => {
    spin1.setValue(0);
    spin2.setValue(0);
    const loop1 = Animated.loop(
      Animated.timing(spin1, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const loop2 = Animated.loop(
      Animated.timing(spin2, {
        toValue: 1,
        duration: duration * 1.3,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop1.start();
    loop2.start();
    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [duration, spin1, spin2]);

  const rotate1 = spin1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const rotate2 = spin2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.layer, {transform: [{rotate: rotate1}]}]}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 200 200">
          <Circle
            cx="100"
            cy="100"
            r="82"
            stroke={COLORS.purple200}
            strokeWidth="1.2"
            strokeDasharray="40 120"
            fill="none"
            opacity={0.55}
          />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.layer, {transform: [{rotate: rotate2}]}]}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 200 200">
          <Circle
            cx="100"
            cy="100"
            r="68"
            stroke={COLORS.purple100}
            strokeWidth="0.8"
            strokeDasharray="20 80"
            fill="none"
            opacity={0.35}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
  },
});

export default ArcLine;
