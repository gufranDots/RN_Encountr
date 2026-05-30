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
import {SafeAreaView} from 'react-native-safe-area-context';

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

const ORB_SIZE = Math.min(width * 0.62, 260);
const RING_COLORS = ['#C300FF', '#8A4BFF', '#5B2BD9'];
const STAR_COUNT = 28;

// Map mic metering (in dB, -160..0) to a 0..1 intensity.
// Anything below -45 dB is treated as silence so the orb stays calm.
const meteringToIntensity = db => {
  if (db == null || Number.isNaN(db)) return 0;
  const min = -45;
  const max = -5;
  if (db <= min) return 0;
  if (db >= max) return 1;
  return (db - min) / (max - min);
};

const buildStars = () => {
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i += 1) {
    stars.push({
      id: i,
      top: Math.random() * height,
      left: Math.random() * width,
      size: 1 + Math.random() * 2.4,
      delay: Math.random() * 1800,
      duration: 1400 + Math.random() * 2200,
    });
  }
  return stars;
};

const Star = ({star}) => {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: star.duration / 2,
          delay: star.delay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: star.duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, star.delay, star.duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: star.top,
        left: star.left,
        height: star.size,
        width: star.size,
        borderRadius: star.size / 2,
        backgroundColor: '#FFFFFF',
        opacity,
      }}
    />
  );
};

