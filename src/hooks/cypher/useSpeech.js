import {useCallback, useEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {
  charIndexToWordIndex,
  tokenizeWords,
} from '../../utils/cypher/tokenizeWords';

const getTts = () => require('react-native-tts').default;
const IOS_AUDIO_HANDOFF_MS = Platform.OS === 'ios' ? 500 : 0;
const IOS_SPEECH_RATE = 0.48;
const PROGRESS_FALLBACK_MS = 900;
const PROGRESS_STALL_MS = 1200;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const getProgressCharIndex = event => {
  if (Platform.OS === 'android') {
    return event?.start ?? event?.location ?? 0;
  }
  return event?.location ?? event?.start ?? 0;
};

const prepareIosAudioSession = async Tts => {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    await Tts.setIgnoreSilentSwitch('ignore');
  } catch (e) {
    console.warn('Cypher TTS ignore silent switch:', e);
  }

  await delay(IOS_AUDIO_HANDOFF_MS);
};

export default function useSpeech(onComplete) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highlightWordIndex, setHighlightWordIndex] = useState(-1);
  const onCompleteRef = useRef(onComplete);
  const ttsReadyRef = useRef(false);
  const initPromiseRef = useRef(null);
  const currentTextRef = useRef('');
  const fallbackTimerRef = useRef(null);
  const estimateTimerRef = useRef(null);
  const progressFallbackTimerRef = useRef(null);
  const progressStallTimerRef = useRef(null);
  const speakingActiveRef = useRef(false);
  const ttsStartedRef = useRef(false);
  const progressReceivedRef = useRef(false);
  const lastProgressCharIndexRef = useRef(-1);
  const progressEventCountRef = useRef(0);
  const estimateWordIndexRef = useRef(0);
  const highlightWordIndexRef = useRef(-1);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimers = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (estimateTimerRef.current) {
      clearInterval(estimateTimerRef.current);
      estimateTimerRef.current = null;
    }
    if (progressFallbackTimerRef.current) {
      clearTimeout(progressFallbackTimerRef.current);
      progressFallbackTimerRef.current = null;
    }
    if (progressStallTimerRef.current) {
      clearTimeout(progressStallTimerRef.current);
      progressStallTimerRef.current = null;
    }
  }, []);

  const setHighlightIndex = useCallback(wordIndex => {
    if (wordIndex < 0) {
      highlightWordIndexRef.current = -1;
      setHighlightWordIndex(-1);
      return;
    }
    setHighlightWordIndex(prev => {
      const next = wordIndex > prev ? wordIndex : prev;
      highlightWordIndexRef.current = next;
      return next;
    });
  }, []);

  const finishSpeaking = useCallback(() => {
    if (!speakingActiveRef.current) {
      return;
    }
    speakingActiveRef.current = false;
    ttsStartedRef.current = false;
    progressReceivedRef.current = false;
    lastProgressCharIndexRef.current = -1;
    progressEventCountRef.current = 0;
    clearTimers();
    setIsSpeaking(false);
    highlightWordIndexRef.current = -1;
    setHighlightWordIndex(-1);
    onCompleteRef.current?.();
  }, [clearTimers]);

  const stopEstimateHighlight = useCallback(() => {
    if (estimateTimerRef.current) {
      clearInterval(estimateTimerRef.current);
      estimateTimerRef.current = null;
    }
  }, []);

  const startEstimateHighlight = useCallback(
    (text, startFromIndex = 0) => {
      const words = tokenizeWords(text);
      if (!words.length) {
        return;
      }

      stopEstimateHighlight();
      let idx = Math.max(0, Math.min(startFromIndex, words.length - 1));
      estimateWordIndexRef.current = idx;
      const msPerWord = Math.max(380, Math.min(620, 20000 / words.length));

      setHighlightIndex(idx);

      estimateTimerRef.current = setInterval(() => {
        idx += 1;
        if (idx >= words.length) {
          stopEstimateHighlight();
          return;
        }
        estimateWordIndexRef.current = idx;
        setHighlightIndex(idx);
      }, msPerWord);
    },
    [setHighlightIndex, stopEstimateHighlight],
  );

  const scheduleProgressStallCheck = useCallback(
    onStall => {
      if (progressStallTimerRef.current) {
        clearTimeout(progressStallTimerRef.current);
      }
      progressStallTimerRef.current = setTimeout(() => {
        if (speakingActiveRef.current && progressReceivedRef.current) {
          onStall();
        }
      }, PROGRESS_STALL_MS);
    },
    [],
  );

  useEffect(() => {
    let mounted = true;
    let Tts;

    initPromiseRef.current = (async () => {
      try {
        Tts = getTts();
        ttsReadyRef.current = true;
        await Tts.getInitStatus();

        try {
          await Tts.setDefaultLanguage('en-US');
        } catch (e) {
          console.warn('Cypher TTS language fallback:', e);
        }

        if (Platform.OS === 'ios') {
          try {
            await Tts.setIgnoreSilentSwitch('ignore');
          } catch (e) {
            console.warn('Cypher TTS iOS silent switch:', e);
          }
        }

        if (!mounted) {
          ttsReadyRef.current = false;
        }
      } catch (e) {
        console.warn('Cypher TTS init failed:', e);
      }
    })();

    try {
      Tts = getTts();

      const scheduleProgressFallback = () => {
        if (progressFallbackTimerRef.current) {
          clearTimeout(progressFallbackTimerRef.current);
        }
        progressFallbackTimerRef.current = setTimeout(() => {
          if (
            speakingActiveRef.current &&
            !progressReceivedRef.current &&
            currentTextRef.current
          ) {
            startEstimateHighlight(currentTextRef.current, 0);
          }
        }, PROGRESS_FALLBACK_MS);
      };

      const onStart = () => {
        ttsStartedRef.current = true;
        progressReceivedRef.current = false;
        lastProgressCharIndexRef.current = -1;
        progressEventCountRef.current = 0;
        setIsSpeaking(true);
        setHighlightWordIndex(-1);
        scheduleProgressFallback();
      };

      const onProgress = event => {
        const charIndex = getProgressCharIndex(event);
        progressEventCountRef.current += 1;

        const charAdvanced =
          charIndex > lastProgressCharIndexRef.current ||
          progressEventCountRef.current >= 2;

        if (charAdvanced) {
          progressReceivedRef.current = true;
          stopEstimateHighlight();

          if (progressFallbackTimerRef.current) {
            clearTimeout(progressFallbackTimerRef.current);
            progressFallbackTimerRef.current = null;
          }

          lastProgressCharIndexRef.current = charIndex;

          const wordIndex = charIndexToWordIndex(
            currentTextRef.current,
            charIndex,
          );

          if (wordIndex >= 0) {
            setHighlightIndex(wordIndex);
          }
        }

        scheduleProgressStallCheck(() => {
          const resumeFrom = Math.max(
            highlightWordIndexRef.current >= 0
              ? highlightWordIndexRef.current
              : 0,
            estimateWordIndexRef.current,
          );
          startEstimateHighlight(currentTextRef.current, resumeFrom + 1);
        });
      };

      const onFinish = () => finishSpeaking();
      const onCancel = () => {
        clearTimers();
        speakingActiveRef.current = false;
        ttsStartedRef.current = false;
        progressReceivedRef.current = false;
        lastProgressCharIndexRef.current = -1;
        progressEventCountRef.current = 0;
        setIsSpeaking(false);
        highlightWordIndexRef.current = -1;
        setHighlightWordIndex(-1);
      };

      const subscriptions = [
        Tts.addListener('tts-start', onStart),
        Tts.addListener('tts-progress', onProgress),
        Tts.addListener('tts-finish', onFinish),
        Tts.addListener('tts-cancel', onCancel),
      ];

      if (Platform.OS === 'android') {
        subscriptions.push(
          Tts.addListener('tts-error', event => {
            console.warn('Cypher TTS error:', event);
            finishSpeaking();
          }),
        );
      }

      return () => {
        mounted = false;
        subscriptions.forEach(subscription => subscription?.remove?.());
        clearTimers();
      };
    } catch (e) {
      console.warn('Cypher TTS unavailable:', e);
      return undefined;
    }
  }, [
    clearTimers,
    finishSpeaking,
    setHighlightIndex,
    startEstimateHighlight,
    stopEstimateHighlight,
    scheduleProgressStallCheck,
  ]);

  const speak = useCallback(
    async text => {
      const trimmed = text?.trim();
      if (!trimmed) {
        finishSpeaking();
        return;
      }

      clearTimers();
      currentTextRef.current = trimmed;
      speakingActiveRef.current = true;
      ttsStartedRef.current = false;
      progressReceivedRef.current = false;
      lastProgressCharIndexRef.current = -1;
      progressEventCountRef.current = 0;
      setIsSpeaking(true);
      setHighlightWordIndex(-1);

      try {
        await initPromiseRef.current;
      } catch (e) {
        console.warn('Cypher TTS init wait failed:', e);
      }

      if (!ttsReadyRef.current) {
        console.warn('Cypher TTS not ready — text only mode');
        startEstimateHighlight(trimmed, 0);
        fallbackTimerRef.current = setTimeout(
          () => finishSpeaking(),
          Math.min(trimmed.length * 70, 35000),
        );
        return;
      }

      const Tts = getTts();

      try {
        await prepareIosAudioSession(Tts);

        const speakOptions =
          Platform.OS === 'ios' ? {rate: IOS_SPEECH_RATE} : undefined;

        if (speakOptions) {
          Tts.speak(trimmed, speakOptions);
        } else {
          Tts.speak(trimmed);
        }

        fallbackTimerRef.current = setTimeout(() => {
          if (!ttsStartedRef.current) {
            console.warn(
              'Cypher TTS did not start — check Mac/simulator volume',
            );
          }
          finishSpeaking();
        }, Math.min(trimmed.length * 95 + 3500, 50000));
      } catch (e) {
        console.warn('Cypher TTS speak failed:', e);
        startEstimateHighlight(trimmed, 0);
        fallbackTimerRef.current = setTimeout(
          () => finishSpeaking(),
          Math.min(trimmed.length * 70, 35000),
        );
      }
    },
    [clearTimers, finishSpeaking, setHighlightIndex, startEstimateHighlight],
  );

  const stop = useCallback(async () => {
    speakingActiveRef.current = false;
    ttsStartedRef.current = false;
    progressReceivedRef.current = false;
    lastProgressCharIndexRef.current = -1;
    progressEventCountRef.current = 0;
    clearTimers();
    setHighlightWordIndex(-1);
    setIsSpeaking(false);

    if (ttsReadyRef.current) {
      const Tts = getTts();
      try {
        await Tts.stop();
      } catch (e) {
        console.warn('Cypher TTS stop failed:', e);
      }
    }
  }, [clearTimers]);

  return {isSpeaking, highlightWordIndex, speak, stop};
}
