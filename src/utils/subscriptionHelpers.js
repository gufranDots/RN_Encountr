import React from 'react'
import { StyleSheet, Text, ScrollView } from 'react-native'
import colors from '../styles/colors'
import { moderateScale } from '../styles/responsiveSize'
import { getColorCodeWithOpactiyNumberHASHES } from './helperFunctions'
import { useTheme } from '../theme/ThemeProvider'
import { getCommonStyles } from '../styles/commonStyles'

const basic = [{ month: '1 Month', price: '599 UK' }, { month: '3 Months', price: '30 Pounds' }, { month: '12 Months', price: '1499 UK' }]
const blue = [{ month: '1 Month', price: '£12.99' }, { month: '3 Months', price: '£30.00' }, { month: '12 Months', price: '£112.00' }]
const pink = [{ month: '1 Month', price: '£14.99' }, { month: '3 Months', price: '£35.00' }, { month: '12 Months', price: '£115.00' }]
const crystal = [{ month: '1 Month', price: '£24.99' }, { month: '3 Months', price: '£50.00' }, { month: '12 Months', price: '£150.00' }]

const {theme} = useTheme();
const styles = getStyles(theme)

const getStyles = (theme) => {
  const commonStyles = getCommonStyles(theme);
  return (
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingTop: moderateScale(23),
        zIndex: 100
      },
      descriptionText: { ...commonStyles.font_12_medium, color: theme.colors.black, lineHeight: moderateScale(24) }
    })
  );
}

export const getTabBarColor = (index) => {
  switch (index) {
    case 0:
      return getColorCodeWithOpactiyNumberHASHES(colors.white, 70)
    case 1:
      return getColorCodeWithOpactiyNumberHASHES(colors.themecolor2, 70)
    case 2:
      return getColorCodeWithOpactiyNumberHASHES(colors.likePink, 70)
    case 3:
      return getColorCodeWithOpactiyNumberHASHES('#A7D8DE', 70)
  }
}

export const getTabBarPrice = (index) => {
  switch (index) {
    case 0:
      return 'Free for 7 days'
    case 1:
      return '£12.99'
    case 2:
      return '£14.99'
    case 3:
      return '£24.99'
  }
}

export const getPackageName = (index) => {
  switch (index) {
    case 0:
      return 'Basic'
    case 1:
      return 'Blue'
    case 2:
      return 'Pink'
    case 3:
      return 'Crystal'
  }
}

export const getPackageData = (index) => {
  switch (index) {
    case 0:
      return basic
    case 1:
      return blue
    case 2:
      return pink
    case 3:
      return crystal
  }
}

export const BasicPackage = (index) => {
  return (
    <ScrollView contentContainerStyle={styles.container} >
      <Text style={{ ...styles.descriptionText, color: colors.black }}>
        ✓  2 profile picture in gallery{'\n'}
        ✓  Block screen shots{'\n'}
        ✓  10 profile matches{'\n'}
        ✓  Filter by gender, age, location.{'\n'}
        ✓  Access to both Bonk & Bonkers{'\n'}
        <Text style={{ opacity: 0.5 }}>
          🔒  Send images over chat{'\n'}
          🔒  Send voice notes over chat{'\n'}
          🔒  Access to Video Calls{'\n'}
          {/* 🔒  Switch to Bonk Profile{'\n'} */}
        </Text>
      </Text>
    </ScrollView>
  )
}

export const BluePackage = () => {
  return (
    <ScrollView contentContainerStyle={styles.container} >

      <Text style={styles.descriptionText}>
        ✓  4 profile picture in gallery{'\n'}
        ✓  10 video call minutes{'\n'}
        ✓  Block screen shots{'\n'}
        ✓  Send images over chat{'\n'}
        ✓  50 profile matches{'\n'}
        ✓  Access to all filters{'\n'}
        ✓  Star rating{'\n'}
        {/* ✓  Access to bonk and bonkers(once selected cannot change profile){'\n'} */}
        ✓  Crystal icons for premium users{'\n'}
        <Text style={{ opacity: 0.5 }}>
          🔒  Send voice notes over chat{'\n'}
          🔒  Change the location / map feature (city finder){'\n'}
          🔒  Priority chat support{'\n'}
        </Text>
      </Text>
    </ScrollView>
  )
}

export const PinkPackage = () => {
  return (
    <ScrollView contentContainerStyle={styles.container} >

      <Text style={styles.descriptionText}>
        ✓  6 profile picture in gallery{'\n'}
        ✓  30 video call minutes{'\n'}
        ✓  Block screen shots{'\n'}
        ✓  Image sending{'\n'}
        ✓  Unlimited matches{'\n'}
        ✓  Change the location / map feature (city finder){'\n'}
        ✓  Send voice notes up to 30 secs over chat (send 50 notes only){'\n'}
        ✓  Access all filters{'\n'}
        ✓  Star rating{'\n'}
        {/* ✓  Access to bonk and bonkers{'\n'} */}
        ✓  Crystal icons for premium users{'\n'}
        <Text style={{ opacity: 0.5 }}>
          🔒  Add voice notes - unlimited (30 sec){'\n'}
          🔒  Priority chat support{'\n'}
        </Text>
      </Text>

    </ScrollView>
  )
}

export const CrystalPackage = () => {
  return (
    <ScrollView contentContainerStyle={styles.container} >
      <Text style={styles.descriptionText}>
        ✓  8 profile picture in gallery{'\n'}
        ✓  Unlimited video call minutes{'\n'}
        ✓  Block screen shots{'\n'}
        ✓  Image sending{'\n'}
        ✓  Unlimited matches{'\n'}
        ✓  Change the location / map{'\n'}
        ✓  Add voice notes - unlimited (30 sec){'\n'}
        ✓  Access all filters{'\n'}
        ✓  Star rating{'\n'}
        {/* ✓  Access to bonk and bonkers{'\n'} */}
        ✓  Crystal icons for premium users{'\n'}
        ✓  Priority chat support{'\n'}
      </Text>
    </ScrollView>
  )
}
