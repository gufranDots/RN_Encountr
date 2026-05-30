import React from 'react'
import { Text, View } from 'react-native'
import colors from '../styles/colors'
import { height, moderateScale, width } from '../styles/responsiveSize'
import { getCommonStyles } from '../styles/commonStyles'

const SOSAlert = ({
  sosTimer = 0
}) => {
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  return (
        <>
            <View style={{
              position: 'absolute',
              zIndex: 111,
              top: 0,
              backgroundColor: theme.colors.burningOrange,
              height: height / 5.5,
              width: width / 1.2,
              alignSelf: 'center',
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              justifyContent: 'center',
              alignItems: 'center'
            }} >
                <Text style={{
                  ...commonStyles.font_16_bold,
                  textAlign: 'center',
                  width: '80%'
                }}>{`SOS ALERT WILL SENT TO YOUR FRIEND IN ${sosTimer} SECONDS`}</Text>
            </View>
            <View style={{
              position: 'absolute',
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: width / 2.5,
              borderRightWidth: width / 2.5,
              borderBottomWidth: width / 5,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: theme.colors.burningOrange,
              transform: [{ rotate: '180deg' }],
              zIndex: 111,
              top: height / 5.6,
              alignSelf: 'center'
            }} />

            <View
                style={{
                  position: 'absolute',
                  backgroundColor: theme.colors.burningOrange,

                  left: moderateScale(20),
                  height: moderateScale(90),
                  width: moderateScale(90),
                  borderRadius: moderateScale(64),
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 111,
                  top: height / 5.2,
                  start: (width / 1.3) / 2,
                  borderWidth: moderateScale(4),
                  bordercolor: theme.colors.black
                }}
            >
                <Text style={{
                  ...commonStyles.font_22_bold,
                  textAlign: 'center',
                  width: '80%'
                }}>{'SOS'}</Text>
            </View>
        </>
  )
}

export default SOSAlert
