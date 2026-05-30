import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'

import HeaderComp from '../../Components/HeaderComp'
import imagesPath from '../../constants/imagesPath'

import {
  moderateScale,
  moderateScaleVertical,
  textScale
} from '../../styles/responsiveSize'

import colors from '../../styles/colors'

export default function SetPreferences(props) {
  const { navigation, route } = props

  //* *************Image is Used As Background *************************** */

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.5, padding: moderateScale(30) }}>
          <HeaderComp
            leftIcon={imagesPath.ic_back}
            leftIconStyle={{ opacity: 0.5, backgroundcolor: colors.darkBlack }}
          />
          <Text style={styles.headingText}>BONKERS</Text>
          <Text style={{ fontSize: textScale(16), fontWeight: '500' }}>
            Dating & Relationships
          </Text>
          <TouchableOpacity>
            <Image
              source={imagesPath.arrow}
              style={{ margin: moderateScale(7) }}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flex: 0.5,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            padding: moderateScale(60)
          }}>
          <Text style={styles.headingText}>BONKS</Text>
          <Text style={{ fontSize: textScale(16), fontWeight: '500' }}>
            Looking For / Meet side
          </Text>
          <TouchableOpacity>
            <Image
              source={imagesPath.arrow}
              style={{ margin: moderateScale(7) }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Image
        source={imagesPath.setprefback}
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          zIndex: -100,
          opacity: 0.7
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  headingText: {
    fontSize: textScale(26),
    fontWeight: '700',
    marginTop: moderateScaleVertical(20),
    paddingLeft: moderateScale(3)
  },
  cardStyle: {
    backgroundColor: colors.orange,
    flexDirection: 'row',
    borderRadius: moderateScale(15),
    marginTop: moderateScaleVertical(50),
    borderWidth: 2,
    shadowColor: colors.gray2,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3
  }
})
