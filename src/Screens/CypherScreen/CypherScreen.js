import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import {hitSlopProp} from '../../styles/commonStyles';
import {
  height,
  moderateScale,
  textScale,
  width,
} from '../../styles/responsiveSize';
import {useTheme} from '../../theme/ThemeProvider';
import fontFamily from '../../styles/fontFamily';
import {showError} from '../../utils/helperFunctions';

const ORB_SIZE = Math.min(width * 0.52, 220);
const STAGE_SIZE = Math.min(width * 0.88, 340);
const ORBIT_CONFIGS = [
  {scale: 1.72, scaleY: 0.36, duration: 24000, reverse: false, tilt: 12, opacity: 0.32},
  {scale: 1.52, scaleY: 0.4, duration: 18000, reverse: true, tilt: -28, opacity: 0.38},
  {scale: 1.34, scaleY: 0.44, duration: 14000, reverse: false, tilt: 48, opacity: 0.34},
  {scale: 1.18, scaleY: 0.5, duration: 10000, reverse: true, tilt: -55, opacity: 0.3},
  {scale: 1.04, scaleY: 0.56, duration: 7500, reverse: false, tilt: 72, opacity: 0.22},
];
const PARTICLE_COUNT = 36;

const meteringToIntensity = db => {
  if (db == null || Number.isNaN(db)) return 0;
  const min = -45;
  const max = -5;
  if (db <= min) return 0;
  if (db >= max) return 1;
  return (db - min) / (max - min);
};

const buildParticles = () => {
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const radius = 0.35 + Math.random() * 0.55;
    particles.push({
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * (0.35 + Math.random() * 0.45),
      size: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 2000,
      duration: 1200 + Math.random() * 1800,
    });
  }
  return particles;
};

const OrbitParticle = ({particle, stageSize}) => {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.95,
          duration: particle.duration / 2,
          delay: particle.delay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: particle.duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, particle.delay, particle.duration]);

  const half = stageSize / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: half + particle.x * half - particle.size / 2,
        top: half + particle.y * half - particle.size / 2,
        height: particle.size,
        width: particle.size,
        borderRadius: particle.size / 2,
        backgroundColor: '#C300FF',
        opacity,
        shadowColor: '#C300FF',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 4,
      }}
    />
  );
};

const OrbitRing = ({config, spin}) => {
  const ringSize = STAGE_SIZE * config.scale;
  const offset = (STAGE_SIZE - ringSize) / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orbitRingWrap,
        {
          left: offset,
          top: offset,
          width: ringSize,
          height: ringSize,
          transform: [
            {rotate: `${config.tilt}deg`},
            {scaleY: config.scaleY},
            {rotate: spin},
          ],
          opacity: config.opacity,
        },
      ]}>
      <View style={styles.orbitRingLine} />
      <View style={[styles.orbitDot, styles.orbitDotTop]} />
      <View style={[styles.orbitDot, styles.orbitDotRight]} />
      <View style={[styles.orbitDot, styles.orbitDotBottom]} />
    </Animated.View>
  );
};

