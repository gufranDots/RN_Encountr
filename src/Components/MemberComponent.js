import React, { useState } from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import FastImage from '../utils/FastImageCompat'
import LinearGradient from 'react-native-linear-gradient'
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import { height, moderateScale, moderateScaleVertical, textScale, verticalScale } from "../styles/responsiveSize"
import colors from "../styles/colors"
import imagesPath from "../constants/imagesPath"
import { TouchableOpacity } from "react-native"
import fontFamily from "../styles/fontFamily"
import { useSelector } from "react-redux"
import { useTheme } from '../theme/ThemeProvider'
import { getCommonStyles } from "../styles/commonStyles"

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

const MemberComponent = (props) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const enCounterHomestyles = getStyles(theme, commonStyles)
  const { item, index, onPress, AdminId, onLongPress } = props
  const [loading, setLoading] = useState(true)
  const userData = useSelector(state => state?.authReducers?.userData || {});

  const FindAdminId = item?.user?.id;
  return (
    <View style={enCounterHomestyles.userImgStyle}>
      <FastImage
        source={item?.user?.profile_image ? { uri: item?.user?.profile_image } : imagesPath.profileimage}
        style={{ flex: 1 }}
        onLoadStart={() => {
          setLoading(true)
        }}
        onLoadEnd={() => {
          setLoading(false)
        }}
        onError={() => {
          setLoading(false)
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={enCounterHomestyles.userDetailContainer}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          <View style={enCounterHomestyles.rowCenterView}>

          {item?.user?.first_name ? (
            <Text style={enCounterHomestyles.itemText}>
              {item?.user?.first_name.charAt(0).toUpperCase() +
                item.user.first_name.slice(1)}
              {userData?.id === FindAdminId ? ' (me)' : null}
            </Text>
          ) : (
            <Text style={enCounterHomestyles.itemText}>
              {item?.user?.user_name.charAt(0).toUpperCase() +
                item?.user?.user_name.slice(1)}
            </Text>
          )}
  
            {/* <Text style={enCounterHomestyles.userNameTxtStyle}>
              {item?.user?.first_name}
            </Text> */}
          </View>
        </TouchableOpacity>
        {AdminId === FindAdminId ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              position: 'absolute',
              width: moderateScale(45),
              height: moderateScale(15),
              backgroundColor: 'white',
              top: 5,
              right: 8,
            }}>
            <Text style={{
              fontFamily: fontFamily.bold,
              color: colors.red,
              fontSize: moderateScale(10),
            }}>Admin</Text>
          </View>
        ) : null}
      </FastImage>
      {loading && item?.user?.profile_image ? (
        <ShimmerPlaceholder
          style={enCounterHomestyles.shimmerOverlay}
          autoRun={true}
        />
      ) : null}
    </View>
  )


}
export default MemberComponent

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
    height: height / 6.8,
    position: 'relative',
    overflow: 'hidden',
  },
  userDetailContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: verticalScale(4)
  },
  userNameTxtStyle: {
    ...commonStyles.font_14_SemiBold,
    // marginLeft: moderateScale(4),
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
  },

  itemText: {
    position: 'absolute',
    bottom: 0,
    marginLeft: moderateScale(5),
    fontSize: textScale(10),
    color: theme.colors.primaryWhite,
    fontFamily: fontFamily.bold,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderColor: theme.colors.greenTheme,
    borderWidth: 0.2,
  },

})


