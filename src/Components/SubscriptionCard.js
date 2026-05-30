import {
  StyleSheet,
  Text,
  TextComponent,
  TouchableOpacity,
  View
} from 'react-native'
import React from 'react'
import { moderateScale, width } from '../styles/responsiveSize'
import colors from '../styles/colors'
import { SkypeIndicator } from 'react-native-indicators'
import { getCommonStyles } from '../styles/commonStyles'

export default function SubscriptionCard ({
  carddiscount,
  cardName,
  price,
  description = [],
  btnText,
  mainViewStyle,
  onPressPlan = () => {},
  loaderColor = colors.likePink,
  isLoading = false
}) {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles= getStyles(theme);
  return (
    <View style={{ ...styles.mainStyle, ...mainViewStyle, backgroundColor: theme.colors.likePink }}>
      <View style={styles.discountView}>
        <Text style={{ ...commonStyles.font_12_bold, color: theme.colors.black }}>
          Save {carddiscount}%
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.txtStyle}>Basic</Text>
        <Text style={styles.txtStyle}>${price}/month </Text>
      </View>
      <View style={{ marginTop: moderateScale(15) }}>
        {description.map((val, index) => {
          return (
            <View key={index} style={styles.innerView}>
              <Text style={styles.innerTextStyle}> - {val} </Text>
            </View>
          )
        })}
      </View>
      <View
        style={{
          height: 2,
          backgroundColor: theme.colors.black,
          marginTop: moderateScale(10),
          opacity: 0.3
        }}
      />
      <TouchableOpacity
        style={styles.btnStyle}
        activeOpacity={0.8}
        onPress={onPressPlan}>
        {isLoading
          ? (
          <SkypeIndicator color={loaderColor} size={moderateScale(20)} />
            )
          : (
          <>
            <Text style={{ ...commonStyles.font_12_bold, color: theme.colors.black }}>
              Get Plan
            </Text>
          </>
            )}
      </TouchableOpacity>
    </View>
  )
}

const getStyles = (theme) => StyleSheet.create({
  mainStyle: {
    marginLeft: moderateScale(20),
    width: width / 1.8,
    backgroundColor: theme.colors.likePink,
    padding: moderateScale(12),
    paddingTop: moderateScale(30),
    borderRadius: moderateScale(10),
    marginTop: moderateScale(15)
  },
  txtStyle: {
    ...commonStyles.font_16_bold,
    color: theme.colors.black
  },
  innerView: {
    padding: moderateScale(5)
  },
  innerTextStyle: {
    ...commonStyles.font_12_bold,
    color: theme.colors.black
  },
  btnStyle: {
    backgroundColor: theme.colors.black,
    height: moderateScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(12),
    borderRadius: moderateScale(10)
  },
  discountView: {
    position: 'absolute',
    backgroundColor: theme.colors.black,
    top: -10,
    left: 20,
    padding: moderateScale(6),
    borderRadius: moderateScale(6)
  }
})
