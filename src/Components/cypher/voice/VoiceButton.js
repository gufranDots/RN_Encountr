import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS} from '../../../constants/cypher/colors';
import {moderateScale} from '../../../styles/responsiveSize';
import fontFamily from '../../../styles/fontFamily';

const VoiceButton = ({onPress, label = 'START LISTENING'}) => (
  <ActionRow>
    <ActionButton label={label} onPress={onPress} />
  </ActionRow>
);

const ActionButton = ({label, onPress, variant = 'primary', style}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.actionBtn, variant === 'ghost' && styles.ghostBtn, style]}>
    <Text
      style={[styles.actionLabel, variant === 'ghost' && styles.ghostLabel]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ActionRow = ({children, style}) => (
  <View style={[styles.row, style]}>{children}</View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: moderateScale(10),
    paddingHorizontal: moderateScale(24),
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    minHeight: moderateScale(48),
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(109,40,217,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  ghostBtn: {
    backgroundColor: 'transparent',
    borderColor: COLORS.purple400,
  },
  actionLabel: {
    fontFamily: fontFamily.medium,
    fontSize: moderateScale(12),
    color: COLORS.purple100,
    letterSpacing: 1.5,
  },
  ghostLabel: {
    color: COLORS.purple200,
  },
});

export {VoiceButton, ActionButton, ActionRow};
