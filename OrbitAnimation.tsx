import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Circle,
  Ellipse,
  Polygon,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Base coordinate system. Everything is authored against this viewBox and
// scaled by the <Svg> width/height, so it stays crisp at any size.
const VB_W = 419;
const VB_H = 548;
const CX = 209; // orb center x
const CY = 301; // orb center y

type Palette = {
  bgInner: string;
  bgMid: string;
  bgEdge: string;
  coreA: string; // bright inner
  coreB: string; // glow falloff
  sphereA: string;
  sphereB: string;
  ring: string;
  ringDim: string;
  sphereStroke: string;
};

const BLUE: Palette = {
  bgInner: '#1d2a6e',
  bgMid: '#0a0c2e',
  bgEdge: '#02030f',
  coreA: '#cfe0fb',
  coreB: '#5a6ef0',
  sphereA: '#8aa8f0',
  sphereB: '#4a5fd6',
  ring: '#5c7ce0',
  ringDim: '#3f5ec8',
  sphereStroke: '#88a8f5',
};

const PURPLE: Palette = {
  bgInner: '#2a1559',
  bgMid: '#0c0826',
  bgEdge: '#03020c',
  coreA: '#f0d2fb',
  coreB: '#9a4cf0',
  sphereA: '#c98af0',
  sphereB: '#7a3fd6',
  ring: '#7a5ce0',
  ringDim: '#5e3fc8',
  sphereStroke: '#b888f5',
};

type Props = {
  /** Rendered square size in px. Defaults to min(screen width, 460). */
  size?: number;
  /** 'blue' (default) or 'purple'. */
  hue?: 'blue' | 'purple';
  /** Unique suffix for gradient ids when rendering multiple instances. */
  idSuffix?: string;
  style?: ViewStyle;
};

// Helper: a centered rotation transform array for an animated <G>.
function centeredRotate(deg: number) {
  return [
    { translateX: CX },
    { translateY: CY },
    { rotate: `${deg}deg` },
    { translateX: -CX },
    { translateY: -CY },
  ];
}

function useSpin(duration: number, reverse = false) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withRepeat(
      withTiming(reverse ? -360 : 360, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [duration, reverse]);
  return v;
}

