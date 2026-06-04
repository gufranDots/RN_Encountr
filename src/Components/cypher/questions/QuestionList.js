import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS} from '../../../constants/cypher/colors';
import {moderateScale, textScale} from '../../../styles/responsiveSize';
import fontFamily from '../../../styles/fontFamily';

const QuestionCard = ({question, onPress, index}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => onPress(question)}
    style={styles.card}>
    <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
    <Text style={styles.text}>{question}</Text>
  </TouchableOpacity>
);

const QuestionList = ({questions = [], onSelect}) => {
  if (!questions.length) {
    return null;
  }

  return (
    <View style={styles.list}>
      {questions.map((q, i) => (
        <QuestionCard
          key={`${q}-${i}`}
          question={q}
          index={i}
          onPress={onSelect}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    width: '100%',
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(109,40,217,0.3)',
    backgroundColor: 'rgba(46,16,101,0.35)',
    gap: moderateScale(10),
  },
  index: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(10),
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    color: COLORS.purple100,
    lineHeight: textScale(18),
  },
});

export default QuestionList;
