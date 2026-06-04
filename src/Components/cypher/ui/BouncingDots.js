import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {ANIM} from '../../../constants/cypher/animations';
import {COLORS} from '../../../constants/cypher/colors';
import {moderateScale} from '../../../styles/responsiveSize';

const DOT_COUNT = 3;

const BouncingDots = ({visible}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {Array.from({length: DOT_COUNT}, (_, i) => (
        <Dot key={i} index={i} />
      ))}
    </View>
  );
};

const Dot = ({index}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: ANIM.dotBounce / 2,
          delay: index * 120,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: ANIM.dotBounce / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, index]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Animated.View
      style={[styles.dot, {transform: [{translateY}]}]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
    marginVertical: moderateScale(16),
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: COLORS.purple200,
  },
});

export default BouncingDots;
