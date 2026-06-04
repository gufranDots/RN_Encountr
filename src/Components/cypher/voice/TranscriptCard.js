import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS} from '../../../constants/cypher/colors';
import {hitSlopProp} from '../../../styles/commonStyles';
import {moderateScale, textScale} from '../../../styles/responsiveSize';
import fontFamily from '../../../styles/fontFamily';

const TranscriptCard = ({
  text,
  visible,
  heading = 'YOU SAID',
  onStopSpeech,
  isSpeaking = false,
}) => {
  if (!visible || !text?.trim()) {
    return null;
  }

  const showStop = !!onStopSpeech && isSpeaking;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{heading}</Text>
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
      <Text style={styles.body}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: moderateScale(24),
    marginBottom: moderateScale(8),
    padding: moderateScale(14),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(109,40,217,0.35)',
    backgroundColor: 'rgba(46,16,101,0.45)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(6),
    gap: moderateScale(8),
  },
  heading: {
    fontFamily: fontFamily.medium,
    fontSize: textScale(9),
    color: COLORS.textMuted,
    letterSpacing: 2,
    flex: 1,
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
    fontSize: textScale(8),
    color: COLORS.purple100,
    letterSpacing: 1.2,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(13),
    color: COLORS.purple100,
    lineHeight: textScale(20),
  },
});

export default TranscriptCard;