const CypherScreen = ({navigation}) => {
  const {theme} = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [isListening, setIsListening] = useState(false);
  const [intensity, setIntensity] = useState(0);

  const audioRecorderPlayerRef = useRef(null);
  const recordPathRef = useRef(null);
  const isMountedRef = useRef(true);

  const orbitAnims = useRef(ORBIT_CONFIGS.map(() => new Animated.Value(0))).current;
  const orbPulse = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbGlow = useRef(new Animated.Value(0.6)).current;
  const promptFade = useRef(new Animated.Value(1)).current;
  const statusFade = useRef(new Animated.Value(0)).current;

  const particles = useMemo(buildParticles, []);

  const _getRecorder = useCallback(() => {
    if (!audioRecorderPlayerRef.current) {
      audioRecorderPlayerRef.current = new AudioRecorderPlayer();
    }
    return audioRecorderPlayerRef.current;
  }, []);

  useEffect(() => {
    const loops = ORBIT_CONFIGS.map((cfg, i) =>
      Animated.loop(
        Animated.timing(orbitAnims[i], {
          toValue: cfg.reverse ? -1 : 1,
          duration: cfg.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [orbitAnims]);

  useEffect(() => {
    if (isListening) {
      orbPulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isListening, orbPulse]);

  useEffect(() => {
    Animated.timing(statusFade, {
      toValue: isListening ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [isListening, statusFade]);

  useEffect(() => {
    Animated.spring(orbScale, {
      toValue: 1 + intensity * 0.28,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
    Animated.timing(orbGlow, {
      toValue: 0.5 + intensity * 0.5,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [intensity, orbGlow, orbScale]);

  const _requestMicPermission = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Cypher needs microphone access to listen to you.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  }, []);

  const _stopListening = useCallback(async () => {
    const recorder = audioRecorderPlayerRef.current;
    if (!recorder) {
      setIsListening(false);
      setIntensity(0);
      return;
    }
    try {
      await recorder.stopRecorder();
    } catch (e) {}
    try {
      recorder.removeRecordBackListener();
    } catch (e) {}
    if (isMountedRef.current) {
      setIsListening(false);
      setIntensity(0);
    }
  }, []);

  const _startListening = useCallback(async () => {
    const ok = await _requestMicPermission();
    if (!ok) {
      showError('Microphone permission is required to talk to Cypher.');
      return;
    }
    try {
      const recorder = _getRecorder();
      const uri = await recorder.startRecorder(undefined, undefined, true);
      recordPathRef.current = uri;
      recorder.addRecordBackListener(e => {
        if (!isMountedRef.current) return;
        const next = meteringToIntensity(e?.currentMetering);
        setIntensity(prev => prev * 0.4 + next * 0.6);
      });
      if (isMountedRef.current) setIsListening(true);
    } catch (err) {
      showError(err?.message || 'Unable to start listening');
    }
  }, [_getRecorder, _requestMicPermission]);

  const _onTogglePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(promptFade, {
        toValue: 0.5,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(promptFade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    if (isListening) {
      _stopListening();
    } else {
      _startListening();
    }
  }, [isListening, _startListening, _stopListening, promptFade]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const recorder = audioRecorderPlayerRef.current;
      if (recorder) {
        try {
          recorder.stopRecorder();
        } catch (e) {}
        try {
          recorder.removeRecordBackListener();
        } catch (e) {}
      }
    };
  }, []);

  const orbitSpins = orbitAnims.map(anim =>
    anim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-360deg', '0deg', '360deg'],
    }),
  );

  const idlePulseScale = orbPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const haloOpacity = orbGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.9],
  });
  const haloScale = orbGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12);

  return (
    <WrapperContainer
      paddingAvailable={false}
      isWhiteStatusBar={false}
      statusbarcolorr={'#05010F'}>
      <LinearGradient
        colors={['#0A0420', '#120830', '#05010F']}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.screenRoot,
          {paddingTop: insets.top, paddingBottom: bottomPad},
        ]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            hitSlop={hitSlopProp}
            activeOpacity={0.85}
            onPress={() => navigation?.goBack?.()}
            style={styles.iconBtn}>
            <Image source={imagesPath.ic_back} style={styles.backIcon} />
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <Text style={styles.brandText}>
              C
              <Text style={styles.brandAccent}>Y</Text>
              PHER
            </Text>
          </View>

          <View style={styles.crownBtn}>
            <View style={styles.crownShape}>
              <View style={[styles.crownSpike, styles.crownSpikeLeft]} />
              <View style={[styles.crownSpike, styles.crownSpikeMid]} />
              <View style={[styles.crownSpike, styles.crownSpikeRight]} />
              <View style={styles.crownBase} />
            </View>
          </View>
        </View>

        <View style={styles.centerArea}>
          <Animated.Text style={[styles.promptText, {opacity: promptFade}]}>
            ...Talk to me
          </Animated.Text>

          <TouchableOpacity
            activeOpacity={0.95}
            onPress={_onTogglePress}
            style={styles.orbStage}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ambientGlow,
                {transform: [{scale: haloScale}], opacity: haloOpacity},
              ]}
            />

            <View style={styles.orbitField} pointerEvents="none">
              {particles.map(p => (
                <OrbitParticle
                  key={`p-${p.id}`}
                  particle={p}
                  stageSize={STAGE_SIZE}
                />
              ))}

              {ORBIT_CONFIGS.map((cfg, i) => (
                <OrbitRing
                  key={`orbit-${i}`}
                  config={cfg}
                  spin={orbitSpins[i]}
                />
              ))}
            </View>

            <Animated.View
              style={{
                transform: [{scale: Animated.multiply(orbScale, idlePulseScale)}],
              }}>
              <LinearGradient
                colors={['#FFFFFF', '#F0D4FF', '#B060FF', '#5B18C8', '#2A0870']}
                start={{x: 0.35, y: 0.15}}
                end={{x: 0.85, y: 0.95}}
                style={styles.orb}>
                <View style={styles.orbInnerGlow} />
                <View style={styles.orbCore} />
                <View style={styles.orbBurstH} />
                <View style={styles.orbBurstV} />
                <View style={styles.orbBurstD1} />
                <View style={styles.orbBurstD2} />
              </LinearGradient>
            </Animated.View>

            <View pointerEvents="none" style={styles.orbReflection} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.footerArea, {opacity: statusFade}]}>
          <Text style={styles.listeningText}>I&apos;m listening...</Text>
        </Animated.View>
      </View>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  orbitRingWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRingLine: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(195,0,255,0.55)',
  },
  orbitDot: {
    position: 'absolute',
    height: moderateScale(5),
    width: moderateScale(5),
    borderRadius: moderateScale(2.5),
    backgroundColor: '#C300FF',
    shadowColor: '#C300FF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  orbitDotTop: {
    top: -moderateScale(2.5),
  },
  orbitDotRight: {
    right: -moderateScale(2.5),
  },
  orbitDotBottom: {
    bottom: -moderateScale(2.5),
  },
});

