import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {enableFreeze} from 'react-native-screens';

import ButtonComp from '../../Components/ButtonComp';
import {Loader} from '../../Components/Loader';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import {uploadVoiceMessageApi} from '../../redux/reduxActions/homeActions';
import {getCommonStyles, hitSlopProp} from '../../styles/commonStyles';
import {moderateScale, textScale} from '../../styles/responsiveSize';
import {useTheme} from '../../theme/ThemeProvider';
import {ApiError, showError, showSuccess} from '../../utils/helperFunctions';

enableFreeze();

const MAX_RECORD_SECONDS = 30;

const VoiceDrop = ({navigation, route}) => {
  const {theme, isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles, isDark);

  const fromProfile = !!route?.params?.fromProfile;

  const audioRecorderPlayerRef = useRef(new AudioRecorderPlayer());

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordPath, setRecordPath] = useState(null);
  const [recordTime, setRecordTime] = useState('00:00');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [loading, setLoading] = useState(false);

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const player = audioRecorderPlayerRef.current;
    return () => {
      try {
        player.removeRecordBackListener();
        player.removePlayBackListener();
        player.stopRecorder().catch(() => {});
        player.stopPlayer().catch(() => {});
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      pulseAnim.setValue(0);
      const loop = Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(0);
    return undefined;
  }, [isRecording, pulseAnim]);

  const _requestMicPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  };

  const _onStartRecord = useCallback(async () => {
    const ok = await _requestMicPermission();
    if (!ok) {
      return showError(strings.microphonePermissionRequired);
    }
    try {
      const player = audioRecorderPlayerRef.current;
      const result = await player.startRecorder();
      player.addRecordBackListener(e => {
        const seconds = Math.floor(e.currentPosition / 1000);
        setRecordSeconds(seconds);
        setRecordTime(player.mmssss(Math.floor(e.currentPosition)).slice(0, 5));
        if (seconds >= MAX_RECORD_SECONDS) {
          _onStopRecord();
        }
      });
      setRecordPath(result);
      setIsRecording(true);
    } catch (err) {
      showError(err?.message || 'Unable to start recording');
    }
  }, []);

  const _onStopRecord = useCallback(async () => {
    try {
      const player = audioRecorderPlayerRef.current;
      const result = await player.stopRecorder();
      player.removeRecordBackListener();
      setIsRecording(false);
      setRecordPath(result);
    } catch (err) {
      setIsRecording(false);
      showError(err?.message || 'Unable to stop recording');
    }
  }, []);

  const _onStartPlay = useCallback(async () => {
    if (!recordPath) return;
    try {
      const player = audioRecorderPlayerRef.current;
      await player.startPlayer(recordPath);
      setIsPlaying(true);
      player.addPlayBackListener(e => {
        setPlayTime(player.mmssss(Math.floor(e.currentPosition)).slice(0, 5));
        setDuration(player.mmssss(Math.floor(e.duration)).slice(0, 5));
        if (e.currentPosition >= e.duration) {
          player.stopPlayer().catch(() => {});
          player.removePlayBackListener();
          setIsPlaying(false);
          setPlayTime('00:00');
        }
      });
    } catch (err) {
      setIsPlaying(false);
      showError(err?.message || 'Unable to play recording');
    }
  }, [recordPath]);

  const _onStopPlay = useCallback(async () => {
    try {
      const player = audioRecorderPlayerRef.current;
      await player.stopPlayer();
      player.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00');
    } catch (err) {
      setIsPlaying(false);
    }
  }, []);

  const _onReRecord = () => {
    setRecordPath(null);
    setRecordTime('00:00');
    setRecordSeconds(0);
    setPlayTime('00:00');
    setDuration('00:00');
  };

  const _onPressMic = () => {
    if (isRecording) {
      _onStopRecord();
    } else if (recordPath) {
      isPlaying ? _onStopPlay() : _onStartPlay();
    } else {
      _onStartRecord();
    }
  };

  const _onSkip = async () => {
    if (loading) return;
    try {
      if (isRecording) {
        await _onStopRecord();
      }
      if (isPlaying) {
        await _onStopPlay();
      }
    } catch (e) {}
    navigation.reset({
      index: 0,
      routes: [{name: navigationString.SETUP_COMPLETED}],
    });
  };

  const _onContinue = async () => {
    if (loading) return;

    if (isRecording) {
      await _onStopRecord();
    }
    if (isPlaying) {
      await _onStopPlay();
    }

    if (!recordPath) {
      return showError(strings.pleaseRecordYourVoice);
    }

    const uri =
      Platform.OS === 'ios' && !recordPath.startsWith('file://')
        ? `file://${recordPath}`
        : recordPath;

    const lowerPath = (recordPath || '').toLowerCase();
    let ext = 'm4a';
    let mime = 'audio/m4a';
    if (lowerPath.endsWith('.mp3')) {
      ext = 'mp3';
      mime = 'audio/mpeg';
    } else if (lowerPath.endsWith('.mp4')) {
      ext = 'mp4';
      mime = 'audio/mp4';
    } else if (lowerPath.endsWith('.aac')) {
      ext = 'aac';
      mime = 'audio/aac';
    } else if (lowerPath.endsWith('.wav')) {
      ext = 'wav';
      mime = 'audio/wav';
    }

    const data = new FormData();
    data.append('voice_message', {
      uri,
      name: `voice_message_${Date.now()}.${ext}`,
      type: mime,
    });

    setLoading(true);
    uploadVoiceMessageApi(data)
      .then(res => {
        setLoading(false);
        if (res?.message) {
          showSuccess(res.message);
        }
        if (fromProfile) {
          if (navigation.canGoBack()) {
            navigation.popToTop();
          } else {
            navigation.navigate(navigationString.DrawerStack, {
              screen: navigationString.BOTTOM_STACK,
              params: {screen: navigationString.HOME},
            });
          }
          return;
        }
        navigation.reset({
          index: 0,
          routes: [{name: navigationString.SETUP_COMPLETED}],
        });
      })
      .catch(error => {
        setLoading(false);
        showError(ApiError(error));
      });
  };

  const _getMicLabel = () => {
    if (isRecording) return strings.tapToStop;
    if (recordPath) return isPlaying ? strings.tapToPause : strings.tapToPlay;
    return strings.tapToRecord;
  };

  const _getStatusLabel = () => {
    if (isRecording) return 'Recording';
    if (isPlaying) return 'Playing';
    if (recordPath) return 'Ready';
    return 'Idle';
  };

  const progress = Math.min(recordSeconds / MAX_RECORD_SECONDS, 1);

  const micGradient = isRecording
    ? [theme.colors.pink_164, theme.colors.red, theme.colors.burningOrange]
    : [theme.colors.florsentTheme, theme.colors.pink_164, theme.colors.themecolor2];

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <WrapperContainer paddingAvailable={false}>
      <LinearGradient
        colors={
          isDark
            ? ['#1B1736', '#0F120E', '#0F120E']
            : ['#F4ECFF', '#FFFFFF', '#FFFFFF']
        }
        start={{x: 0.1, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.bgGradient}
      />

      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            hitSlop={hitSlopProp}
            onPress={() => {
              if (loading || isRecording) return;
              navigation.goBack();
            }}
            style={styles.headerBtn}>
            <Image
              source={imagesPath.ic_back}
              style={styles.headerBtnIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{strings.voiceDrop}</Text>
          {!fromProfile ? (
            <TouchableOpacity
              activeOpacity={0.85}
              hitSlop={hitSlopProp}
              disabled={loading}
              onPress={_onSkip}
              style={[
                styles.headerBtn,
                styles.headerBtnSkip,
                loading && {opacity: 0.5},
              ]}>
              <Text style={styles.headerSkipText}>{strings.skip}</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.headerBtn, styles.headerBtnGhost]}>
              <Image
                source={imagesPath.mic}
                style={styles.headerBtnIconAccent}
              />
            </View>
          )}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBadgeWrap}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>{_getStatusLabel()}</Text>
          </View>
          <Text style={styles.heroTitle}>{strings.recordYourVoiceIntro}</Text>
          <Text style={styles.heroSub}>
            Up to {MAX_RECORD_SECONDS}s · Be yourself
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.recorderArea}>
        <View style={styles.ringOuter}>
          <View style={styles.ringMid}>
            <View style={styles.ringInner}>
              {isRecording ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.pulseRing,
                    {
                      transform: [{scale: pulseScale}],
                      opacity: pulseOpacity,
                    },
                  ]}
                />
              ) : null}
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={loading}
                onPress={_onPressMic}
                style={[styles.micWrap, loading && {opacity: 0.6}]}>
                <LinearGradient
                  colors={micGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.micButton}>
                  <Image
                    source={
                      isRecording
                        ? imagesPath.stopIcon || imagesPath.mic
                        : isPlaying
                        ? imagesPath.stopIcon || imagesPath.mic
                        : recordPath
                        ? imagesPath.volume
                        : imagesPath.ic_microphone
                    }
                    style={styles.micIcon}
                  />
                  {!isRecording && !isPlaying ? (
                    <Text style={styles.micTapText}>Tap</Text>
                  ) : null}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.timerText}>
          {isRecording
            ? recordTime
            : recordPath
            ? `${playTime} / ${duration !== '00:00' ? duration : recordTime}`
            : '00:00'}
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {width: `${Math.max(progress * 100, isRecording ? 4 : 0)}%`},
            ]}
          />
        </View>

        <Text style={styles.tapHintText}>{_getMicLabel()}</Text>

        {recordPath && !isRecording ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.reRecordBtn}
            onPress={_onReRecord}>
            <Text style={styles.reRecordTxt}>{strings.reRecord}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.footerWrap}>
        <View style={styles.footerCard}>
          <View style={styles.footerHintRow}>
            <View style={styles.footerHintDot} />
            <Text style={styles.footerHintText}>
              Tap mic to {recordPath ? 'preview' : 'record'} ·{' '}
              {MAX_RECORD_SECONDS - recordSeconds > 0 && isRecording
                ? `${MAX_RECORD_SECONDS - recordSeconds}s left`
                : 'Max 30s'}
            </Text>
          </View>
          <ButtonComp
            btnStyle={styles.btnStyle}
            btnText={strings.continue}
            onPressBtn={_onContinue}
            loading={loading}
            disabled={loading || isRecording}
            btnView={{
              backgroundColor:
                loading || isRecording
                  ? theme.colors.grey_187_1
                  : theme.colors.themecolor2,
            }}
          />
        </View>
      </SafeAreaView>

      <Loader isLoading={loading} />
    </WrapperContainer>
  );
};

