import React from 'react'
import { Text, View } from 'react-native'
import colors from '../styles/colors'
import { moderateScale } from '../styles/responsiveSize'
import ButtonComp from './ButtonComp'
import { useTheme } from '../theme/ThemeProvider'
import { getCommonStyles } from '../styles/commonStyles'

const WalksafeAskModal = ({
  heading,
  subText,
  onPressNo,
  onPressYes
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  return (
        <View style={{
          backgroundColor: theme.colors.bgGrey,
          borderRadius: moderateScale(16)
        }}>
            <Text style={{
              ...commonStyles.font_22_SemiBold,
              marginTop: moderateScale(24),
              textAlign: 'center'
            }}>{heading}</Text>
            <Text
                style={{
                  ...commonStyles.font_16_regular,
                  opacity: 0.7,
                  marginVertical: moderateScale(16),
                  textAlign: 'center'
                }}
            >{subText}</Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: moderateScale(24)
            }}>
                <ButtonComp
                    btnView={{ backgroundColor: theme.colors.black }}
                    btnText={'No'}
                    btnStyle={{ marginVertical: moderateScale(20), width: '48%' }}
                    onPressBtn={onPressNo}
                />
                <ButtonComp
                    btnView={{ backgroundColor: theme.colors.caribbean }}
                    btnText={'Yes'}
                    btnStyle={{ marginVertical: moderateScale(20), width: '48%' }}
                    onPressBtn={onPressYes}
                />
            </View>
        </View>
  )
}

export default WalksafeAskModal
