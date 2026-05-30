import { View, Text, Image, StatusBar } from 'react-native'
import React from 'react'
import imagesPath from '../../constants/imagesPath'
import { height, width } from '../../styles/responsiveSize'
import colors from '../../styles/colors'

const Splash = () => {
  return (
    <View>
        <StatusBar backgroundColor={colors.themecolor2} barStyle={"dark-content"}/>
      <Image style = {{width:width, height:height}} source={imagesPath.ic_Splash}/>
    </View>
  )
}

export default Splash