const getStyles = (theme, commonStyles, isDark) =>
  StyleSheet.create({
    bgGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    headerWrap: {
      paddingHorizontal: moderateScale(16),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: moderateScale(4),
    },
    headerBtn: {
      height: moderateScale(40),
      width: moderateScale(40),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: isDark
        ? theme.colors.blackOpacity20
        : theme.colors.blackOpacity10,
      backgroundColor: isDark
        ? theme.colors.blackOpacity10
        : theme.colors.primaryWhite,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerBtnGhost: {
      backgroundColor: isDark
        ? theme.colors.blackOpacity10
        : 'rgba(195,0,255,0.08)',
      borderColor: isDark
        ? theme.colors.blackOpacity20
        : 'rgba(195,0,255,0.18)',
    },
    headerBtnSkip: {
      width: 'auto',
      paddingHorizontal: moderateScale(14),
      backgroundColor: isDark
        ? 'rgba(195,0,255,0.18)'
        : 'rgba(195,0,255,0.10)',
      borderColor: isDark
        ? 'rgba(195,0,255,0.32)'
        : 'rgba(195,0,255,0.22)',
    },
    headerSkipText: {
      ...commonStyles.font_14_SemiBold,
      color: theme.colors.florsentTheme,
    },
    headerBtnIcon: {
      height: moderateScale(16),
      width: moderateScale(16),
      tintColor: theme.colors.black,
      resizeMode: 'contain',
    },
    headerBtnIconAccent: {
      height: moderateScale(16),
      width: moderateScale(16),
      tintColor: theme.colors.florsentTheme,
      resizeMode: 'contain',
    },
    headerTitle: {
      ...commonStyles.font_18_SemiBold,
      color: theme.colors.black,
      fontSize: textScale(18),
    },
    heroCard: {
      marginTop: moderateScale(16),
      borderRadius: moderateScale(20),
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(16),
      borderWidth: 1,
      borderColor: isDark
        ? theme.colors.blackOpacity12
        : theme.colors.blackOpacity10,
      backgroundColor: isDark
        ? theme.colors.blackOpacity10
        : theme.colors.primaryWhite,
    },
    heroBadgeWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(999),
      backgroundColor: isDark
        ? 'rgba(195,0,255,0.18)'
        : 'rgba(195,0,255,0.10)',
    },
    heroBadgeDot: {
      height: moderateScale(6),
      width: moderateScale(6),
      borderRadius: moderateScale(3),
      backgroundColor: theme.colors.florsentTheme,
      marginRight: moderateScale(6),
    },
    heroBadgeText: {
      ...commonStyles.font_12_SemiBold,
      color: theme.colors.florsentTheme,
    },
    heroTitle: {
      ...commonStyles.font_16_SemiBold,
      color: theme.colors.black,
      marginTop: moderateScale(10),
    },
    heroSub: {
      ...commonStyles.font_12_medium,
      color: theme.colors.gray2,
      marginTop: moderateScale(4),
    },
    recorderArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: moderateScale(16),
    },
    ringOuter: {
      height: moderateScale(260),
      width: moderateScale(260),
      borderRadius: moderateScale(130),
      backgroundColor: isDark
        ? 'rgba(195,0,255,0.06)'
        : 'rgba(195,0,255,0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark
        ? theme.colors.blackOpacity10
        : theme.colors.blackOpacity10,
    },
    ringMid: {
      height: moderateScale(210),
      width: moderateScale(210),
      borderRadius: moderateScale(105),
      backgroundColor: isDark
        ? 'rgba(229,168,200,0.10)'
        : 'rgba(229,168,200,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark
        ? theme.colors.blackOpacity10
        : theme.colors.blackOpacity10,
    },
    ringInner: {
      height: moderateScale(170),
      width: moderateScale(170),
      borderRadius: moderateScale(85),
      alignItems: 'center',
      justifyContent: 'center',
    },
    pulseRing: {
      position: 'absolute',
      height: moderateScale(170),
      width: moderateScale(170),
      borderRadius: moderateScale(85),
      backgroundColor: theme.colors.pink_164,
    },
    micWrap: {
      height: moderateScale(140),
      width: moderateScale(140),
      borderRadius: moderateScale(70),
      shadowColor: theme.colors.florsentTheme,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: isDark ? 0.45 : 0.25,
      shadowRadius: 16,
      elevation: 10,
    },
    micButton: {
      flex: 1,
      borderRadius: moderateScale(70),
      alignItems: 'center',
      justifyContent: 'center',
    },
    micIcon: {
      height: moderateScale(48),
      width: moderateScale(48),
      tintColor: theme.colors.primaryWhite,
      resizeMode: 'contain',
    },
    micTapText: {
      ...commonStyles.font_12_SemiBold,
      color: theme.colors.primaryWhite,
      marginTop: moderateScale(4),
      letterSpacing: 1,
      textAlign: 'center',
    },
    timerText: {
      ...commonStyles.font_28_bold,
      marginTop: moderateScale(28),
      color: theme.colors.black,
      letterSpacing: 1,
    },
    progressTrack: {
      width: '70%',
      height: moderateScale(6),
      borderRadius: moderateScale(3),
      backgroundColor: isDark
        ? theme.colors.blackOpacity10
        : theme.colors.blackOpacity10,
      marginTop: moderateScale(14),
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: moderateScale(3),
      backgroundColor: theme.colors.florsentTheme,
    },
    tapHintText: {
      ...commonStyles.font_14_medium,
      marginTop: moderateScale(12),
      color: theme.colors.black,
      opacity: 0.75,
    },
    reRecordBtn: {
      marginTop: moderateScale(18),
      paddingVertical: moderateScale(10),
      paddingHorizontal: moderateScale(22),
      borderRadius: moderateScale(999),
      borderWidth: 1,
      borderColor: theme.colors.florsentTheme,
      backgroundColor: isDark
        ? 'rgba(195,0,255,0.10)'
        : 'rgba(195,0,255,0.06)',
    },
    reRecordTxt: {
      ...commonStyles.font_14_SemiBold,
      color: theme.colors.florsentTheme,
    },
    footerWrap: {
      paddingHorizontal: moderateScale(16),
    },
    footerCard: {
      borderRadius: moderateScale(20),
      paddingHorizontal: moderateScale(14),
      paddingTop: moderateScale(12),
      paddingBottom: moderateScale(14),
      backgroundColor: isDark
        ? theme.colors.blackOpacity10
        : theme.colors.primaryWhite,
      borderWidth: 1,
      borderColor: isDark
        ? theme.colors.blackOpacity12
        : theme.colors.blackOpacity10,
      marginBottom: moderateScale(8),
    },
    footerHintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(10),
      paddingHorizontal: moderateScale(2),
    },
    footerHintDot: {
      height: moderateScale(6),
      width: moderateScale(6),
      borderRadius: moderateScale(3),
      backgroundColor: theme.colors.florsentTheme,
      marginRight: moderateScale(8),
    },
    footerHintText: {
      ...commonStyles.font_12_medium,
      color: theme.colors.gray2,
    },
    btnStyle: {
      paddingHorizontal: 0,
    },
  });

export default VoiceDrop;
