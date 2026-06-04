import axios from 'axios';
import {Platform} from 'react-native';
import {CYPHER_VOICE_API} from '../../config/urls';
import {getHeaders} from '../../utils/utils';
import {convertRecordingToMp3} from '../../utils/cypher/convertToMp3';

const normalizeUploadUri = uri => {
  if (!uri) {
    return uri;
  }

  const path = uri.replace(/^file:\/+/, '/');

  if (Platform.OS === 'android') {
    return `file://${path}`;
  }

  return `file://${path}`;
};

const normalizeSpaces = value => value?.replace(/\s+/g, ' ').trim?.() || '';

const shouldStripQuestionForDisplay = data =>
  !!data.onboarding_required &&
  !data.completed &&
  !!data.question?.question?.trim?.();

const stripOnboardingQuestionFromResponse = (response, question) => {
  const trimmedResponse = response?.trim?.() || '';
  const questionPart = question?.question?.trim?.() || '';
  const helpPart = question?.help?.trim?.() || '';

  if (!trimmedResponse || !questionPart) {
    return trimmedResponse;
  }

  const combinedSuffix = [questionPart, helpPart].filter(Boolean).join(' ');
  const suffixCandidates = [
    `\n\n${combinedSuffix}`,
    `\n\n${questionPart}${helpPart ? `\n${helpPart}` : ''}`,
    combinedSuffix,
  ];

  for (const suffix of suffixCandidates) {
    if (trimmedResponse.endsWith(suffix)) {
      return trimmedResponse.slice(0, trimmedResponse.length - suffix.length).trim();
    }
  }

  const questionIndex = trimmedResponse.lastIndexOf(questionPart);
  if (questionIndex > 0) {
    const tail = normalizeSpaces(trimmedResponse.slice(questionIndex));
    const expectedTail = normalizeSpaces(combinedSuffix);

    if (tail === expectedTail || tail.startsWith(normalizeSpaces(questionPart))) {
      return trimmedResponse.slice(0, questionIndex).trim();
    }
  }

  return trimmedResponse;
};

export function parseCypherVoiceResponse(res) {
  if (res?.success === false) {
    throw new Error(res?.message || 'Cypher request failed');
  }

  const payload = res?.data ?? res;
  const data = payload?.data ?? payload;

  if (!data || typeof data !== 'object') {
    throw new Error(res?.message || payload?.message || 'Invalid Cypher response');
  }

  const welcome = data.welcome?.trim?.() || '';
  const response = data.response?.trim?.() || '';
  const questionText = data.question?.question?.trim?.() || '';
  const helpText = data.question?.help?.trim?.() || '';
  const currentStep = data.current_step ?? data.question?.step ?? 0;
  const isOnboardingStep1 =
    !!data.onboarding_required && !data.completed && currentStep === 1;

  // Step 1 / search / clarifying questions: speak only `response`.
  const text =
    isOnboardingStep1 ||
    data.intent === 'search_users' ||
    data.intent === 'view_profile' ||
    !!data.requires_user_input
      ? response || questionText
      : [welcome, response].filter(Boolean).join(' ').trim() || questionText;

  const options = Array.isArray(data.question?.options)
    ? data.question.options.filter(Boolean)
    : [];

  const users = Array.isArray(data.users?.data)
    ? data.users.data
    : Array.isArray(data.users)
      ? data.users
      : [];

  const profile =
    data.profile && typeof data.profile === 'object' ? data.profile : null;

  const displayText = shouldStripQuestionForDisplay(data)
    ? stripOnboardingQuestionFromResponse(response, data.question)
    : response || questionText || text;

  return {
    text,
    displayText,
    transcription: data.transcription?.trim?.() || '',
    questions: options,
    question: data.question || null,
    questionHelp: helpText,
    onboarding: {
      required: !!data.onboarding_required,
      completed: !!data.completed,
      currentStep: data.current_step ?? data.question?.step ?? 0,
      totalSteps: data.total_steps ?? data.question?.total ?? 0,
      progressPercent: data.progress_percent ?? 0,
    },
    answerAccepted: data.answer_accepted !== false,
    previousAnswer: data.previous_answer || null,
    intent: data.intent || null,
    users: profile ? [] : users,
    profile,
    profileResult: data.profile_result || null,
    filters: data.filters || null,
    actionRequired: !!data.action_required,
    targetUserId: data.target_user_id ?? null,
    requiresUserInput: !!data.requires_user_input,
    awaitingUserAnswer: !!data.awaiting_user_answer,
    responseType: data.response_type || null,
    isDatingRelated: !!data.is_dating_related,
    message: res?.message || payload?.message || '',
  };
}

function buildVoiceFormData({audioUri, answer, emptyAudio}) {
  const formData = new FormData();

  if (emptyAudio) {
    formData.append('audio', '');
  } else if (audioUri) {
    formData.append('audio', {
      uri: normalizeUploadUri(audioUri),
      name: `cypher_voice_${Date.now()}.mp3`,
      type: 'audio/mpeg',
    });
  }

  if (answer?.trim()) {
    formData.append('answer', answer.trim());
  }

  return formData;
}

async function postCypherVoice(formData) {
  const authHeaders = await getHeaders();

  try {
    const response = await axios.post(CYPHER_VOICE_API, formData, {
      headers: {
        ...authHeaders,
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response?.data;
    if (data?.status === false) {
      throw new Error(data?.message || 'Cypher request failed');
    }

    return parseCypherVoiceResponse(data);
  } catch (error) {
    const apiMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;

    throw new Error(apiMessage || 'Network Error');
  }
}

export async function submitCypherVoiceInitial() {
  return postCypherVoice(buildVoiceFormData({emptyAudio: true}));
}

export async function submitCypherVoice(audioUri) {
  if (!audioUri) {
    throw new Error('No audio recording to send');
  }

  const mp3Uri = await convertRecordingToMp3(audioUri);
  return postCypherVoice(buildVoiceFormData({audioUri: mp3Uri}));
}

export async function submitCypherAnswer(answer) {
  const trimmed = answer?.trim();
  if (!trimmed) {
    throw new Error('Answer is required');
  }
  return postCypherVoice(buildVoiceFormData({answer: trimmed}));
}
