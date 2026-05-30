import React, { memo, useEffect, useState } from "react"
import { height, moderateScale, moderateScaleVertical, textScale, verticalScale } from "../styles/responsiveSize"
import {getCommonStyles, hitSlopProp } from "../styles/commonStyles"
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import imagesPath from "../constants/imagesPath"
import { useTheme } from "../theme/ThemeProvider"
const HomeSearchComponent = (props)=>{

    const {onSubmitEditing,onPressCross,search} = props
    const [searchText,setSearchText] = useState(search?search:'')

    useEffect(() => {
      setSearchText(search || '');
    }, [search]);

    const crossPress=()=>{
      setSearchText('')
      onPressCross('')
    }
    const {theme, isDark } = useTheme();
    const commonStyles = getCommonStyles(theme);
    const enCounterHomestyles = getStyles(theme, commonStyles)

    return(
        <View
        style={{
          ...enCounterHomestyles.searchBarStyle,
          ...enCounterHomestyles.rowCenterView
        }}>
        <Image
          source={imagesPath.ic_serach}
          style={commonStyles.iconStyle18}
          tintColor={isDark ? theme.colors.primaryTxt : null}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1
          }}>
          <TextInput
            placeholder="Search User"
            style={enCounterHomestyles.searchTxtStyle}
            value={searchText}
            onChangeText={val => {
              setSearchText(val)
            }}
            onSubmitEditing={() => onSubmitEditing(searchText)}
            placeholderTextColor={theme.colors.placeHolderColor}
          />
          {searchText && (
            <TouchableOpacity
              onPress={()=>crossPress()}
              hitSlop={hitSlopProp}>
              <Image
                source={imagesPath.crossnew}
                style={{
                  height: moderateScaleVertical(12),
                  width: moderateScale(12),
                  tintColor: theme.colors.florsentTheme
                }}
              />
            </TouchableOpacity>
          )}
        </View>

      </View>
    )

}

export default memo(HomeSearchComponent)

const getStyles = (theme, commonStyles) => StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.white
    },
    marginBottom20: {
      marginBottom: verticalScale(20)
    },
    rowCenterView: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    leftHalfContainer: {
      flex: 5.6,
      justifyContent: 'space-between'
    },
    halfViewContainer: {
      flex: 6,
      justifyContent: 'space-between'
    },
    userImgStyle: {
      flex: 0.3333,
      height: height / 6.8
    },
    userDetailContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: verticalScale(10),
      paddingBottom: verticalScale(4)
    },
    userNameTxtStyle: {
      ...commonStyles.font_14_SemiBold,
      marginLeft: moderateScale(4),
      color: theme.colors.white
    },
    exploreTxtStyle: {
      ...commonStyles.font_16_SemiBold,
      color: theme.colors.white,
      marginRight: verticalScale(28),
      marginLeft: moderateScale(4)
    },
    viewedTxtStyle: {
      ...commonStyles.font_16_medium,
      color: theme.colors.white,
      marginLeft: verticalScale(4)
    },
    searchBarStyle: {
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(24),
      height: verticalScale(45),
      paddingHorizontal: verticalScale(16),
      marginBottom: verticalScale(5)
    },
    searchTxtStyle: {
      ...commonStyles.font_14_medium,
      color: theme.colors.placeHolderColor,
      marginLeft: verticalScale(10),
      marginTop: moderateScaleVertical(2),
      width: '90%'
    },
    viewedMeContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(40),
      paddingHorizontal: moderateScale(6),
      marginLeft: moderateScale(4)
    },
    eyeIconStyle: {
      ...commonStyles.iconStyle11,
      marginRight: verticalScale(4)
    },
    headerContainer: {
      backgroundColor: theme.colors.themecolor2,
      justifyContent: 'space-between',
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(15)
    },
    profilViewedLeftContainer: {
      backgroundColor: theme.colors.blackOpacity70,
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(8)
    },
    btnStyle: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: moderateScale(20),
      paddingVertical: verticalScale(10),
      borderRadius: moderateScale(20)
    },
    btnTxtStyle: {
      ...commonStyles.font_12_SemiBold,
      color: theme.colors.themecolor2,
      fontSize: textScale(14)
    },
    profileViewedLeftTxt: {
      ...commonStyles.font_13_medium
    },
    marginLeft24: {
      marginLeft: moderateScale(24)
    },
    txtStyle: {
      ...commonStyles.font_14_SemiBold,
      color: theme.colors.white
    },
    categoryItem: {
      justifyContent: 'center',
      marginLeft: moderateScale(15),
      height: moderateScale(28)
    },
    selectedCategoryItem: {
      height: moderateScale(28),
      justifyContent: 'center',
      backgroundColor: theme.colors.themecolor2,
      paddingHorizontal: moderateScale(15),
      borderRadius: moderateScale(20)
    },
    categoryItemTxt: {
      ...commonStyles.font_14_SemiBold,
      color: theme.colors.categoryGray
    },
    selectedCategoryItemTxt: {
      ...commonStyles.font_14_medium,
      color: theme.colors.white
    },
    filterContainer: {
      alignItems: 'center',
      paddingVertical: verticalScale(20),
      paddingHorizontal: moderateScale(18)
    },
    imagePlaceholder: {
      width: 200, // Adjust according to your image size
      height: 200, // Adjust according to your image size
      borderRadius: 10 // Adjust according to your image style
    },
    userImg: {
      height: moderateScaleVertical(26),
      width: moderateScale(26),
      borderRadius: moderateScale(13)
    },
    modalCloseSty: {
      width: '10%',
      height: '10%',
      backgroundColor: theme.colors?.backgroundGrey,
      alignItems: 'center',
      justifyContent: 'center',
      top: -20,
      borderRadius: 30,
      alignSelf: 'flex-end',
      marginRight: moderateScale(5)
    },
    modalStyle: {
      position: 'absolute',
      width: '100%',
      height: '50%',
      backgroundColor: theme.colors.white,
      bottom: 0
    }
  
  })
