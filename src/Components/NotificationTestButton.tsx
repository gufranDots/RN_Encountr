import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { testNotificationDot, clearNotificationDot } from '../redux/reduxActions/homeActions';
import colors from '../styles/colors';
import { moderateScale, verticalScale } from '../styles/responsiveSize';

interface NotificationTestButtonProps {
  visible?: boolean;
}

const NotificationTestButton: React.FC<NotificationTestButtonProps> = ({ visible = false }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={testNotificationDot}
      >
        <Text style={styles.buttonText}>Test Red Dot</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.testButton, styles.clearButton]} 
        onPress={clearNotificationDot}
      >
        <Text style={styles.buttonText}>Clear Red Dot</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
  },
  testButton: {
    backgroundColor: colors.red,
    paddingHorizontal: moderateScale(15),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(10),
    shadowColor: colors.red,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clearButton: {
    backgroundColor: colors.themecolor2,
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationTestButton; 