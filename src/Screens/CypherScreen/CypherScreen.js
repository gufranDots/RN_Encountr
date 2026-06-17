import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ActionButton,
  ActionRow,
  VoiceButton,
} from '../../Components/cypher/voice/VoiceButton';


import HudCorners from '../../Components/cypher/orbit/HudCorners';
import OrbitAnimation from '../../Components/cypher/orbit/OrbitAnimation';
import WaveformBars from '../../Components/cypher/voice/WaveformBars';
import QuestionList from '../../Components/cypher/questions/QuestionList';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import ResponseText from '../../Components/cypher/speaking/ResponseText';
import SpeakControls from '../../Components/cypher/speaking/SpeakControls';
import BouncingDots from '../../Components/cypher/ui/BouncingDots';
import {CypherStatusBar, HudLabel} from '../../Components/cypher/ui/HudLabel';
import ScanLine from '../../Components/cypher/ui/ScanLine';
import TranscriptCard from '../../Components/cypher/voice/TranscriptCard';
import UserResultsCarousel, {
  UserProfileDetailCard,
} from '../../Components/cypher/users/UserResultsCarousel';
import { COLORS } from '../../constants/cypher/colors';
import { moderateScale, width, height, textScale } from '../../styles/responsiveSize';
import { STATE_LABELS } from '../../constants/cypher/animations';
import { showError } from '../../utils/helperFunctions';
import useCypherState from '../../hooks/cypher/useCypherState';
import { hitSlopProp } from '../../styles/commonStyles';
import fontFamily from '../../styles/fontFamily';
import imagesPath from '../../constants/imagesPath';
import { WrapperContainer } from '../../Components';
const ORBIT_HEIGHT = height * 0.42;

const ORBIT_SIZE = width * 0.72;

const CypherOrbitSection = React.memo(() => (
  <View style={styles.orbitSection}>
    <OrbitAnimation size={ORBIT_SIZE} hue="purple" idSuffix="cypher" />
  </View>
));

const CypherFooterPanel = React.memo(
  ({
    state,
    transcript,
    recordTime,
    isRecording,
    response,
    questions,
    questionHelp,
    question,
    onboarding,
    requiresUserInput,
    isSpeaking,
    isInitialLoad,
    highlightWordIndex,
    customInput,
    onCustomInputChange,
    onSubmitCustom,
    startListening,
    stopListening,
    retryListening,
    cancelThinking,
    stopSpeaking,
    newConversation,
    selectQuestion,
  }) => {
    const isOnboarding =
      onboarding?.required && !onboarding?.completed;
    const awaitingVoiceAnswer = !!requiresUserInput;
    const optionLabel = isOnboarding ? 'CHOOSE AN OPTION' : 'SUGGESTED';

    switch (state) {
      case 'IDLE':
        if (isInitialLoad) {
          return <BouncingDots visible />;
        }
        return (
          <VoiceButton onPress={startListening} label="START LISTENING" />
        );

      case 'LISTENING':
        return (
          <>
            <WaveformBars visible state="LISTENING" />
            {isOnboarding && !!question?.question && (
              <TranscriptCard
                text={question.question}
                visible
                heading="QUESTION"
                isSpeaking={isSpeaking}
                onStopSpeech={stopSpeaking}
              />
            )}
            {awaitingVoiceAnswer && !!response && !isOnboarding && (
              <TranscriptCard
                text={response}
                visible
                heading="QUESTION"
                isSpeaking={isSpeaking}
                onStopSpeech={stopSpeaking}
              />
            )}
            {isRecording && (
              <TranscriptCard
                text={`Recording ${recordTime}`}
                visible
                heading="LISTENING"
              />
            )}
            {!!questionHelp && (
              <TranscriptCard text={questionHelp} visible heading="HINT" />
            )}
            <ActionRow>
              <ActionButton
                label="RETRY"
                onPress={retryListening}
                variant="ghost"
              />
              <ActionButton label="DONE" onPress={stopListening} />
            </ActionRow>
          </>
        );

      case 'THINKING':
        return (
          <>
            <BouncingDots visible />
            <TranscriptCard text={transcript} visible={!!transcript} />
            <ActionRow>
              <ActionButton
                label="CANCEL"
                onPress={cancelThinking}
                variant="ghost"
              />
            </ActionRow>
          </>
        );

      case 'SPEAKING':
        return (
          <>
            <TranscriptCard text={transcript} visible={!!transcript} />
            <ResponseText
              text={response}
              isSpeaking={isSpeaking}
              highlightWordIndex={highlightWordIndex}
              heading={
                isOnboarding || awaitingVoiceAnswer ? 'QUESTION' : 'CYPHER'
              }
              onStopSpeech={stopSpeaking}
            />
            <WaveformBars visible state="SPEAKING" />
            <SpeakControls onStop={stopSpeaking} onNew={newConversation} />
          </>
        );

      case 'QUESTIONS':
        if (isOnboarding) {
          return (
            <>
              <WaveformBars visible state="LISTENING" />
              {!!question?.question && (
                <TranscriptCard
                  text={question.question}
                  visible
                  heading="QUESTION"
                  isSpeaking={isSpeaking}
                  onStopSpeech={stopSpeaking}
                />
              )}
              {!!questionHelp && (
                <TranscriptCard text={questionHelp} visible heading="HINT" />
              )}
              <ActionRow>
                <ActionButton
                  label="RETRY"
                  onPress={retryListening}
                  variant="ghost"
                />
                <ActionButton label="DONE" onPress={stopListening} />
              </ActionRow>
            </>
          );
        }
        return (
          <>
            {!!response && (
              <ResponseText
                text={response}
                isSpeaking={false}
                highlightWordIndex={-1}
              />
            )}
            {!!questionHelp && (
              <TranscriptCard text={questionHelp} visible heading="HINT" />
            )}
            {questions.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{optionLabel}</Text>
                <QuestionList questions={questions} onSelect={selectQuestion} />
              </>
            )}
            <View style={styles.inputRow}>
              <TextInput
                value={customInput}
                onChangeText={onCustomInputChange}
                placeholder="Ask something else..."
                placeholderTextColor={COLORS.textDim}
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={onSubmitCustom}
              />
              <TouchableOpacity
                hitSlop={hitSlopProp}
                onPress={onSubmitCustom}
                style={styles.sendBtn}>
                <Text style={styles.sendLabel}>SEND</Text>
              </TouchableOpacity>
            </View>
            <ActionRow style={styles.questionsActions}>
              <ActionButton
                label="NEW SESSION"
                onPress={newConversation}
                variant="ghost"
              />
            </ActionRow>
          </>
        );

      default:
        return null;
    }
  },
);

const CypherScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [customInput, setCustomInput] = useState('');

  const {
    cypherState,
    isSpeaking,
    isInitialLoad,
    highlightWordIndex,
    recordTime,
    isRecording,
    startListening,
    stopListening,
    retryListening,
    cancelThinking,
    stopSpeaking,
    newConversation,
    selectQuestion,
    submitCustom,
  } = useCypherState();

  const {
    state,
    transcript,
    response,
    questions,
    questionHelp,
    question,
    onboarding,
    requiresUserInput,
    users,
    profile,
    error,
  } = cypherState;

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  const _onBack = useCallback(async () => {
    await stopSpeaking();
    try {
      await cancelThinking();
    } catch (e) {
      // ignore
    }
    navigation.goBack();
  }, [navigation, stopSpeaking, cancelThinking]);

  const _onSubmitCustom = useCallback(() => {
    const trimmed = customInput.trim();
    if (!trimmed) {
      return;
    }
    setCustomInput('');
    submitCustom(trimmed);
  }, [customInput, submitCustom]);

  const footerPaddingBottom = useMemo(
    () => insets.bottom + moderateScale(12),
    [insets.bottom],
  );

  return (
    <WrapperContainer paddingAvailable={false} isSafeAreaAvailable={false}>
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.bgPurple, COLORS.bgMid, COLORS.bgDeep]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top}>
          <HudCorners />
          <ScanLine state={state} />

          <View style={styles.header}>
            <TouchableOpacity
              hitSlop={hitSlopProp}
              onPress={_onBack}
              style={styles.backBtn}>
              <Image
                source={imagesPath.ic_back}
                style={styles.backIcon}
                tintColor={COLORS.purple100}
              />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <CypherStatusBar />
              {onboarding?.required && !onboarding?.completed ? (
                <Text style={styles.progressLabel}>
                  Step {onboarding.currentStep} of {onboarding.totalSteps}
                  {onboarding.progressPercent
                    ? ` · ${onboarding.progressPercent}%`
                    : ''}
                </Text>
              ) : null}
              <HudLabel state={state} label={STATE_LABELS[state]} />
            </View>
            <View style={styles.backBtn} />
          </View>

          <View style={styles.body}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}>
              {profile ? (
                <UserProfileDetailCard profile={profile} />
              ) : users?.length > 0 ? (
                <UserResultsCarousel users={users} />
              ) : (
                <CypherOrbitSection />
              )}
            </ScrollView>

            <View style={[styles.footer, {paddingBottom: footerPaddingBottom}]}>
              <CypherFooterPanel
                state={state}
                transcript={transcript}
                recordTime={recordTime}
                isRecording={isRecording}
                response={response}
                questions={questions}
                questionHelp={questionHelp}
                question={question}
                onboarding={onboarding}
                requiresUserInput={requiresUserInput}
                isSpeaking={isSpeaking}
                isInitialLoad={isInitialLoad}
                highlightWordIndex={highlightWordIndex}
                customInput={customInput}
                onCustomInputChange={setCustomInput}
                onSubmitCustom={_onSubmitCustom}
                startListening={startListening}
                stopListening={stopListening}
                retryListening={retryListening}
                cancelThinking={cancelThinking}
                stopSpeaking={stopSpeaking}
                newConversation={newConversation}
                selectQuestion={selectQuestion}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScale(4),
    zIndex: 2,
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    resizeMode: 'contain',
  },
  headerCenter: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  orbitSection: {
    minHeight: ORBIT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: moderateScale(8),
  },
  footer: {
    justifyContent: 'flex-end',
    paddingTop: moderateScale(8),
    gap: moderateScale(8),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: moderateScale(20),
    marginTop: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(109,40,217,0.35)',
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(46,16,101,0.4)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: COLORS.purple100,
    paddingVertical: moderateScale(10),
  },
  sendBtn: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(8),
  },
  sendLabel: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(10),
    color: COLORS.purple200,
    letterSpacing: 1.5,
  },
  questionsActions: {
    marginTop: moderateScale(8),
  },
  progressLabel: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(9),
    color: COLORS.purple200,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: moderateScale(2),
  },
  sectionLabel: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(9),
    color: COLORS.textMuted,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: moderateScale(4),
  },
});

export default CypherScreen;
