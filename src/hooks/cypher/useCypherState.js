import {useCallback, useEffect, useRef, useState} from 'react';
import {
  submitCypherAnswer,
  submitCypherVoice,
  submitCypherVoiceInitial,
} from '../../services/cypher/api';
import useSpeech from './useSpeech';
import useVoiceRecorder from './useVoiceRecorder';

const INITIAL = {
  state: 'THINKING',
  transcript: '',
  response: '',
  questions: [],
  selectedQuestion: null,
  question: null,
  questionHelp: '',
  onboarding: null,
  answerAccepted: true,
  intent: null,
  users: [],
  profile: null,
  requiresUserInput: false,
  awaitingUserAnswer: false,
  error: null,
};

const IDLE_RESET = {
  ...INITIAL,
  state: 'IDLE',
};

export default function useCypherState() {
  const [cypherState, setCypherState] = useState(INITIAL);
  const pendingQuestionsRef = useRef([]);
  const pendingOnboardingRef = useRef(null);
  const pendingUsersRef = useRef([]);
  const pendingProfileRef = useRef(null);
  const pendingRequiresUserInputRef = useRef(false);
  const abortRef = useRef(false);
  const autoListenRef = useRef(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const mountInitDoneRef = useRef(false);

  const beginListening = useCallback(async voice => {
    try {
      voice.clearError();
      setCypherState(prev => ({
        ...prev,
        state: 'LISTENING',
        transcript: '',
        response: '',
        selectedQuestion: null,
        users: [],
        profile: null,
        error: null,
      }));
      await voice.startRecording();
    } catch (err) {
      const errorMessage = err?.message || 'Unable to start listening';
      setCypherState(prev => ({
        ...prev,
        state: 'IDLE',
        error: errorMessage,
      }));
    }
  }, []);

  const isActiveOnboarding = onboarding =>
    onboarding?.required && !onboarding?.completed;

  const shouldAwaitVoiceAnswer = result =>
    !!result?.requiresUserInput || !!result?.awaitingUserAnswer;

  const handleTtsComplete = useCallback(() => {
    const pendingQuestions = pendingQuestionsRef.current;
    const pendingOnboarding = pendingOnboardingRef.current;

    if (isActiveOnboarding(pendingOnboarding)) {
      autoListenRef.current = true;
      setCypherState(prev => ({
        ...prev,
        state: 'LISTENING',
        questions: pendingQuestions,
      }));
      return;
    }

    if (pendingRequiresUserInputRef.current) {
      autoListenRef.current = true;
      setCypherState(prev => ({
        ...prev,
        state: 'LISTENING',
        questions: pendingQuestions,
      }));
      return;
    }

    if (pendingQuestions.length > 0) {
      setCypherState(prev => ({
        ...prev,
        state: 'QUESTIONS',
        questions: pendingQuestions,
      }));
      return;
    }

    if (pendingUsersRef.current.length > 0) {
      setCypherState(prev => ({
        ...prev,
        state: 'IDLE',
      }));
      return;
    }

    if (pendingProfileRef.current) {
      setCypherState(prev => ({
        ...prev,
        state: 'IDLE',
      }));
      return;
    }

    setCypherState(prev => ({
      ...prev,
      state: pendingOnboarding?.completed ? 'IDLE' : prev.state,
    }));
  }, []);

  const {isSpeaking, highlightWordIndex, speak, stop: stopTts} =
    useSpeech(handleTtsComplete);
  const voice = useVoiceRecorder();

  useEffect(() => {
    if (!autoListenRef.current || cypherState.state !== 'LISTENING') {
      return;
    }
    autoListenRef.current = false;
    voice.startRecording().catch(err => {
      setCypherState(prev => ({
        ...prev,
        state: 'IDLE',
        error: err?.message || 'Unable to start listening',
      }));
    });
  }, [cypherState.state, voice]);

  useEffect(() => {
    if (voice.lastError && cypherState.state === 'LISTENING') {
      setCypherState(prev => ({
        ...prev,
        error: voice.lastError,
      }));
    }
  }, [voice.lastError, cypherState.state]);

  useEffect(() => {
    if (
      cypherState.state !== 'QUESTIONS' ||
      (!isActiveOnboarding(cypherState.onboarding) &&
        !cypherState.requiresUserInput &&
        !cypherState.awaitingUserAnswer)
    ) {
      return;
    }
    autoListenRef.current = true;
    setCypherState(prev => ({
      ...prev,
      state: 'LISTENING',
    }));
  }, [
    cypherState.state,
    cypherState.onboarding,
    cypherState.requiresUserInput,
    cypherState.awaitingUserAnswer,
  ]);

  const finishInitialLoad = useCallback(() => {
    setIsInitialLoad(false);
  }, []);

  const applyApiResult = useCallback(
    result => {
      finishInitialLoad();
      const speechText = result.text?.trim?.() || '';
      const displayResponse = result.displayText?.trim?.() || speechText;
      const transcription = result.transcription?.trim?.() || '';
      const hasResponse = !!speechText;

      pendingQuestionsRef.current = result.questions || [];
      pendingOnboardingRef.current = result.onboarding || null;
      pendingUsersRef.current = result.users || [];
      pendingProfileRef.current = result.profile || null;
      pendingRequiresUserInputRef.current = shouldAwaitVoiceAnswer(result);

      const profileFields = {
        users: result.users || [],
        profile: result.profile || null,
      };

      if (!result.answerAccepted) {
        setCypherState(prev => ({
          ...prev,
          state: hasResponse ? 'SPEAKING' : 'LISTENING',
          transcript: transcription || prev.transcript,
          response: displayResponse,
          questions: result.questions || [],
          question: result.question,
          questionHelp: result.questionHelp || '',
          onboarding: result.onboarding,
          answerAccepted: false,
          intent: result.intent,
          ...profileFields,
          requiresUserInput: !!result.requiresUserInput,
          awaitingUserAnswer: !!result.awaitingUserAnswer,
          error: null,
        }));

        if (hasResponse) {
          speak(speechText);
        } else {
          autoListenRef.current = true;
        }
        return;
      }

      if (result.onboarding?.completed) {
        pendingQuestionsRef.current = [];
        setCypherState(prev => ({
          ...prev,
          state: hasResponse ? 'SPEAKING' : 'IDLE',
          transcript: transcription,
          response: displayResponse,
          questions: [],
          question: result.question,
          questionHelp: result.questionHelp || '',
          onboarding: result.onboarding,
          answerAccepted: true,
          intent: result.intent,
          ...profileFields,
          requiresUserInput: !!result.requiresUserInput,
          awaitingUserAnswer: !!result.awaitingUserAnswer,
          error: null,
        }));

        if (hasResponse) {
          speak(speechText);
        }
        return;
      }

      setCypherState(prev => ({
        ...prev,
        state: hasResponse ? 'SPEAKING' : 'LISTENING',
        transcript: transcription,
        response: displayResponse,
        questions: result.questions || [],
        question: result.question,
        questionHelp: result.questionHelp || '',
        onboarding: result.onboarding,
        answerAccepted: true,
        intent: result.intent,
        ...profileFields,
        requiresUserInput: !!result.requiresUserInput,
        awaitingUserAnswer: !!result.awaitingUserAnswer,
        error: null,
      }));

      if (hasResponse) {
        speak(speechText);
      } else if (result.onboarding?.required || shouldAwaitVoiceAnswer(result)) {
        autoListenRef.current = true;
      }
    },
    [speak, finishInitialLoad],
  );

  const _callVoiceApi = useCallback(
    async audioUri => {
      abortRef.current = false;
      try {
        const result = await submitCypherVoice(audioUri);
        if (abortRef.current) {
          return;
        }
        applyApiResult(result);
      } catch (err) {
        if (abortRef.current) {
          return;
        }
        const errorMessage =
          err?.message || err?.msg || 'Something went wrong';
        finishInitialLoad();
        setCypherState(prev => ({
          ...prev,
          state: 'IDLE',
          error: errorMessage,
        }));
      }
    },
    [applyApiResult, finishInitialLoad],
  );

  const _callInitialVoiceApi = useCallback(async () => {
    abortRef.current = false;
    setCypherState(prev => ({
      ...prev,
      state: 'THINKING',
      transcript: '',
      response: '',
      error: null,
    }));
    try {
      const result = await submitCypherVoiceInitial();
      if (abortRef.current) {
        return;
      }
      applyApiResult(result);
    } catch (err) {
      if (abortRef.current) {
        return;
      }
      const errorMessage =
        err?.message || err?.msg || 'Something went wrong';
      finishInitialLoad();
      setCypherState(prev => ({
        ...prev,
        state: 'IDLE',
        error: errorMessage,
      }));
    }
  }, [applyApiResult, finishInitialLoad]);

  useEffect(() => {
    if (mountInitDoneRef.current) {
      return undefined;
    }
    mountInitDoneRef.current = true;
    _callInitialVoiceApi();
    return () => {
      abortRef.current = true;
    };
  }, [_callInitialVoiceApi]);

  const _callAnswerApi = useCallback(
    async answer => {
      abortRef.current = false;
      try {
        const result = await submitCypherAnswer(answer);
        if (abortRef.current) {
          return;
        }
        applyApiResult(result);
      } catch (err) {
        if (abortRef.current) {
          return;
        }
        const errorMessage =
          err?.message || err?.msg || 'Something went wrong';
        finishInitialLoad();
        setCypherState(prev => ({
          ...prev,
          state: 'IDLE',
          error: errorMessage,
        }));
      }
    },
    [applyApiResult, finishInitialLoad],
  );

  const startListening = useCallback(async () => {
    try {
      await stopTts();
      await beginListening(voice);
    } catch (err) {
      const errorMessage = err?.message || 'Unable to start listening';
      setCypherState(prev => ({
        ...prev,
        state: 'IDLE',
        error: errorMessage,
      }));
    }
  }, [voice, stopTts, beginListening]);

  const stopListening = useCallback(async () => {
    setCypherState(prev => ({
      ...prev,
      state: 'THINKING',
      error: null,
    }));

    const audioUri = await voice.stopRecording();

    if (!audioUri) {
      setCypherState(prev => ({
        ...prev,
        state: 'IDLE',
        error: voice.lastError || 'No recording found. Try again.',
      }));
      return;
    }

    _callVoiceApi(audioUri);
  }, [voice, _callVoiceApi]);

  const retryListening = useCallback(async () => {
    try {
      await stopTts();
      await voice.resetRecording();
      setCypherState(prev => ({
        ...prev,
        state: 'LISTENING',
        transcript: '',
        error: null,
      }));
    } catch (err) {
      const errorMessage = err?.message || 'Unable to retry';
      setCypherState(prev => ({
        ...prev,
        state: 'IDLE',
        error: errorMessage,
      }));
    }
  }, [voice, stopTts]);

  const cancelThinking = useCallback(async () => {
    abortRef.current = true;
    try {
      await voice.stopRecording();
    } catch (e) {
      // ignore
    }
    setCypherState(prev => ({
      ...INITIAL,
      state: 'IDLE',
      questions: prev.questions,
      onboarding: prev.onboarding,
      question: prev.question,
      questionHelp: prev.questionHelp,
      users: prev.users,
      profile: prev.profile,
    }));
  }, [voice]);

  const stopSpeaking = useCallback(async () => {
    abortRef.current = true;
    await stopTts();
    const onboarding = pendingOnboardingRef.current;
    if (isActiveOnboarding(onboarding) || pendingRequiresUserInputRef.current) {
      autoListenRef.current = true;
      setCypherState(prev => ({
        ...prev,
        state: 'LISTENING',
        response: prev.response,
      }));
      return;
    }
    setCypherState(prev => ({
      ...prev,
      state: 'IDLE',
      response: '',
    }));
  }, [stopTts]);

  const newConversation = useCallback(async () => {
    abortRef.current = true;
    await stopTts();
    try {
      await voice.stopRecording();
    } catch (e) {
      // ignore
    }
    pendingQuestionsRef.current = [];
    pendingOnboardingRef.current = null;
    pendingUsersRef.current = [];
    pendingProfileRef.current = null;
    pendingRequiresUserInputRef.current = false;
    autoListenRef.current = false;
    setIsInitialLoad(false);
    setCypherState(IDLE_RESET);
  }, [stopTts, voice]);

  const selectQuestion = useCallback(
    question => {
      setCypherState(prev => ({
        ...prev,
        state: 'THINKING',
        selectedQuestion: question,
        transcript: question,
        error: null,
      }));
      _callAnswerApi(question);
    },
    [_callAnswerApi],
  );

  const submitCustom = useCallback(
    text => {
      const trimmed = text?.trim();
      if (!trimmed) {
        return;
      }
      setCypherState(prev => ({
        ...prev,
        state: 'THINKING',
        selectedQuestion: trimmed,
        transcript: trimmed,
        error: null,
      }));
      _callAnswerApi(trimmed);
    },
    [_callAnswerApi],
  );

  return {
    cypherState,
    isInitialLoad,
    isSpeaking,
    highlightWordIndex,
    isRecording: voice.isRecording,
    recordTime: voice.recordTime,
    liveTranscript: '',
    startListening,
    stopListening,
    retryListening,
    cancelThinking,
    stopSpeaking,
    newConversation,
    selectQuestion,
    submitCustom,
  };
}
