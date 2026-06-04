import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {ANIM} from '../../../constants/cypher/animations';
import {COLORS} from '../../../constants/cypher/colors';
import {moderateScale} from '../../../styles/responsiveSize';

const PARTICLE_COUNT = 6;

const FloatingParticles = ({state = 'IDLE'}) => {
  const particles = useMemo(
    () =>
      Array.from({length: PARTICLE_COUNT}, (_, i) => ({
        id: i,
        angle: (360 / PARTICLE_COUNT) * i,
        radius: moderateScale(95 + (i % 3) * 12),
        size: 2 + (i % 3),
        delay: i * 180,
      })),
    [],
  );

  return (
    <View pointerEvents="none" style={styles.container}>
      {particles.map(p => (
        <Particle key={p.id} particle={p} state={state} />
      ))}
    </View>
  );
};

const Particle = ({particle, state}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0.2)).current;
  const flashDuration = ANIM.starFlash[state] || ANIM.starFlash.IDLE;
  const center = moderateScale(110);

  useEffect(() => {
    floatAnim.setValue(0);
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: ANIM.particleFloat,
          delay: particle.delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: ANIM.particleFloat,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatAnim, particle.delay]);

  useEffect(() => {
    flashAnim.setValue(0.2);
    const flashLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: flashDuration / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0.2,
          duration: flashDuration / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    flashLoop.start();
    return () => flashLoop.stop();
  }, [flashAnim, flashDuration]);

  const rad = (particle.angle * Math.PI) / 180;
  const x = Math.cos(rad) * particle.radius;
  const y = Math.sin(rad) * particle.radius;

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          left: center + x - particle.size / 2,
          top: center + y - particle.size / 2,
          opacity: flashAnim,
          transform: [{translateY: floatY}],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    backgroundColor: COLORS.starColor,
  },
});

export default FloatingParticles;