const CypherScreen = ({navigation}) => {
  const {theme} = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [isListening, setIsListening] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [statusText, setStatusText] = useState("...Talk to me");

  const audioRecorderPlayerRef = useRef(null);
  const recordPathRef = useRef(null);
  const isMountedRef = useRef(true);

  const ringRotateOuter = useRef(new Animated.Value(0)).current;
  const ringRotateMiddle = useRef(new Animated.Value(0)).current;
  const ringRotateInner = useRef(new Animated.Value(0)).current;
  const orbPulse = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbGlow = useRef(new Animated.Value(0.6)).current;
  const taglineFade = useRef(new Animated.Value(1)).current;

  const stars = useMemo(buildStars, []);

  const _getRecorder = useCallback(() => {
    if (!audioRecorderPlayerRef.current) {
      audioRecorderPlayerRef.current = new AudioRecorderPlayer();
    }
    return audioRecorderPlayerRef.current;
  }, []);

  // Continuous orbital ring rotation
  useEffect(() => {
    const spin = (animValue, duration, reverse = false) =>
      Animated.loop(
        Animated.timing(animValue, {
          toValue: reverse ? -1 : 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );

    const a = spin(ringRotateOuter, 18000, false);
    const b = spin(ringRotateMiddle, 12000, true);
    const c = spin(ringRotateInner, 8000, false);
    a.start();
    b.start();
    c.start();
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [ringRotateOuter, ringRotateMiddle, ringRotateInner]);

  // Idle breathing pulse on the orb when not listening
  useEffect(() => {
    if (isListening) {
      orbPulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isListening, orbPulse]);

  // Cycle through tagline phrases when listening
  useEffect(() => {
    if (!isListening) {
      setStatusText('...Talk to me');
      return undefined;
    }
    const phrases = ['I\u2019m listening...', 'Speak to me...', 'Go ahead...'];
    let idx = 0;
    setStatusText(phrases[0]);
    const id = setInterval(() => {
      idx = (idx + 1) % phrases.length;
      Animated.sequence([
        Animated.timing(taglineFade, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();
      setTimeout(() => {
        if (isMountedRef.current) setStatusText(phrases[idx]);
      }, 220);
    }, 3200);
    return () => clearInterval(id);
  }, [isListening, taglineFade]);

  // React to mic intensity (monster / sound detection)
  useEffect(() => {
    Animated.spring(orbScale, {
      toValue: 1 + intensity * 0.32,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
    Animated.timing(orbGlow, {
      toValue: 0.55 + intensity * 0.45,
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
    if (isListening) {
      _stopListening();
    } else {
      _startListening();
    }
  }, [isListening, _startListening, _stopListening]);

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

  const outerSpin = ringRotateOuter.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-360deg', '0deg', '360deg'],
  });
  const middleSpin = ringRotateMiddle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-360deg', '0deg', '360deg'],
  });
  const innerSpin = ringRotateInner.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-360deg', '0deg', '360deg'],
  });

  const idlePulseScale = orbPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const haloOpacity = orbGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.85],
  });
  const haloScale = orbGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.35],
  });

  return (
    <WrapperContainer
      paddingAvailable={false}
      isWhiteStatusBar={false}
      statusbarcolorr={'#05010F'}>
      <LinearGradient
        colors={['#0A0420', '#180A35', '#05010F']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      {/* twinkling stars */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {stars.map(s => (
          <Star key={`star-${s.id}`} star={s} />
        ))}
      </View>

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            hitSlop={hitSlopProp}
            activeOpacity={0.85}
            onPress={() => navigation?.goBack?.()}
            style={styles.iconBtn}>
            <Image source={imagesPath.ic_back} style={styles.backIcon} />
          </TouchableOpacity>

          <Text style={styles.brandText}>CYPHER</Text>

          <View style={styles.crownBtn}>
            <View style={styles.crownShape}>
              <View style={[styles.crownSpike, styles.crownSpikeLeft]} />
              <View style={[styles.crownSpike, styles.crownSpikeMid]} />
              <View style={[styles.crownSpike, styles.crownSpikeRight]} />
              <View style={styles.crownBase} />
            </View>
          </View>
        </View>

        <Animated.Text style={[styles.greetingText, {opacity: taglineFade}]}>
          {statusText}
        </Animated.Text>
      </SafeAreaView>

      <View style={styles.orbStage}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.haloRing,
            {
              transform: [{scale: haloScale}],
              opacity: haloOpacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.ringWrap,
            styles.outerRing,
            {transform: [{rotate: outerSpin}]},
          ]}>
          <View style={[styles.ringDot, {backgroundColor: RING_COLORS[0]}]} />
          <View
            style={[
              styles.ringDot,
              styles.ringDotOpposite,
              {backgroundColor: RING_COLORS[2]},
            ]}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.ringWrap,
            styles.middleRing,
            {transform: [{rotate: middleSpin}]},
          ]}>
          <View style={[styles.ringDot, {backgroundColor: RING_COLORS[1]}]} />
          <View
            style={[
              styles.ringDot,
              styles.ringDotOpposite,
              {backgroundColor: RING_COLORS[0]},
            ]}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.ringWrap,
            styles.innerRing,
            {transform: [{rotate: innerSpin}]},
          ]}>
          <View style={[styles.ringDot, {backgroundColor: RING_COLORS[2]}]} />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{scale: Animated.multiply(orbScale, idlePulseScale)}],
          }}>
          <LinearGradient
            colors={['#FFFFFF', '#E0B6FF', '#9B4DFF', '#3B1080']}
            start={{x: 0.3, y: 0.2}}
            end={{x: 1, y: 1}}
            style={styles.orb}>
            <View style={styles.orbCore} />
            <View style={styles.orbStarA} />
            <View style={styles.orbStarB} />
            <View style={styles.orbStarC} />
          </LinearGradient>
        </Animated.View>

        {/* reflection */}
        <View pointerEvents="none" style={styles.orbReflection} />
      </View>

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <View style={styles.intensityTrack}>
          <View
            style={[
              styles.intensityFill,
              {width: `${Math.round(intensity * 100)}%`},
            ]}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={_onTogglePress}
          style={styles.listenBtnWrap}>
          <LinearGradient
            colors={
              isListening
                ? ['#FF5C8A', '#C300FF', '#5B2BD9']
                : ['#C300FF', '#7A1AFF', '#3D108E']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.listenBtn}>
            <Image source={imagesPath.mic} style={styles.listenIcon} />
            <Text style={styles.listenText}>
              {isListening ? 'Stop listening' : "I'm listening..."}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </WrapperContainer>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    headerSafe: {
      paddingHorizontal: moderateScale(20),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: moderateScale(4),
    },
    iconBtn: {
      height: moderateScale(36),
      width: moderateScale(36),
      borderRadius: moderateScale(18),
      backgroundColor: 'rgba(255,255,255,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },
    backIcon: {
      height: moderateScale(14),
      width: moderateScale(14),
      tintColor: '#FFFFFF',
      resizeMode: 'contain',
    },
    brandText: {
      color: '#FFFFFF',
      fontSize: textScale(20),
      fontFamily: fontFamily.bold,
      letterSpacing: moderateScale(6),
    },
    crownBtn: {
      height: moderateScale(36),
      width: moderateScale(36),
      borderRadius: moderateScale(18),
      backgroundColor: 'rgba(195,0,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(195,0,255,0.35)',
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
    greetingText: {
      marginTop: moderateScale(28),
      textAlign: 'center',
      color: 'rgba(255,255,255,0.65)',
      fontSize: textScale(18),
      fontFamily: fontFamily.medium,
      letterSpacing: 0.5,
    },
    orbStage: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    haloRing: {
      position: 'absolute',
      height: ORB_SIZE * 1.6,
      width: ORB_SIZE * 1.6,
      borderRadius: ORB_SIZE * 0.8,
      backgroundColor: 'rgba(155, 77, 255, 0.18)',
    },
    ringWrap: {
      position: 'absolute',
      borderWidth: 1,
      alignItems: 'center',
    },
    outerRing: {
      height: ORB_SIZE * 1.55,
      width: ORB_SIZE * 1.55,
      borderRadius: ORB_SIZE * 0.78,
      borderColor: 'rgba(195,0,255,0.30)',
      transform: [{rotate: '0deg'}],
    },
    middleRing: {
      height: ORB_SIZE * 1.3,
      width: ORB_SIZE * 1.3,
      borderRadius: ORB_SIZE * 0.65,
      borderColor: 'rgba(154,77,255,0.45)',
    },
    innerRing: {
      height: ORB_SIZE * 1.08,
      width: ORB_SIZE * 1.08,
      borderRadius: ORB_SIZE * 0.54,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    ringDot: {
      position: 'absolute',
      top: -moderateScale(3),
      height: moderateScale(6),
      width: moderateScale(6),
      borderRadius: moderateScale(3),
      shadowColor: '#C300FF',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 1,
      shadowRadius: 6,
      elevation: 6,
    },
    ringDotOpposite: {
      top: undefined,
      bottom: -moderateScale(3),
    },
    orb: {
      height: ORB_SIZE,
      width: ORB_SIZE,
      borderRadius: ORB_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#C300FF',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0.9,
      shadowRadius: 30,
      elevation: 24,
    },
    orbCore: {
      height: ORB_SIZE * 0.22,
      width: ORB_SIZE * 0.22,
      borderRadius: ORB_SIZE * 0.11,
      backgroundColor: '#FFFFFF',
      shadowColor: '#FFFFFF',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 20,
    },
    orbStarA: {
      position: 'absolute',
      top: ORB_SIZE * 0.18,
      left: ORB_SIZE * 0.32,
      height: 3,
      width: 3,
      borderRadius: 1.5,
      backgroundColor: '#FFFFFF',
      opacity: 0.9,
    },
    orbStarB: {
      position: 'absolute',
      bottom: ORB_SIZE * 0.22,
      right: ORB_SIZE * 0.26,
      height: 2.5,
      width: 2.5,
      borderRadius: 1.25,
      backgroundColor: '#FFFFFF',
      opacity: 0.7,
    },
    orbStarC: {
      position: 'absolute',
      top: ORB_SIZE * 0.5,
      right: ORB_SIZE * 0.18,
      height: 2,
      width: 2,
      borderRadius: 1,
      backgroundColor: '#FFFFFF',
      opacity: 0.6,
    },
    orbReflection: {
      position: 'absolute',
      bottom: ORB_SIZE * 0.05,
      height: ORB_SIZE * 0.55,
      width: ORB_SIZE * 0.55,
      borderRadius: ORB_SIZE * 0.275,
      backgroundColor: 'rgba(155, 77, 255, 0.14)',
    },
    footerSafe: {
      paddingHorizontal: moderateScale(24),
      paddingBottom: moderateScale(12),
      alignItems: 'center',
    },
    intensityTrack: {
      width: '70%',
      height: moderateScale(4),
      borderRadius: moderateScale(2),
      backgroundColor: 'rgba(255,255,255,0.10)',
      overflow: 'hidden',
      marginBottom: moderateScale(14),
    },
    intensityFill: {
      height: '100%',
      borderRadius: moderateScale(2),
      backgroundColor: '#C300FF',
    },
    listenBtnWrap: {
      width: '85%',
      borderRadius: moderateScale(32),
      shadowColor: '#C300FF',
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.55,
      shadowRadius: 14,
      elevation: 10,
    },
    listenBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: moderateScale(32),
      paddingVertical: moderateScale(14),
    },
    listenIcon: {
      height: moderateScale(18),
      width: moderateScale(18),
      tintColor: '#FFFFFF',
      resizeMode: 'contain',
      marginRight: moderateScale(10),
    },
    listenText: {
      color: '#FFFFFF',
      fontSize: textScale(15),
      fontFamily: fontFamily.SemiBold,
      letterSpacing: 0.5,
    },
  });

export default CypherScreen;