function useTwinkle(duration: number, lowFirst = true) {
  const v = useSharedValue(lowFirst ? 0.2 : 1);
  useEffect(() => {
    const a = lowFirst ? 0.2 : 1;
    const b = lowFirst ? 1 : 0.2;
    v.value = withRepeat(
      withSequence(
        withTiming(b, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(a, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [duration, lowFirst]);
  return v;
}

export default function OrbitAnimation({
  size,
  hue = 'blue',
  idSuffix = 'o',
  style,
}: Props) {
  const { width } = useWindowDimensions();
  const dim = size ?? Math.min(width, 460);
  const height = (dim * VB_H) / VB_W;
  const P = hue === 'purple' ? PURPLE : BLUE;
  const s = idSuffix;

  // Ring spins — different speeds & directions, non-multiples so they never resync.
  const spinA = useSpin(26000, false);
  const spinB = useSpin(32000, true);
  const spinC = useSpin(40000, false);

  // Pulsing starburst scale (0.92 -> 1.08).
  const pulse = useSharedValue(0.92);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.92, { duration: 1700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  // Core glow gentle breathing opacity.
  const coreOpacity = useSharedValue(0.85);
  useEffect(() => {
    coreOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: 1700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const ringAProps = useAnimatedProps(() => ({ transform: centeredRotate(spinA.value) }));
  const ringBProps = useAnimatedProps(() => ({ transform: centeredRotate(spinB.value) }));
  const ringCProps = useAnimatedProps(() => ({ transform: centeredRotate(spinC.value) }));

  const burstProps = useAnimatedProps(() => ({
    transform: [
      { translateX: CX },
      { translateY: CY },
      { scale: pulse.value },
      { translateX: -CX },
      { translateY: -CY },
    ],
  }));

  const coreProps = useAnimatedProps(() => ({ opacity: coreOpacity.value }));

  // Sparkle opacities.
  const sp1 = useTwinkle(2600, true);
  const sp2 = useTwinkle(3100, false);
  const sp3 = useTwinkle(2200, true);
  const sp4 = useTwinkle(3600, false);
  const sp5 = useTwinkle(2900, true);
  const sp6 = useTwinkle(2400, false);
  const sp7 = useTwinkle(3300, true);
  const sp1p = useAnimatedProps(() => ({ opacity: sp1.value }));
  const sp2p = useAnimatedProps(() => ({ opacity: sp2.value }));
  const sp3p = useAnimatedProps(() => ({ opacity: sp3.value }));
  const sp4p = useAnimatedProps(() => ({ opacity: sp4.value }));
  const sp5p = useAnimatedProps(() => ({ opacity: sp5.value }));
  const sp6p = useAnimatedProps(() => ({ opacity: sp6.value }));
  const sp7p = useAnimatedProps(() => ({ opacity: sp7.value }));

  return (
    <View style={[{ width: dim, height }, style]}>
      <Svg width={dim} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        <Defs>
          <RadialGradient id={`bg-${s}`} cx="50%" cy="56%" r="70%">
            <Stop offset="0%" stopColor={P.bgInner} stopOpacity="1" />
            <Stop offset="30%" stopColor="#15194a" stopOpacity="1" />
            <Stop offset="55%" stopColor={P.bgMid} stopOpacity="1" />
            <Stop offset="80%" stopColor="#04051a" stopOpacity="1" />
            <Stop offset="100%" stopColor={P.bgEdge} stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id={`core-${s}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="14%" stopColor={P.coreA} stopOpacity="0.96" />
            <Stop offset="34%" stopColor="#9ab4f4" stopOpacity="0.78" />
            <Stop offset="60%" stopColor={P.coreB} stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#3a3cc3" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id={`sphere-${s}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={P.sphereA} stopOpacity="0.5" />
            <Stop offset="50%" stopColor={P.coreB} stopOpacity="0.28" />
            <Stop offset="80%" stopColor={P.sphereB} stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#2b2f87" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id={`burst-${s}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <Stop offset="38%" stopColor="#b4cef8" stopOpacity="0.6" />
            <Stop offset="100%" stopColor={P.coreB} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Background */}
        <Circle cx={CX} cy={CY} r={300} fill={`url(#bg-${s})`} />
        <Circle cx={VB_W / 2} cy={VB_H / 2} r={400} fill={`url(#bg-${s})`} />

        {/* Outer haze */}
        <Circle cx={CX} cy={CY} r={195} fill={`url(#sphere-${s})`} opacity={0.38} />

        {/* Orbital rings */}
        <AnimatedG animatedProps={ringAProps}>
          <Ellipse cx={CX} cy={CY} rx={180} ry={76} fill="none" stroke={P.ring} strokeWidth={0.8} opacity={0.5} transform={`rotate(18 ${CX} ${CY})`} />
          <Ellipse cx={CX} cy={CY} rx={155} ry={150} fill="none" stroke="#4c6cd8" strokeWidth={0.7} opacity={0.42} transform={`rotate(-22 ${CX} ${CY})`} />
        </AnimatedG>

        <AnimatedG animatedProps={ringBProps}>
          <Ellipse cx={CX} cy={CY} rx={174} ry={90} fill="none" stroke="#6a8ae8" strokeWidth={0.8} opacity={0.5} transform={`rotate(-40 ${CX} ${CY})`} />
          <Ellipse cx={CX} cy={CY} rx={146} ry={162} fill="none" stroke={P.ringDim} strokeWidth={0.7} opacity={0.38} transform={`rotate(55 ${CX} ${CY})`} />
        </AnimatedG>

        <AnimatedG animatedProps={ringCProps}>
          <Ellipse cx={CX} cy={CY} rx={166} ry={118} fill="none" stroke="#5878e0" strokeWidth={0.7} opacity={0.4} transform={`rotate(80 ${CX} ${CY})`} />
        </AnimatedG>

        {/* Glowing sphere body */}
        <Circle cx={CX} cy={CY} r={118} fill={`url(#sphere-${s})`} />
        <Circle cx={CX} cy={CY} r={118} fill="none" stroke={P.sphereStroke} strokeWidth={1.4} opacity={0.68} />

        {/* Core glow (breathing) */}
        <AnimatedCircle cx={CX} cy={CY} r={132} fill={`url(#core-${s})`} animatedProps={coreProps} />

        {/* 8-point starburst (pulsing) */}
        <AnimatedG animatedProps={burstProps}>
          <Circle cx={CX} cy={CY} r={40} fill={`url(#burst-${s})`} />
          {/* 4 long cardinal rays */}
          <Polygon points={`${CX},${CY - 92} ${CX + 8},${CY - 8} ${CX},${CY} ${CX - 8},${CY - 8}`} fill="#ffffff" opacity={0.9} />
          <Polygon points={`${CX},${CY + 92} ${CX + 8},${CY + 8} ${CX},${CY} ${CX - 8},${CY + 8}`} fill="#ffffff" opacity={0.9} />
          <Polygon points={`${CX - 92},${CY} ${CX - 8},${CY + 8} ${CX},${CY} ${CX - 8},${CY - 8}`} fill="#ffffff" opacity={0.9} />
          <Polygon points={`${CX + 92},${CY} ${CX + 8},${CY + 8} ${CX},${CY} ${CX + 8},${CY - 8}`} fill="#ffffff" opacity={0.9} />
          {/* 4 short diagonal rays */}
          <G transform={`rotate(45 ${CX} ${CY})`} opacity={0.7}>
            <Polygon points={`${CX},${CY - 60} ${CX + 5},${CY - 5} ${CX},${CY} ${CX - 5},${CY - 5}`} fill="#dce8ff" />
            <Polygon points={`${CX},${CY + 60} ${CX + 5},${CY + 5} ${CX},${CY} ${CX - 5},${CY + 5}`} fill="#dce8ff" />
            <Polygon points={`${CX - 60},${CY} ${CX - 5},${CY + 5} ${CX},${CY} ${CX - 5},${CY - 5}`} fill="#dce8ff" />
            <Polygon points={`${CX + 60},${CY} ${CX + 5},${CY + 5} ${CX},${CY} ${CX + 5},${CY - 5}`} fill="#dce8ff" />
          </G>
          <Circle cx={CX} cy={CY} r={12} fill="#ffffff" />
          <Circle cx={CX} cy={CY} r={19} fill={P.coreA} opacity={0.5} />
        </AnimatedG>

        {/* Sparkles inside the sphere */}
        <AnimatedCircle cx={159} cy={261} r={1.3} fill="#ffffff" animatedProps={sp1p} />
        <AnimatedCircle cx={263} cy={271} r={1.1} fill="#ffffff" animatedProps={sp2p} />
        <AnimatedCircle cx={179} cy={341} r={1.4} fill="#ffffff" animatedProps={sp3p} />
        <AnimatedCircle cx={248} cy={346} r={1.2} fill="#ffffff" animatedProps={sp4p} />
        <AnimatedCircle cx={209} cy={221} r={1.3} fill="#ffffff" animatedProps={sp5p} />
        <AnimatedCircle cx={147} cy={311} r={1} fill="#ffffff" animatedProps={sp6p} />
        <AnimatedCircle cx={276} cy={316} r={1.1} fill="#ffffff" animatedProps={sp7p} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({});
