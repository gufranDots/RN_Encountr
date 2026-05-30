import React, { memo, useState } from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import FastImage from '../utils/FastImageCompat'
import LinearGradient from 'react-native-linear-gradient'
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import { height, moderateScale, moderateScaleVertical, textScale, verticalScale } from "../styles/responsiveSize"
import colors from "../styles/colors"
import imagesPath from "../constants/imagesPath"
import { TouchableOpacity } from "react-native"
import { useTheme } from "../theme/ThemeProvider"
import { getCommonStyles } from "../styles/commonStyles"
import { profileImg_Approval_Status } from "../constants/Enum"

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

const HomeComponent = (props)=>{
const {item,onPress,onSpeakerPress,isPlayingVoice} = props
const [loading,setLoading] = useState(true)
const {theme} = useTheme();
const commonStyles = getCommonStyles(theme);
const enCounterHomestyles = getStyles(theme, commonStyles)
const unreadCount = Number(item?.unread_message || 0);
const unreadCountLabel = unreadCount > 99 ? '99+' : String(unreadCount);
const isProfileApproved =
  String(item?.is_profile_image_approved) === String(profileImg_Approval_Status.Approved);
const voiceMessageUrl =
  typeof item?.voice_message === 'string' ? item.voice_message.trim() : '';
const hasVoiceMessage = voiceMessageUrl.length > 0;

const handleSpeakerPress = () => {
  if (!hasVoiceMessage) return;
  if (typeof onSpeakerPress === 'function') {
    onSpeakerPress(item);
  }
};

return (
    <View style={enCounterHomestyles.userImgStyle}>
      <FastImage
        source={
          item?.profile_image_thumb
            ? (isProfileApproved ? { uri: item?.profile_image_thumb } : imagesPath.profileimage)
            : imagesPath.noImage
        }
        style={{ flex: 1}}
        onLoadStart={() => {
            setLoading(true)
        }}
        onLoadEnd={() => {
            setLoading(false)
        }}
        resizeMode="cover"
        >
        {unreadCount > 0 ? (
          <View style={enCounterHomestyles.unreadBadgeContainer}>
            <Text style={enCounterHomestyles.unreadBadgeText}>
              {unreadCountLabel}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.8}
          style={enCounterHomestyles.userDetailContainer}
          onPress={() => onPress(item)}
        >
          <View style={enCounterHomestyles.rowCenterView}>
            <Image
              source={imagesPath.dotIcon}
              style={{
                ...commonStyles.iconStyle10,
                tintColor: item?.online_status ? theme.colors.garkGreen : theme.colors.grey
              }}
            />
            <Text style={enCounterHomestyles.userNameTxtStyle}>
              {item?.first_name}
            </Text>
          </View>
        </TouchableOpacity>
        {hasVoiceMessage ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSpeakerPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={enCounterHomestyles.speakerIconContainer}
          >
            <Image
              source={isPlayingVoice ? imagesPath.stopIcon : imagesPath.volume}
              style={isPlayingVoice ? enCounterHomestyles.speakerIconStop : enCounterHomestyles.speakerIcon}
              tintColor={isPlayingVoice ? undefined : '#ffff'}
            />
          </TouchableOpacity>
        ) : null}
      </FastImage>
      {loading && (

        <ShimmerPlaceholder
          style={{ width: '100%', height: '100%' ,position:'absolute',borderColor: theme.colors.greenTheme,borderWidth:.2}}
          autoRun={true}
          // visible={profileImgLoader}
        >
        </ShimmerPlaceholder>
      )}
    </View>
  )


}
export default memo(HomeComponent)

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
      position: 'relative'
    },
    userDetailContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: verticalScale(10),
      paddingBottom: verticalScale(4)
    },
    userNameTxtStyle: {
      ...commonStyles.font_14_medium,
      marginLeft: moderateScale(4),
      color: theme.colors.primaryWhite
    },
    exploreTxtStyle: {
      ...commonStyles.font_16_SemiBold,
      color: theme.colors.darkBlack,
      marginRight: verticalScale(28),
      marginLeft: moderateScale(4)
    },
    viewedTxtStyle: {
      ...commonStyles.font_16_medium,
      color: theme.colors.darkBlack,
      marginLeft: verticalScale(4)
    },
    searchBarStyle: {
      backgroundColor: colors.white,
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
    unreadBadgeContainer: {
      position: 'absolute',
      top: moderateScale(6),
      right: moderateScale(6),
      minWidth: moderateScale(14),
      height: moderateScale(18),
      paddingHorizontal: moderateScale(6),
      borderWidth:moderateScale(2),
      borderColor: theme.colors.florsentTheme,
      backgroundColor: theme.colors.florsentTheme,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    unreadBadgeText: {
      ...commonStyles.font_10_SemiBold,
      color: theme.colors.white,
    },
    speakerIconContainer: {
      position: 'absolute',
      bottom: moderateScale(5),
      right: moderateScale(5),
      width: moderateScale(25),
      height: moderateScale(25),
      borderRadius: moderateScale(12),
      backgroundColor: '#7B2CFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: moderateScale(1.5),
      borderColor: theme.colors.white,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 4,
      zIndex: 2,
    },
    speakerIcon: {
      width: moderateScale(15),
      height: moderateScale(15),
      tintColor: theme.colors.white,
      resizeMode: 'contain',
    },
    speakerIconStop: {
      width: moderateScale(22),
      height: moderateScale(22),
      resizeMode: 'contain',
    }
  
  })
  
