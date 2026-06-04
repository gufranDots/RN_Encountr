import {useCallback, useEffect, useRef, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AudioRecorderPlayer, {
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVLinearPCMBitDepthKeyIOSType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';

const MAX_RECORD_SECONDS = 60;

const IOS_AUDIO_SET = {
  AVNumberOfChannelsKeyIOS: 1,
  AVSampleRateKeyIOS: 44100,
  AVFormatIDKeyIOS: AVEncodingOption.wav,
  AVLinearPCMBitDepthKeyIOS: AVLinearPCMBitDepthKeyIOSType.bit16,
  AVLinearPCMIsBigEndianKeyIOS: false,
  AVLinearPCMIsFloatKeyIOS: false,
  AVLinearPCMIsNonInterleavedIOS: false,
};

const ANDROID_AUDIO_SET = {
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
};

const buildRecordPath = () => {
  const ext = Platform.OS === 'ios' ? 'wav' : 'aac';
  const fileName = `cypher_${Date.now()}.${ext}`;

  if (Platform.OS === 'android') {
    return `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
  }

  // iOS recorder expects a filename relative to the cache directory.
  return fileName;
};

const getAudioSet = () =>
  Platform.OS === 'ios' ? IOS_AUDIO_SET : ANDROID_AUDIO_SET;

async function requestMicPermission() {
  if (Platform.OS === 'android') {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    if (alreadyGranted) {
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const result = await request(PERMISSIONS.IOS.MICROPHONE);
  return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
}

export default function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [lastError, setLastError] = useState(null);
  const recorderRef = useRef(new AudioRecorderPlayer());
  const recordPathRef = useRef('');
  const autoStopTriggeredRef = useRef(false);

  useEffect(() => {
    const recorder = recorderRef.current;
    return () => {
      try {
        recorder.removeRecordBackListener();
        recorder.stopRecorder().catch(() => {});
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const clearError = useCallback(() => setLastError(null), []);

  const startRecording = useCallback(async () => {
    const micOk = await requestMicPermission();
    if (!micOk) {
      throw new Error('Microphone permission is required');
    }

    const recorder = recorderRef.current;
    setLastError(null);
    autoStopTriggeredRef.current = false;
    recordPathRef.current = '';

    try {
      await recorder.stopRecorder().catch(() => {});
      recorder.removeRecordBackListener();
    } catch (e) {
      // ignore
    }

    try {
      const path = buildRecordPath();
      const result = await recorder.startRecorder(path, getAudioSet(), false);
      recordPathRef.current = result || path;
      setRecordTime('00:00');
      setIsRecording(true);

      recorder.addRecordBackListener(event => {
        const seconds = Math.floor(event.currentPosition / 1000);
        setRecordTime(recorder.mmssss(Math.floor(event.currentPosition)).slice(0, 5));

        if (seconds >= MAX_RECORD_SECONDS && !autoStopTriggeredRef.current) {
          autoStopTriggeredRef.current = true;
          recorder.stopRecorder().catch(() => {});
          recorder.removeRecordBackListener();
          setIsRecording(false);
        }
      });
    } catch (err) {
      setIsRecording(false);
      const message = err?.message || 'Unable to start recording';
      setLastError(message);
      throw new Error(message);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current;

    if (!isRecording && !recordPathRef.current) {
      return '';
    }

    try {
      const result = await recorder.stopRecorder();
      recorder.removeRecordBackListener();
      const finalPath = result || recordPathRef.current;
      recordPathRef.current = finalPath;
      setIsRecording(false);
      return finalPath || '';
    } catch (err) {
      setIsRecording(false);
      const fallbackPath = recordPathRef.current;
      if (fallbackPath) {
        return fallbackPath;
      }
      const message = err?.message || 'Unable to stop recording';
      setLastError(message);
      return '';
    }
  }, [isRecording]);

  const resetRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    try {
      await recorder.stopRecorder().catch(() => {});
      recorder.removeRecordBackListener();
    } catch (e) {
      // ignore
    }

    recordPathRef.current = '';
    setRecordTime('00:00');
    setIsRecording(false);
    setLastError(null);
    await startRecording();
  }, [startRecording]);

  return {
    isRecording,
    recordTime,
    transcript: '',
    lastError,
    clearError,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
