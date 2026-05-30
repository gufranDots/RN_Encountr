import React from 'react'
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import { View, Text, StyleSheet } from 'react-native'
import { moderateScale, width } from '../styles/responsiveSize'
import colors from '../styles/colors'
import { getCommonStyles } from '../styles/commonStyles'
import { useTheme } from '../theme/ThemeProvider'

const SingleSlider = ({
  sliderHeaderText,
  sliderMaxValue,
  rangeText,
  sliderMinValue,
  sliderValue = 0,
  setSliderValueFromChild = () => {},
  sliderWidth = width - moderateScale(70),
  isRequired = false,
  textHeaderStyle
}) => {
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme);
  // Function to format height for display
  const formatHeightForDisplay = (heightValue) => {
    if (!heightValue || heightValue === 0) return '0 ft 0 inches';
    
    const feet = Math.floor(heightValue);
    const inches = Math.round((heightValue - feet) * 12);
    
    if (inches === 12) {
      return `${feet + 1} ft 0 inches`;
    } else {
      return `${feet} ft ${inches} inches`;
    }
  };

  // Function to format height in compact format (5'11")
  const formatHeightCompact = (heightValue) => {
    if (!heightValue || heightValue === 0) return "0'0\"";
    
    const feet = Math.floor(heightValue);
    const inches = Math.round((heightValue - feet) * 12);
    
    if (inches === 12) {
      return `${feet + 1}'0"`;
    } else {
      return `${feet}'${inches}"`;
    }
  };

  const multiSliderValuesChange = values => {
    const selectedHeight = values[0]; // Extracting the selected height from values
    const feet = Math.floor(selectedHeight);
    const inches = Math.round((selectedHeight - feet) * 12); // Converting fractional part to inches
    let formattedHeight = '';

    if (inches === 12) {
      formattedHeight = `${feet + 1}.0`; // Increment feet by 1 if inches reach 12
    } else {
      formattedHeight = `${feet}.${inches}`;
    }
    setSliderValueFromChild(formattedHeight);
    // console.log("lklkl",values[0]);
    // setSliderValueFromChild(values[0].toFixed(1))
  }

  return (
    <View>
      <View style={[styles.textHeaderStyle, textHeaderStyle]}>
        <Text style={{ ...commonStyles.font_14_bold, color: theme.colors.black }}>
          {sliderHeaderText}
          {isRequired
            ? (
            <Text style={{ color: theme.colors.black }}>*</Text>
              )
            : (
            <></>
              )}
        </Text>
        <Text
          style={{ ...commonStyles.font_14_SemiBold, color: theme.colors.likePink }}>
          {rangeText === 'ft' ? formatHeightForDisplay(sliderValue) : `${sliderValue} ${rangeText}`}
        </Text>
      </View>
      <View style={styles.sliderView}>
        <MultiSlider
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
          values={[sliderValue]}
          step={0.1}
        />
      </View>
    </View>
  )
}

export default React.memo(SingleSlider)

const getStyles = (theme) => StyleSheet.create({
  markerStyle: {
    height: moderateScale(20),
    width: moderateScale(20),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.white,
    shadowcolor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.black
  },
  markerContainerStyle: {
    height: moderateScale(24),
    width: moderateScale(24),
    backgroundcolor: theme.colors.themecolor2,
    borderRadius: moderateScale(12),
    shadowColor: theme.colors.likePink,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: moderateScale(12)
    // marginVertical: moderateScale(4)
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
    marginTop: -moderateScale(12)
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
    backgroundColor: theme.colors.themecolor2,
    height: moderateScale(4),
    borderRadius: moderateScale(0)
  },
  pressedMarkerStyle: {
    height: moderateScale(30),
    width: moderateScale(30),
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(1),
    backgroundColor: theme.colors.white
  }
})
