import React from 'react'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import { moderateScale, width } from '../styles/responsiveSize'
import ButtonComp from './ButtonComp'
import imagesPath from '../constants/imagesPath'
import { useNavigation } from '@react-navigation/native'
import navigationString from '../constants/navigationString'
import MatchCard from './MatchCard'
import colors from '../styles/colors'
import strings from '../constants/Languages'
import { getCommonStyles } from '../styles/commonStyles'

const UpgradePlanScreen = ({ text = '', cardList = [], containerStyle = {}, showImage = true, btnText = strings.upgradePlan, btnStyle, isBackBtn = true, headingTxt }) => {
  const navigation = useNavigation()
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);

  const renderItem = ({ item, index }) => {
    return (
      <Image
        blurRadius={30}
        source={{ uri: item?.sent_from?.profile_image }}
        style={{
          backgroundColor: theme.colors.blackOpacity12,
          zIndex: 10,
          height: moderateScale(200),
          width: width / 2 - moderateScale(20),
          borderRadius: moderateScale(12)
        }}>
        {/* <MatchCard
          from={'_MY_MATCHES'}
          onPressCancel={() => {}}
          onPressMessage={() => {}}
          itemData={item}
          name={''}
          age={''}
          pic={item?.sent_from?.profile_image}
          mainContainer={{ width: width / 2 - moderateScale(20) }}
          onPressCard={() => {}}
        /> */}
      </Image>
    )
  }

  const ListHeaderComponent = () => {
    return (
      <Text style={{ ...commonStyles.font_16_regular, textAlign: 'center' }}>
        {text}
      </Text>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        ...containerStyle
        // paddingHorizontal: moderateScale(30)
      }}>
      <View
        style={{ flex: 0.93, justifyContent: 'center' }}>
          {cardList.length > 0
            ? <FlatList
          data={cardList}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{
            marginTop: moderateScale(16),
            justifyContent: 'space-between'
          }}
          ListHeaderComponent={cardList.length > 0 && ListHeaderComponent}
        />
            : <>
            {showImage &&
            <Image
              source={imagesPath.lockIcon}
              style={{ ...commonStyles.iconStyle48,
                ...styles.iconStyle
              }}
            />}
            { 
            headingTxt &&
            <Text style={styles.headingTxtStyle}>{headingTxt}</Text>
            }
            <Text
              style={styles.subheadingTxtStyle}>
              {text}
            </Text>
          </>
        }
      </View>
      <ButtonComp
        btnText={btnText}
        btnView={btnStyle}
        onPressBtn={() =>
          navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
            isBack: isBackBtn
          })
        }
      />
    </View>
  )
}
const getStyles = (theme, commonStyles) => StyleSheet.create({
  iconStyle:{
    alignSelf:'center',
    marginBottom:moderateScale(12)
  },
  headingTxtStyle:{
    ...commonStyles.font_14_SemiBold, 
    textAlign: 'center', 
    marginBottom:moderateScale(16)
  },
  subheadingTxtStyle:{
    ...commonStyles.font_14_regular, 
    textAlign: 'center'
  }
})

export default UpgradePlanScreen
