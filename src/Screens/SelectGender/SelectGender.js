// import liraries
import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Geocoder from 'react-native-geocoding'

import ButtonComp from '../../Components/ButtonComp'
import GradientText from '../../Components/GradientText'
import HeaderComp from '../../Components/HeaderComp'
import SelectView from '../../Components/SelectView'
import WrapperContainer from '../../Components/WrapperContainer'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import {getCommonStyles} from '../../styles/commonStyles'
import { moderateScale } from '../../styles/responsiveSize'
import { showError } from '../../utils/helperFunctions'
import { useSelector } from 'react-redux'
import { useTheme } from '../../theme/ThemeProvider'

const SelectGender = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const { navigation } = props
  const coords = useSelector(state => state?.authReducers?.coordinates || {})
console.log(coords, 'coords');
  console.log(props, 'propsprops ===>>>>>', coords)

  const [selectedGender, setSelectedGender] = useState('')

  const _onContinue = () => {
    if (selectedGender === '') {
      return showError(strings.pleaseSelectYourGender)
    }

    Geocoder.from(coords.latitude, coords.longitude)
      .then(json => {
        console.log(json, 'jsom---')
        const addressComponent = json.results[0].address_components
        console.log(addressComponent, 'address ====>>>>>')
        let countryComponent = addressComponent.filter((val) =>
          val?.types.includes('country')
        )
        let cityComponent = addressComponent.filter((val) =>
          val?.types.includes('administrative_area_level_1')
        )
        countryComponent = countryComponent[0]
        cityComponent = cityComponent[0]

        const prevData = {
          ...props?.route?.params?.prevData,
          gender: selectedGender,
          country: countryComponent?.long_name || 'United Kingdom',
          state: cityComponent?.long_name || 'London'
        }

        console.log(prevData, 'prev dta ===>>>>>>')

        navigation.navigate(navigationString.ADDITIONAL_DETAILS, {
          prevData
        })
      })
      .catch(error => console.warn(error, 'err'))
  }

  return (
    <WrapperContainer>
      <HeaderComp
        onPressBack={() => navigation.goBack()}
        leftIcon={imagesPath.ic_back}
        onPressRightText={() =>
          navigation.navigate(navigationString.SELECTLOCATION)
        }
      />
      <View style={{ marginHorizontal: moderateScale(16) }}>
        {/* <Text style={styles.headerText}>{strings.iAmA}</Text> */}
        <GradientText
          text={strings.iAmA}
          textStyle={styles.headerText}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0.4, y: 0.7 }}
        />
      </View>

      <View style={styles.btnStyle}>
        <SelectView
          label={strings.women}
          isSelected={selectedGender === 'women'}
          onPress={() => setSelectedGender('women')}
        />
        <SelectView
          label={strings.man}
          isSelected={selectedGender === 'men'}
          onPress={() => setSelectedGender('men')}
        />
        {/* <SelectView
          label={strings.transgender}
          isSelected={selectedGender === 'transgender'}
          onPress={() => setSelectedGender('transgender')}
        /> */}
      </View>
      <View style={styles.btnView}>
        <ButtonComp
          onPressBtn={_onContinue}
          btnText={strings.continue}
          btnView={styles.continueView}
        />
      </View>
    </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles) => StyleSheet.create({
  continueView: {
  },
  headerText: {
    ...commonStyles.font_34_bold,
    marginTop: moderateScale(32)
  },
  btnStyle: {
    flex: 0.5,
    marginTop: moderateScale(48),
    marginHorizontal: moderateScale(16)

  },
  btnView: {
    flex: 0.5,
    marginBottom: moderateScale(48),
    justifyContent: 'flex-end'
  }
})

export default SelectGender
