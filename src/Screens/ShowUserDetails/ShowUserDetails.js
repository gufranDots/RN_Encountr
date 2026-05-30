import moment from 'moment'
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import ButtonComp from '../../Components/ButtonComp'
import GradientText from '../../Components/GradientText'
import WrapperContainer from '../../Components/WrapperContainer'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import colors from '../../styles/colors'
import {getCommonStyles} from '../../styles/commonStyles'
import { moderateScale } from '../../styles/responsiveSize'
import { useTheme } from '../../theme/ThemeProvider'

const ShowUserDetails = (props) => {
    const {theme} = useTheme();
    const commonStyles = getCommonStyles(theme);
    const styles = getStyles(theme, commonStyles)
  const { myDetails } = props?.route?.params
  return (
        <WrapperContainer>

            <View style={{ flex: 1 }}>

                <View style={{
                  alignItems: 'center',
                  marginTop: moderateScale(40)
                }}>
                    <GradientText
                        text={'Details'}
                        textStyle={commonStyles.font_32_bold}
                        start={{ x: 0, y: 0.9 }}
                        end={{ x: 0.9, y: 0.9 }}
                    />
                </View>

                <View style={{ flex: 0.9 }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.detailsView}>
                            <GradientText
                                text={strings.name}
                                textStyle={styles.labelText}
                                start={{ x: 0, y: 0.3 }}
                                end={{ x: 0.3, y: 0.5 }}
                            />
                            <Text style={styles.valueText}>{myDetails?.first_name}</Text>
                        </View>
                        <View style={styles.detailsView}>
                            <GradientText
                                text={strings.userName}
                                textStyle={styles.labelText}
                                start={{ x: 0, y: 0.3 }}
                                end={{ x: 0.3, y: 0.5 }}
                            />
                            <Text style={styles.valueText}>{myDetails?.user_name}</Text>
                        </View>
                        <View style={styles.detailsView}>
                            <GradientText
                                text={strings.email}
                                textStyle={styles.labelText}
                                start={{ x: 0, y: 0.3 }}
                                end={{ x: 0.3, y: 0.5 }}
                            />
                            <Text style={styles.valueText}>{myDetails?.email}</Text>
                        </View>
                        <View style={styles.detailsView}>
                            <GradientText
                                text={strings.phoneNumber}
                                textStyle={styles.labelText}
                                start={{ x: 0, y: 0.3 }}
                                end={{ x: 0.3, y: 0.5 }}
                            />
                            <Text style={styles.valueText}>{'+' + myDetails?.country_code + ' ' + myDetails?.phone_number}</Text>
                        </View>
                        <View style={styles.detailsView}>
                            <GradientText
                                text={strings.dob}
                                textStyle={styles.labelText}
                                start={{ x: 0, y: 0.3 }}
                                end={{ x: 0.3, y: 0.5 }}
                            />
                            <Text style={styles.valueText}>{moment(myDetails?.dob).format('ll')}</Text>
                        </View>

                    </ScrollView>
                </View>

                <View style={{ flex: 0.1 }}>
                    <ButtonComp
                        btnText={strings.continue}
                        onPressBtn={() => props.navigation.navigate(navigationString.LOGINSCREEN)}
                    />
                </View>
            </View>

        </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles) => StyleSheet.create({
  detailsView: {
    marginTop: moderateScale(20)
  },
  labelText: {
    ...commonStyles.font_16_bold,
    color: theme.colors.black
  },
  valueText: {
    ...commonStyles.font_14_medium,
    marginTop: moderateScale(4),
    color: theme.colors.blackOpacity90
  }
})

export default ShowUserDetails
