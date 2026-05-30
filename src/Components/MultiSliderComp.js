import React from 'react'
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import { View, Text, StyleSheet } from 'react-native'
import { moderateScale, width } from '../styles/responsiveSize'
import colors from '../styles/colors'
import { useTheme } from '../theme/ThemeProvider'
import { getCommonStyles } from '../styles/commonStyles'

const MultiSliderComp = ({
  sliderHeaderText,
  sliderMaxValue,
  sliderMinValue,
  sliderRef,
  sliderValue = [0, 0],
  setSliderValueFromChild = () => { },
  sliderWidth = width - moderateScale(70),
  isRequired = false
}) => {
  const multiSliderValuesChange = values => {
    setSliderValueFromChild(values)
  }
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme);

  return (
    <View>
      <View style={styles.textHeaderStyle}>
        <Text style={{ ...commonStyles.font_14_bold, color: theme.colors.black }}>{sliderHeaderText}
          {isRequired ? <Text style={{ color: theme.colors.black }}>*</Text> : <></>}
        </Text>
        <Text style={{ ...commonStyles.font_14_SemiBold, color: theme.colors.black }}>
          {sliderValue[0]} - {sliderValue[1]}
        </Text>
      </View>
      <View style={styles.sliderView}>
        <MultiSlider
          ref={sliderRef}
          markerStyle={styles.markerStyle}
          markerContainerStyle={styles.markerContainerStyle}
          pressedMarkerStyle={styles.pressedMarkerStyle}
          selectedStyle={styles.selectedStyle}
          trackStyle={styles.trackStyle}
          touchDimensions={styles.touchDimensions}
          sliderLength={sliderWidth}
          onValuesChange={multiSliderValuesChange}
          min={sliderMinValue}
          max={sliderMaxValue}
          allowOverlap={false}
          minMarkerOverlapDistance={10}
          values={sliderValue}
        />
      </View>
    </View>
  )
}

export default React.memo(MultiSliderComp)

const getStyles = (theme) => StyleSheet.create({
  markerStyle: {
    height: moderateScale(20),
    width: moderateScale(20),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.white,
    shadowcolor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primaryTxt
  },
  markerContainerStyle: {
    marginHorizontal:moderateScale(20),
    height: moderateScale(24),
    width: moderateScale(24),
    backgroundColor: theme.colors.primaryTxt,
    borderRadius: moderateScale(12),
    shadowColor: theme.colors.primaryTxt,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: moderateScale(12)
    // marginVertical: moderateScale(6)
  },
  textHeaderStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(25),
    marginTop: moderateScale(16),
    marginHorizontal: moderateScale(20)
  },
  sliderView: {
    alignSelf: 'center',
    marginTop: moderateScale(-10),
    // marginHorizontal:moderateScale(20)
  },
  touchDimensions: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(20),
    slipDisplacement: moderateScale(40)
  },
  selectedStyle: {
    backgroundColor: theme.colors.themecolor2,
    height: moderateScale(4),
    borderRadius: moderateScale(4)
  },
  trackStyle: {
    backgroundColor: theme.colors.blackOpacity40,
    height: moderateScale(4),
    borderRadius: moderateScale(4)
  },
  pressedMarkerStyle: {
    height: moderateScale(30),
    width: moderateScale(30),
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(1),
    backgroundColor: theme.colors.white
  }
})
