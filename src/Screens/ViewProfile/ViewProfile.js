// import liraries
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal
} from 'react-native'
import { useSelector } from 'react-redux'
import AddMediaImageView from '../../Components/AddMediaImageView'
import CollapsibleHeader from '../../Components/CollapsibleHeader'
import GradientText from '../../Components/GradientText'
import { Loader } from '../../Components/Loader'
import WrapperContainer from '../../Components/WrapperContainer'
import ButtonComp from '../../Components/ButtonComp'

import { CommonActions } from '@react-navigation/native'
import { enableFreeze } from 'react-native-screens'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import { ratingsApi } from '../../redux/reduxActions/authActions'
import { getOtherProfileApi, viewApi } from '../../redux/reduxActions/chatActions'
import {
  addToFavouriteApi,
  likeDislikeUserApi
} from '../../redux/reduxActions/homeActions'
import colors from '../../styles/colors'
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles'
import fontFamily from '../../styles/fontFamily'
import {
  height,
  moderateScale,
  textScale,
  width
} from '../../styles/responsiveSize'
import {
  ApiError,
  showError,
  showSuccess,
  formatHeightForDisplay
} from '../../utils/helperFunctions'
import { stableKeyExtractor } from '../../utils/stableKeyExtractor'
import { useTheme } from '../../theme/ThemeProvider'
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'
enableFreeze()
// create a component
const ProfileScreen = props => {
  const { theme, isDark } = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getProfileStyles(theme, commonStyles, isDark);
  const { navigation, route } = props
  const { prevScreenData } = route?.params

  const userData = useSelector(state => state?.authReducers?.userData || {})

  const [roomType, setRoomType] = useState(route?.params?.room_typr)
  const [btnLoading, setBtnLoading] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [showRestrictionModal, setShowRestrictionModal] = useState(false)
  const distance = prevScreenData?.distance
  const [isFav, setisFav] = useState(prevScreenData?.is_favourite != 0)

  const [age, setAge] = useState('')
  const bottomSheetRef = useRef(null)
  const [totalRating, setTotalRating] = useState(prevScreenData?.rating)
  const [totalUserRatingCount, setTotalUserRatingCount] = useState(
    prevScreenData?.rating_users_count
  )

  const isInteractionRestricted = () => {
    console.log(userData, 'userData?.subscription?.subscription_id');
    return userData?.subscription?.subscription_id === 1  &&
           userData?.profile_view_count  > 100
  }

  useEffect(() => {
    viewOnClick()
  })
  
  useEffect(() => {
    const _age = prevScreenData?.dob
      ? moment(prevScreenData?.dob, 'YYYYMMDD').fromNow()
      : ''
    _age.replace('years ago', '')
    setAge(_age)
  }, [])

  const viewOnClick = () => {
    const apiData = {
      user_id: Number(prevScreenData?.id)
    }

    viewApi(apiData)
      .then(() => {
      })
      .catch(error => {
        console.log(error, 'getOtherProfileApi error')
      })
  }

  const renderGalleryImages = useCallback(
    ({ item, index }) => {
      if (index > 3) {
        return
      }
      return (
        <AddMediaImageView
          itemData={item}
          size={
            prevScreenData?.photos?.length > 0
              ? prevScreenData?.photos?.length
              : 0
          }
          indexData={index || 0}
        />
      )
    },
    [prevScreenData?.photos]
  )

  const resetStack = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: navigationString.TABROUTES }]
      })
    )
  }

  const onLiked = () => {
    if (isInteractionRestricted()) {
      setShowRestrictionModal(true)
      return
    }

    {
      const apiData = {
        status: 1,
        user_id: prevScreenData?.id,
        request_type: 1
      }
      setLoading(true)
      likeDislikeUserApi(apiData)
        .then(res => {
          showSuccess(res?.message)
          resetStack()
          setLoading(false)
        })
        .catch(error => {
          console.log(error, 'erorrrrrrrrrrrl')
          setLoading(false)
          showError(ApiError(error))
        })
    }
  }

  const onChatIconPress = () => {
    if (isInteractionRestricted()) {
      setShowRestrictionModal(true)
      return
    }

    navigation.navigate(navigationString.CHATSCREEN, {
      prevData: prevScreenData
    })
  }

  const getTimeDifference = (timestamp) => {
    const currentTime = new Date()
    const previousTime = new Date(timestamp)
    const difference = currentTime - previousTime
    const minutes = Math.floor(difference / 60000) // 1 minute = 60000 milliseconds

    if (minutes < 1) {
      return 'Just now'
    } else if (minutes === 1) {
      return 'Active 1 minute ago'
    } else if (minutes < 60) {
      return `Active ${minutes} minutes ago`
    } else {
      const hours = Math.floor(minutes / 60)
      if (hours === 1) {
        return 'Active 1 hour ago'
      } else if (hours < 24) {
        return `Active ${hours} hours ago`
      } else {
        const days = Math.floor(hours / 24)
        if (days === 1) {
          return 'Active 1 day ago'
        } else {
          return `Active ${days} days ago`
        }
      }
    }
  }


  const handlePress = async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  const renderParentView = () => {
    return (
      <View style={styles.viewStyle}>
        <View style={styles.nameView}>
          <View>
            <View style={{ flexDirection: 'row', marginTop: moderateScale(24) }}>
              {prevScreenData?.is_age !== 0
                ? (

                  <GradientText
                    text={
                      prevScreenData?.first_name +
                      ', ' +
                      age.replace('years ago', '')
                    }
                    textStyle={{
                      ...styles.labelText,
                      textTransform: 'capitalize'
                    }}
                    start={{ x: 0, y: 0.8 }}
                    end={{ x: 0.8, y: 0.9 }}
                  />
                )
                : (<GradientText
                  text={
                    prevScreenData?.first_name
                  }
                  textStyle={{
                    ...styles.labelText,
                    textTransform: 'capitalize'
                  }}
                  start={{ x: 0, y: 0.8 }}
                  end={{ x: 0.8, y: 0.9 }}
                />)}

            </View>
            {prevScreenData?.online_status == true
              ? (
                <View style={{ alignItems: 'center', flexDirection: 'row', marginTop: moderateScale(5) }}>
                  <Image
                    source={imagesPath.dotIcon}
                    style={{
                      ...commonStyles.iconStyle10,
                      tintColor: theme.colors.garkGreen
                    }}
                  />
                  <Text style={styles.textStyle}>Active Now</Text>
                </View>
              )
              : <Text style={[styles.textStyle, { marginTop: moderateScale(5) }]}>{getTimeDifference(prevScreenData?.updated_at)}</Text>}
          </View>
          <TouchableOpacity
            hitSlop={hitSlopProp}
            onPress={() => {
              if (isInteractionRestricted()) {
                setShowRestrictionModal(true)
                return
              }
              if (userData?.user_type === 2) {
                navigation.navigate(navigationString.CHATSCREEN, {
                  prevData: prevScreenData
                })
              }
            }}>
            <Image
              source={userData?.user_type === 2 ? imagesPath.goldenChat : {}}
              style={{
                marginTop: moderateScale(20)
              }}
            />
          </TouchableOpacity>
          <View style={commonStyles.rowCenterAligned}>
            <TouchableOpacity
              disabled={false}
              style={{ ...styles.boxView, marginRight: moderateScale(8) }}
              activeOpacity={0.8}
              onPress={onLiked}>
              <Image
                source={imagesPath.tapIcon}
                style={commonStyles.iconStyle24}
                tintColor={theme.colors.activeTintColor}
              />
            </TouchableOpacity>
            {!roomType
              ? (
                <TouchableOpacity
                  style={styles.boxView}
                  activeOpacity={0.8}
                  onPress={onChatIconPress}>
                  <Image
                    source={imagesPath.msgIcon}
                    style={commonStyles.iconStyle24}
                    tintColor={theme.colors.activeTintColor}
                  />
                </TouchableOpacity>
              )
              : null}
          </View>
        </View>

        {prevScreenData?.is_bio_visible && prevScreenData?.about_me != null
          ? <View style={styles.locationView2}>
            <View style={{ flex: 0.9 }}>
              <GradientText
                text={'According to me'}
                textStyle={styles.labelText}
                start={{ x: 0, y: 0.4 }}
                end={{ x: 0.4, y: 0.9 }}
              />
              <Text style={styles.textStyle}>
                {prevScreenData?.about_me}
              </Text>
            </View>
          </View>
          : null}
        {prevScreenData?.is_location == 1 && (prevScreenData?.city != null || prevScreenData?.country != null) ? <View style={styles.locationView2}>
          <View style={{ flex: 0.9 }}>
            <GradientText
              text={strings.location}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.4 }}
              end={{ x: 0.4, y: 0.9 }}
            />
            <Text style={styles.textStyle}>
              {prevScreenData?.city},{prevScreenData?.country}
            </Text>
          </View>

          {distance!=0 && <View style={styles.locationView}>
            <Image
              style={{ tintColor: isDark ? theme.colors.primaryWhite : theme.colors.themecolor2 }}
              source={imagesPath.ic_location}
            />
            <Text style={styles.txtView}>
              {distance ? (distance * 0.621371).toFixed(2) : 0} miles
            </Text>
          </View>}
        </View> : null}





        {prevScreenData?.is_bio_visible && prevScreenData?.bio != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Bio'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.bio}</Text>
          </View>
        ) : null}



        {prevScreenData?.is_height_visible && prevScreenData?.height != 0 ? (
          <View style={styles.labelView}>
            <GradientText
              text="Height"
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{formatHeightForDisplay(prevScreenData?.height)}</Text>
          </View>
        ) : null}

        {(prevScreenData?.is_weight_visible == 1 && prevScreenData?.weight != null) && (
          <View style={styles.labelView}>
            <GradientText
              text={'Weight'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.weight ? prevScreenData?.weight : '0'} Pounds</Text>
          </View>
        )}

        {/* {prevScreenData?.highest_education && (
          <View style={styles.labelView}>
            <GradientText
              text={'Highest Education'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>
              {prevScreenData?.highest_education}
            </Text>
          </View>
        )} */}

        {prevScreenData?.occupation != null && (
          <View style={styles.labelView}>
            <GradientText
              text={'Occupation'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.occupation}</Text>
          </View>
        )}

        {prevScreenData?.is_body_type_visible && prevScreenData?.body_type != "Not Specified" ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Body Type'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.body_type}</Text>
          </View>
        ) : null}

        {prevScreenData?.is_looking_for_visible && prevScreenData?.looking_for != "Not Specified" ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Looking for'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.looking_for}</Text>
          </View>
        ) : null}

        {prevScreenData?.is_position_visible && prevScreenData?.position != "Not Specified" ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Position'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.position}</Text>
          </View>
        ) : null}

        {/* { prevScreenData?.position ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Position'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.position}</Text>
          </View>
        ):null} */}

        {prevScreenData?.is_hiv_status_visible && prevScreenData?.hiv_status != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={'HIV'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.hiv_status}</Text>
          </View>
        ) : null}

        {prevScreenData?.is_last_tested_visible && prevScreenData?.last_tested != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Last Tested'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.last_tested}</Text>
          </View>
        ) : null}


        {prevScreenData?.is_tribes_visible && prevScreenData?.tribes != "Not Specified" ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Tribes'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.tribes}</Text>
          </View>
        ) : null}
        {prevScreenData?.is_meet_at_visible && prevScreenData?.meet_at != "Not Specified" ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Meet at'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.meet_at}</Text>
          </View>
        ) : null}


        {prevScreenData?.is_nsfw_visible && prevScreenData?.nsfw != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Accept NSFW Pics'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.nsfw}</Text>
          </View>
        ) : null}


        {prevScreenData?.is_expectations_visible && prevScreenData?.expectations != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Expectations'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.expectations}</Text>
          </View>
       ) : null} 

        {prevScreenData?.is_vaccinations_visible && prevScreenData?.vaccination != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={'Vaccination'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.vaccination}</Text>
          </View>
        ) : null}

        {prevScreenData?.is_relationship_status_visible && prevScreenData?.married_status != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={strings.relationShipStatus}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>
              {prevScreenData?.married_status == 1
                ? 'Committed'
                : prevScreenData?.married_status == 2
                  ? 'Dating'
                  : prevScreenData?.married_status == 3
                    ? 'Engaged'
                    : prevScreenData?.married_status == 4 ? 'Exclusive' :
                      prevScreenData?.married_status == 5 ? 'Married' :
                        prevScreenData?.married_status == 6 ? 'Open Relationship' :
                          prevScreenData?.married_status == 7 ? 'Partnered' :
                            prevScreenData?.married_status == 8 ? 'Single' :
                              'Not Specified'
              }
            </Text>
          </View>
        ) : null}


        {prevScreenData?.having_kids != null && (
          <View style={styles.labelView}>
            <GradientText
              text={'Has kids'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text style={styles.textStyle}>{prevScreenData?.having_kids}</Text>
          </View>
        )}


        {prevScreenData?.is_facebook_link_visible && prevScreenData?.facebook != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={strings.facebook_Link}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text onPress={() => { 
              if (isInteractionRestricted()) {
                setShowRestrictionModal(true)
                return
              }
              handlePress(prevScreenData?.facebook) 
            }} style={[styles.textStyle, { color: theme.colors.blue }]}>{prevScreenData?.facebook}</Text>
          </View>
        ) : null}

        {prevScreenData?.is_instagram_link_visible && prevScreenData?.instagram != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={strings.instagram_Link}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text onPress={() => { 
              if (isInteractionRestricted()) {
                setShowRestrictionModal(true)
                return
              }
              handlePress(prevScreenData?.instagram) 
            }} style={[styles.textStyle, { color: theme.colors.blue }]}>{prevScreenData?.instagram}</Text>
          </View>
        ) : null}

        {prevScreenData?.is_linkedin_link_visible && prevScreenData?.linkedin != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={strings.LINKEDIN_LINK}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text onPress={() => { 
              if (isInteractionRestricted()) {
                setShowRestrictionModal(true)
                return
              }
              handlePress(prevScreenData?.linkedin) 
            }} style={[styles.textStyle, { color: theme.colors.blue }]}>{prevScreenData?.linkedin}</Text>
          </View>
        ) : null}

        {prevScreenData?.is_twitter_link_visible && prevScreenData?.twitter != null ? (
          <View style={styles.labelView}>
            <GradientText
              text={strings.twitter_Link}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />
            <Text onPress={() => { 
              if (isInteractionRestricted()) {
                setShowRestrictionModal(true)
                return
              }
              handlePress(prevScreenData?.twitter) 
            }} style={[styles.textStyle, { color: theme.colors.blue }]}>{prevScreenData?.twitter}</Text>
          </View>
        ) : null}


        {prevScreenData?.tags.length !== 0 && (
          <View style={styles.labelView}>
            <GradientText
              text={'Interests'}
              textStyle={styles.labelText}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0.2, y: 0.5 }}
            />

            <View style={{ flexDirection: 'row', flexWrap: 'wrasp' }}>
              {prevScreenData?.tags?.map((item) => {
                return (
                  <Text
                    style={{
                      ...styles.textStyle,
                      paddingHorizontal: moderateScale(8)
                    }}>
                    {item?.tag_name}
                  </Text>
                )
              })}
            </View>
          </View>
        )}

        {prevScreenData?.is_private_gallery_visible && prevScreenData?.has_private_gallery_access != false ? (
          <View>
            <View style={styles.galleryView}>
              <GradientText
                text={strings.privateGallery}
                textStyle={styles.labelText}
                start={{ x: 0, y: 0.8 }}
                end={{ x: 0.8, y: 0.8 }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (isInteractionRestricted()) {
                    setShowRestrictionModal(true)
                    return
                  }
                  if (Array.isArray(prevScreenData?.privatephotos) &&
                    prevScreenData?.privatephotos &&
                    prevScreenData?.privatephotos.length > 0) {
                    navigation.navigate(navigationString.ALL_PRIVATE_GALLERY_IMAGES, {
                      userGalleryImages: prevScreenData?.privatephotos,
                      showBottomBtn: false
                    })
                  } else {
                    showError('Gallery is empty')
                  }
                }}
                activeOpacity={0.9}
                hitSlop={hitSlopProp}>
                <GradientText
                  text={strings.seeAll}
                  textStyle={styles.labelText}
                  start={{ x: 0, y: 0.7 }}
                  end={{ x: 0.7, y: 0.8 }}
                />
              </TouchableOpacity>
            </View>


            <FlatList
              renderItem={renderGalleryImages}
              data={prevScreenData?.privatephotos || []}
              extraData={prevScreenData?.privatephotos || []}
              numColumns={2}
              keyExtractor={stableKeyExtractor}
              columnWrapperStyle={{
                marginTop: moderateScale(14),
                justifyContent: 'space-between'
              }}
              contentContainerStyle={{ paddingBottom: moderateScale(24) }}
              ListEmptyComponent={
                <View>
                  <Text
                    style={{
                      ...commonStyles.font_14_medium,
                      textAlign: 'center',
                      marginVertical: moderateScale(16)
                    }}>
                    {strings.noGalleryImagesAvailable}
                  </Text>
                </View>
              }
            />
          </View>
        ) : null}

        {prevScreenData?.is_gallery_visible && prevScreenData?.photos?.length != 0 ? (
          <>
            <View style={styles.galleryView}>
              <GradientText
                text={strings.gallery}
                textStyle={styles.labelText}
                start={{ x: 0, y: 0.8 }}
                end={{ x: 0.8, y: 0.8 }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (isInteractionRestricted()) {
                    setShowRestrictionModal(true)
                    return
                  }
                  if (Array.isArray(prevScreenData?.photos) &&
                    prevScreenData?.photos &&
                    prevScreenData?.photos.length > 0) {
                    navigation.navigate(navigationString.ALL_GALLERY_IMAGES, {
                      userGalleryImages: prevScreenData?.photos,
                      showBottomBtn: false
                    })
                  } else {
                    showError('Gallery is empty')
                  }
                }}
                activeOpacity={0.9}
                hitSlop={hitSlopProp}>
                <GradientText
                  text={strings.seeAll}
                  textStyle={styles.labelText}
                  start={{ x: 0, y: 0.7 }}
                  end={{ x: 0.7, y: 0.8 }}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              renderItem={renderGalleryImages}
              data={prevScreenData?.photos || []}
              extraData={prevScreenData?.photos || []}
              numColumns={2}
              keyExtractor={stableKeyExtractor}
              columnWrapperStyle={{
                marginTop: moderateScale(14),
                justifyContent: 'space-between'
              }}
              contentContainerStyle={{ paddingBottom: moderateScale(24) }}
              ListEmptyComponent={
                <View>
                  <Text
                    style={{
                      ...commonStyles.font_14_medium,
                      textAlign: 'center',
                      marginVertical: moderateScale(16)
                    }}>
                    {strings.noGalleryImagesAvailable}
                  </Text>
                </View>
              }
            />
          </>
        ) : null}

      </View>
    )
  }

  const onPressFav = async (favNotes) => {
    if (isInteractionRestricted()) {
      setShowRestrictionModal(true)
      return
    }

    setLoading(true)
    const userId = { user_id: prevScreenData?.id, notes: favNotes }
    addToFavouriteApi(userId).then(res => {
      console.log('response', res)
      showSuccess(!isFav ? 'User added to Faves successfully' : 'User removed from Faves successfully')
      setisFav(!isFav)
      setLoading(false)
    }).catch((error) => {
      showError(error?.message)
      setLoading(false)
      console.log('error', error)
    })
  }

  return (

    <WrapperContainer
      paddingAvailable={false}
      isSafeAreaAvailable={true}>
      <CollapsibleHeader
        renderParentView={renderParentView}
        onPressBack={() => navigation.goBack()}
        boxStyle={{ borderColor: theme.colors.darkBlack, borderWidth: 0.5 }}
        rightBoxStyle={{
          borderColor: theme.colors.darkBlack,
          borderWidth: 0.5
        }}
        imgStyle={{
          tintColor: isFav ? theme.colors.red : undefined,
          width: moderateScale(40),
          height: moderateScale(40)
        }}
        onPressRightIcon={onPressFav}
        isFav={isFav}
        leftIcon={imagesPath.ic_back}
        rightIcon={imagesPath.ic_heart}
        imageStyle={{ tintColor: theme.colors.black }}
        fileUrl={
          prevScreenData?.profile_image
            ? (String(prevScreenData?.is_profile_image_approved) === '1'
                ? prevScreenData?.profile_image
                : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png')
            : imagesPath.noImage
        }
      />
      <Loader isLoading={isLoading} />
      <Modal
        visible={showRestrictionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRestrictionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <GradientText
              text="Profile View Limit Reached"
              textStyle={styles.modalTitle}
              start={{ x: 0, y: 0.8 }}
              end={{ x: 0.8, y: 0.8 }}
            />
            <Text style={styles.modalDescription}>
              You've reached your profile view limit. Upgrade to a Plus subscription to view unlimited profiles and interact with users.
            </Text>
            <View style={styles.modalButtonContainer}>
              <ButtonComp
                btnText="Upgrade now to Plus"
                onPressBtn={() => {
                  setShowRestrictionModal(false)
                  navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
                    from: 'ViewProfile'
                  })
                }}
                btnStyle={styles.upgradeButton}
              />
              <TouchableOpacity
                onPress={() => setShowRestrictionModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </WrapperContainer>
  )
}