const getStyles = theme =>
  StyleSheet.create({
    screenRoot: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: moderateScale(20),
      paddingTop: moderateScale(4),
    },
    iconBtn: {
      height: moderateScale(36),
      width: moderateScale(36),
      borderRadius: moderateScale(18),
      backgroundColor: 'rgba(255,255,255,0.06)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    backIcon: {
      height: moderateScale(14),
      width: moderateScale(14),
      tintColor: '#FFFFFF',
      resizeMode: 'contain',
    },
    brandWrap: {
      flex: 1,
      alignItems: 'center',
    },
    brandText: {
      color: '#FFFFFF',
      fontSize: textScale(22),
      fontFamily: fontFamily.bold,
      letterSpacing: moderateScale(5),
    },
    brandAccent: {
      color: '#C300FF',
    },
    crownBtn: {
      height: moderateScale(36),
      width: moderateScale(36),
      borderRadius: moderateScale(18),
      backgroundColor: 'rgba(195,0,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(195,0,255,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    crownShape: {
      width: moderateScale(20),
      height: moderateScale(14),
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    crownSpike: {
      position: 'absolute',
      top: 0,
      width: 0,
      height: 0,
      borderLeftWidth: moderateScale(3.4),
      borderRightWidth: moderateScale(3.4),
      borderBottomWidth: moderateScale(9),
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#C300FF',
      transform: [{rotate: '180deg'}],
    },
    crownSpikeLeft: {
      left: 0,
    },
    crownSpikeMid: {
      left: moderateScale(7),
      top: -moderateScale(2),
    },
    crownSpikeRight: {
      right: 0,
    },
    crownBase: {
      width: moderateScale(20),
      height: moderateScale(4),
      borderRadius: moderateScale(1.5),
      backgroundColor: '#C300FF',
    },
    centerArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: moderateScale(8),
    },
    promptText: {
      marginBottom: moderateScale(18),
      textAlign: 'center',
      color: 'rgba(255,255,255,0.45)',
      fontSize: textScale(17),
      fontFamily: fontFamily.medium,
      letterSpacing: 0.3,
    },
    orbStage: {
      height: STAGE_SIZE,
      width: STAGE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ambientGlow: {
      position: 'absolute',
      height: ORB_SIZE * 1.85,
      width: ORB_SIZE * 1.85,
      borderRadius: ORB_SIZE * 0.925,
      backgroundColor: 'rgba(155, 77, 255, 0.16)',
    },
    orbitField: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orb: {
      height: ORB_SIZE,
      width: ORB_SIZE,
      borderRadius: ORB_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#C300FF',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0.95,
      shadowRadius: 35,
      elevation: 24,
    },
    orbInnerGlow: {
      position: 'absolute',
      height: ORB_SIZE * 0.7,
      width: ORB_SIZE * 0.7,
      borderRadius: ORB_SIZE * 0.35,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    orbCore: {
      height: ORB_SIZE * 0.18,
      width: ORB_SIZE * 0.18,
      borderRadius: ORB_SIZE * 0.09,
      backgroundColor: '#FFFFFF',
      shadowColor: '#FFFFFF',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 1,
      shadowRadius: 22,
      elevation: 20,
    },
    orbBurstH: {
      position: 'absolute',
      height: 2,
      width: ORB_SIZE * 0.35,
      borderRadius: 1,
      backgroundColor: 'rgba(255,255,255,0.85)',
    },
    orbBurstV: {
      position: 'absolute',
      height: ORB_SIZE * 0.35,
      width: 2,
      borderRadius: 1,
      backgroundColor: 'rgba(255,255,255,0.85)',
    },
    orbBurstD1: {
      position: 'absolute',
      height: ORB_SIZE * 0.22,
      width: 2,
      borderRadius: 1,
      backgroundColor: 'rgba(255,255,255,0.5)',
      transform: [{rotate: '45deg'}],
    },
    orbBurstD2: {
      position: 'absolute',
      height: ORB_SIZE * 0.22,
      width: 2,
      borderRadius: 1,
      backgroundColor: 'rgba(255,255,255,0.5)',
      transform: [{rotate: '-45deg'}],
    },
    orbReflection: {
      position: 'absolute',
      bottom: ORB_SIZE * 0.02,
      height: ORB_SIZE * 0.45,
      width: ORB_SIZE * 0.45,
      borderRadius: ORB_SIZE * 0.225,
      backgroundColor: 'rgba(155, 77, 255, 0.12)',
    },
    footerArea: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: moderateScale(44),
      paddingBottom: moderateScale(4),
    },
    listeningText: {
      color: '#C300FF',
      fontSize: textScale(16),
      fontFamily: fontFamily.medium,
      letterSpacing: 0.4,
    },
  });

export default CypherScreen;
