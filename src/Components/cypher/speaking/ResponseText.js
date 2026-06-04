import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS} from '../../../constants/cypher/colors';
import {hitSlopProp} from '../../../styles/commonStyles';
import {moderateScale} from '../../../styles/responsiveSize';
import fontFamily from '../../../styles/fontFamily';
import {
  buildWordRanges,
  tokenizeWords,
} from '../../../utils/cypher/tokenizeWords';

const SCROLL_VIEW_HEIGHT = moderateScale(128);
const SCROLL_PADDING = moderateScale(24);

const HighlightWord = React.memo(
  ({word, index, highlightWordIndex, isSpeaking}) => {
    let style = styles.wordDone;
    if (isSpeaking) {
      if (index < highlightWordIndex) {
        style = styles.wordSpoken;
      } else if (index === highlightWordIndex) {
        style = styles.wordCurrent;
      } else {
        style = styles.wordUpcoming;
      }
    }

    return (
      <Text style={style}>
        {word}{' '}
      </Text>
    );
  },
  (prev, next) =>
    prev.word === next.word &&
    prev.index === next.index &&
    prev.isSpeaking === next.isSpeaking &&
    prev.highlightWordIndex === next.highlightWordIndex,
);

const mapWordsToLineOffsets = (text, lines) => {
  const ranges = buildWordRanges(text);
  if (!ranges.length || !lines?.length) {
    return [];
  }

  const offsets = new Array(ranges.length);
  let charIndex = 0;

  lines.forEach(line => {
    const lineText = line?.text ?? '';
    const lineStart = charIndex;
    const lineEnd = charIndex + lineText.length;

    ranges.forEach((range, wordIndex) => {
      if (offsets[wordIndex] !== undefined) {
        return;
      }
      if (range.start >= lineStart && range.start < lineEnd) {
        offsets[wordIndex] = line.y;
      }
    });

    charIndex = lineEnd;
    if (charIndex < text.length && text[charIndex] === '\n') {
      charIndex += 1;
    }
  });

  return offsets;
};

const ResponseText = ({
  text,
  isSpeaking,
  highlightWordIndex = -1,
  heading = 'CYPHER',
  onStopSpeech,
}) => {
  const scrollRef = useRef(null);
  const wordLineOffsetsRef = useRef([]);
  const scrollViewHeightRef = useRef(SCROLL_VIEW_HEIGHT);

  const words = useMemo(() => tokenizeWords(text), [text]);

  const scrollToWord = useCallback(
    (wordIndex, animated = true) => {
      if (wordIndex < 0 || !scrollRef.current) {
        return;
      }

      const lineY = wordLineOffsetsRef.current[wordIndex];
      if (typeof lineY !== 'number') {
        return;
      }

      const targetY = Math.max(
        0,
        lineY - (scrollViewHeightRef.current - SCROLL_PADDING) / 2,
      );

      scrollRef.current.scrollTo({
        y: targetY,
        animated,
      });
    },
    [],
  );

  useEffect(() => {
    wordLineOffsetsRef.current = [];
  }, [text]);

  useEffect(() => {
    if (!isSpeaking || highlightWordIndex < 0) {
      return;
    }
    scrollToWord(highlightWordIndex, true);
  }, [highlightWordIndex, isSpeaking, scrollToWord, text]);

  const handleTextLayout = useCallback(
    event => {
      const lines = event?.nativeEvent?.lines;
      if (!text?.trim() || !lines?.length) {
        return;
      }

      wordLineOffsetsRef.current = mapWordsToLineOffsets(text, lines);

      if (isSpeaking && highlightWordIndex >= 0) {
        scrollToWord(highlightWordIndex, false);
      }
    },
    [text, isSpeaking, highlightWordIndex, scrollToWord],
  );

  const handleScrollLayout = useCallback(event => {
    scrollViewHeightRef.current = event.nativeEvent.layout.height;
  }, []);

  if (!text?.trim()) {
    return null;
  }

  const showStop = !!onStopSpeech && isSpeaking;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{heading}</Text>
        <View style={styles.headerActions}>
          {isSpeaking ? (
            <View style={styles.speakingBadge}>
              <View style={styles.speakingDot} />
              <Text style={styles.speakingLabel}>SPEAKING</Text>
            </View>
          ) : null}
          {showStop ? (
            <TouchableOpacity
              hitSlop={hitSlopProp}
              onPress={onStopSpeech}
              style={styles.stopBtn}
              activeOpacity={0.85}>
              <Text style={styles.stopLabel}>STOP</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        onLayout={handleScrollLayout}>
        <Text style={styles.body} onTextLayout={handleTextLayout}>
          {words.map((word, i) => (
            <HighlightWord
              key={`${word}-${i}`}
              word={word}
              index={i}
              highlightWordIndex={highlightWordIndex}
              isSpeaking={isSpeaking}
            />
          ))}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: moderateScale(20),
    marginBottom: moderateScale(8),
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    backgroundColor: 'rgba(46,16,101,0.55)',
    maxHeight: moderateScale(168),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(8),
    gap: moderateScale(8),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  stopBtn: {
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.55)',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    backgroundColor: 'rgba(109,40,217,0.25)',
  },
  stopLabel: {
    fontFamily: fontFamily.medium,
    fontSize: moderateScale(8),
    color: COLORS.purple100,
    letterSpacing: 1.2,
  },
  heading: {
    fontFamily: fontFamily.medium,
    fontSize: moderateScale(10),
    color: COLORS.purple200,
    letterSpacing: 2,
    flex: 1,
  },
  speakingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(5),
  },
  speakingDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: COLORS.purple200,
  },
  speakingLabel: {
    fontFamily: fontFamily.medium,
    fontSize: moderateScale(9),
    color: COLORS.purple200,
    letterSpacing: 1.2,
  },
  scroll: {
    maxHeight: SCROLL_VIEW_HEIGHT,
  },
  scrollContent: {
    paddingBottom: moderateScale(8),
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(24),
  },
  wordUpcoming: {
    color: COLORS.textDim,
    opacity: 0.55,
  },
  wordCurrent: {
    color: COLORS.white,
    fontFamily: fontFamily.medium,
    opacity: 1,
  },
  wordSpoken: {
    color: COLORS.purple100,
    opacity: 0.88,
  },
  wordDone: {
    color: COLORS.purple100,
    opacity: 1,
  },
});

export default React.memo(ResponseText);