// define your styles
const getProfileStyles = (theme, commonStyles, isDark) => StyleSheet.create({
  container: {
    flex: 1
  },
  textStyle: {
    ...commonStyles.font_14_bold,
    marginLeft: moderateScale(5),
    color: theme.colors.darkBlack,
  },
  labelText: {
    ...commonStyles.font_18_bold,
    color: theme.colors.darkBlack,
    fontWeight:'800'
  },
  labelView: { marginTop: moderateScale(30) },
  renderView: {
    marginTop: moderateScale(12)
  },
  renderImage: {
    height: moderateScale(190),
    width: '100%',
    borderRadius: moderateScale(8)
  },
  viewStyle: {
    backgroundColor: theme.colors.white,
    flex: 1,
    marginTop: -moderateScale(20),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(22)
  },
  galleryView: {
    marginTop: moderateScale(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(8)
  },
  txtView: {
    marginLeft: moderateScale(4),
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
    color: isDark ? theme.colors.primaryWhite: theme.colors.themecolor2
  },
  locationView: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(8),
    height: moderateScale(38)
  },
  circleView: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end'
  },
  circleStyle: {
    height: moderateScale(70),
    width: moderateScale(70),
    backgroundColor: theme.colors.darkBlack,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(37),
    shadowOffset: { width: 1, height: 2 },
    shadowColor: theme.colors.gray4,
    shadowOpacity: 1.0
  },
  absoluteStyle: {
    width,
    position: 'absolute',
    zIndex: 2000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    top: -moderateScale(40),
    marginBottom: moderateScale(30)
  },
  nameView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  locationView2: {
    flexDirection: 'row',
    marginTop: moderateScale(24),
    justifyContent: 'space-between',
    flex: 1
  },
  bottomSheetStyle: {
    backgroundColor: theme.colors.black
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(20)
  },
  boxView: {
    borderWidth: moderateScale(1),
    height: moderateScale(48),
    width: moderateScale(48),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: theme.colors.inputGray
  },
  absolute: {
    position: 'absolute',
    top: moderateScale(120),
    left: 0,
    bottom: 0,
    right: 0
  },
  blurTxtContainer: {
    alignItems: 'center',
    height: height / 3,
    marginBottom: moderateScale(20),
    marginHorizontal: moderateScale(40)
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.blackOpacity30
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    alignItems: 'center',
    width: '85%',
    maxWidth: moderateScale(320)
  },
  modalTitle: {
    ...commonStyles.font_20_bold,
    color: theme.colors.darkBlack,
    marginBottom: moderateScale(16),
    textAlign: 'center'
  },
  modalDescription: {
    ...commonStyles.font_16_medium,
    color: theme.colors.darkBlack,
    textAlign: 'center',
    marginBottom: moderateScale(24),
    lineHeight: moderateScale(22)
  },
  modalButtonContainer: {
    width: '100%',
    gap: moderateScale(12)
  },
  upgradeButton: {
    backgroundColor: theme.colors.themecolor2,
    borderRadius: moderateScale(12),
    height: moderateScale(48)
  },
  cancelButton: {
    paddingVertical: moderateScale(12),
    alignItems: 'center'
  },
  cancelButtonText: {
    ...commonStyles.font_16_medium,
    color: theme.colors.black
  },
  restrictionIndicator: {
    backgroundColor: theme.colors.themecolor2,
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(16),
    alignItems: 'center'
  },
  restrictionText: {
    ...commonStyles.font_14_medium,
    color: theme.colors.white,
    textAlign: 'center'
  }
})

// make this component available to the app
export default React.memo(ProfileScreen)
