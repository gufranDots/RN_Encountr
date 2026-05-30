import { Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import WrapperContainer from '../../Components/WrapperContainer';
import { moderateScale, textScale } from '../../styles/responsiveSize';
import imagesPath from '../../constants/imagesPath';
import fontFamily from '../../styles/fontFamily';
import colors from '../../styles/colors';
import strings from '../../constants/Languages';
import HeaderComp from '../../Components/HeaderComp';
import ButtonComp from '../../Components/ButtonComp';


const OneTimeRead = ({ route, navigation }) => {
  const [oneTime, setOneTime] = useState(false)
  const type = route?.params?.roomType
  const image = route?.params?.res
  const screenCallback = route?.params?.screenCallback
  useEffect(() => {
    // console.log("data",Data);
  }, [])

  const onPressBack = () => {
    screenCallback({ image, oneTime: oneTime })
    navigation.goBack()
  }

  return (
    <WrapperContainer
      statusbarcolorr={colors.backgroundBlue}
      isSafeAreaAvailable={true}
      mainViewStyle={{ backgroundColor: "#292929" }}>
      <View style={{ width: '100%', flexDirection: "row" }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: "20%" }}>
          <Image resizeMode="contain" source={imagesPath.back_white} />
        </TouchableOpacity>
        <View style={{ width: "60%" }}>
        </View>

        {type != 2 ? (
          <TouchableOpacity onPress={() => setOneTime(!oneTime)} style={{ width: "20%", alignItems: 'center', justifyContent: 'center' }}>

            <Image style={{ tintColor: oneTime != true ? colors.gray2 : null }} resizeMode="contain" source={imagesPath.oneTime} />
          </TouchableOpacity>

        ) : null}
      </View>
      <View style={styles.mainCont}>
        <Image resizeMode="contain" style={styles.imageSty} source={{ uri: image?.sourceURL ? image?.sourceURL:image?.path}} />
        <View style={{ marginTop: moderateScale(20), flexDirection: 'row', justifyContent: "space-around", width: "100%" }}>
          <ButtonComp
            btnText={strings.Send_Photo}
            txtStyle={{ color: colors.white }}
            onPressBtn={onPressBack}
            btnView={{ borderRadius: moderateScale(30) }}
          />

        </View>
      </View>
    </WrapperContainer>
  )
}

export default OneTimeRead

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
    alignItems: 'center',
    marginTop: moderateScale(10),
  },
  imageSty: {
    width: '100%',
    height: '70%'
  },

})