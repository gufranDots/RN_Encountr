import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {ANIM} from '../../../constants/cypher/animations';
import {COLORS} from '../../../constants/cypher/colors';
import {moderateScale} from '../../../styles/responsiveSize';

const BAR_COUNT = 11;
const MAX_HEIGHT = moderateScale(36);

const WaveformBars = ({visible, state = 'LISTENING'}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {Array.from({length: BAR_COUNT}, (_, i) => (
        <WaveBar key={i} index={i} state={state} />
      ))}
    </View>
  );
};

const WaveBar = ({index, state}) => {
  const anim = useRef(new Animated.Value(0.15)).current;
  const isSpeaking = state === 'SPEAKING';

  useEffect(() => {
    anim.setValue(0.15);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: isSpeaking ? 0.85 : 1,
          duration: ANIM.waveBar + index * 40,
          delay: index * 40,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.15,
          duration: ANIM.waveBar + index * 40,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, index, isSpeaking]);

  const scaleY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 1],
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          transform: [{scaleY}],
          opacity: isSpeaking ? 0.7 : 1,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_HEIGHT,
    gap: moderateScale(4),
    marginVertical: moderateScale(12),
  },
  bar: {
    width: moderateScale(3),
    height: MAX_HEIGHT,
    borderRadius: moderateScale(2),
    backgroundColor: COLORS.purple200,
  },
});

export default React.memo(WaveformBars);
