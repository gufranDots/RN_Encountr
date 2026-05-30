import { useIsFocused } from '@react-navigation/native'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useSelector } from 'react-redux'
import AddMediaImageView from '../../Components/AddMediaImageView'
import ButtonComp from '../../Components/ButtonComp'
import HeaderComp from '../../Components/HeaderComp'
import { Loader } from '../../Components/Loader'
import WrapperContainer from '../../Components/WrapperContainer'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import { uploadProfileMediaApi } from '../../redux/reduxActions/homeActions'
import colors from '../../styles/colors'
import { height, moderateScale, width } from '../../styles/responsiveSize'
import {
  ApiError,
  selectMultipleImage,
  selectMultipleImageFromGallery,
  selectSingleImage,
  showError,
  showSuccess
} from '../../utils/helperFunctions'
import { requestCameraPermission } from '../../utils/miscellaneous'
import { stableKeyExtractor } from '../../utils/stableKeyExtractor'
import { noOfImagesCanAdd } from '../../utils/subscriptionFunctions'
import { enableFreeze } from 'react-native-screens'
import { getCommonStyles } from '../../styles/commonStyles'
import { useTheme } from '../../theme/ThemeProvider'
enableFreeze()
const AddMediaScreen = ({ navigation }) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const userData = useSelector(state => state?.authReducers?.userData || {})
  const isFocused = useIsFocused()

  const checkImgArrLength = noOfImagesCanAdd(
    userData?.subscription?.subscription_id
  )
  const [selectedImages, setSelectedImages] = useState([{ name: '_IS_LAST' }])
  const [loading, setIsLoading] = useState(false)


  useLayoutEffect(() => {
    if (Array.isArray(userData?.photos) && userData && userData?.photos.length > 1) {
      navigation.navigate(navigationString.SET_PREFERENCES_AUTH)
    }
  }, [isFocused])

  const _selectImages = async () => {
    await requestCameraPermission().then(res => {
      selectMultipleImage().then(res => {
        if(Array.isArray(res)){
          const filterArr = selectedImages.filter(
            (val, index) => val?.name !== '_IS_LAST'
          )
          const arr = [...filterArr, ...res]
          arr.push({ name: '_IS_LAST' })
          setSelectedImages(arr)
        } else {
          const filterArr = selectedImages.filter(
            (val, index) => val?.name !== '_IS_LAST'
          )
          const arr = [...filterArr, res]
          arr.push({ name: '_IS_LAST' })
          setSelectedImages(arr)
        }
      })
    })
  }

  const lastComp = () => {
    return (
      <TouchableOpacity
        style={styles.viewStyle}
        activeOpacity={0.8}
        onPress={_selectImages}>
        <Image source={imagesPath.ic_camera2} />
        <Text
          style={{
            ...commonStyles.font_14_medium,
            color: theme.colors.black,
            marginTop: moderateScale(8)
          }}>
          {strings.addPhoto}
        </Text>
      </TouchableOpacity>
    )
  }

  const _onPressCross = (item, index) => {
    const tempArr = selectedImages.filter(
      (val, ind) => ind !== index && val?.name !== '_IS_LAST'
    )
    // if (tempArr.length < checkImgArrLength) {
    //   tempArr.push({ name: '_IS_LAST' })
    // }
    tempArr.push({ name: '_IS_LAST' })
    setSelectedImages(tempArr)
  }

  const renderItem = useCallback(
    ({ item, index }) => {
      if (item?.name === '_IS_LAST') {
        return lastComp()
      }
      return (
        <AddMediaImageView
          size={selectedImages.length || 0}
          indexData={index || 0}
          onPressCross={() => _onPressCross(item, index)}
          itemData={item}
        />
      )
    },
    [selectedImages]
  )

  const _uploadMediaPic = () => {
    const filterMap = selectedImages.filter(val => val?.path)

    if (filterMap.length === 0) {
      return showError(strings.pleaseSelectAnImageToUpload)
    }
    setIsLoading(true)

    const data = new FormData()

    if (filterMap.length > 1) {
      for (let i = 0; i < filterMap.length; i++) {
        const photo = filterMap[i]
        data.append(`image[${i}]`, {
          uri: photo?.path,
          name: 'image.png',
          fileName: 'filename',
          type: 'image/png'
        })
        data.append(`type` , 0)
      }
    } else {
      data.append('image[0]', {
        uri: filterMap[0]?.path,
        name: 'image.png',
        fileName: 'filename',
        type: 'image/png'
      })
      data.append(`type` , 0)
    }
    uploadProfileMediaApi(data)
      .then(res => {
        // showSuccess(res?.message)
        // navigation.navigate(navigationString.SET_PREFERENCES_AUTH)
        navigation.navigate(navigationString.VOICE_DROP)
        setIsLoading(false)
      })
      .catch(error => {
        setIsLoading(false)
        showError(ApiError(error))
      })
  }

  return (
    <WrapperContainer paddingAvailable={false}>
      <HeaderComp
        // leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
        viewStyle={{ marginHorizontal: moderateScale(16) }}
      />
      <View style={styles.subContainer}>
        <Text style={styles.heading}>{strings.addMedia}</Text>
        <Text style={styles.subHeading}>
          {strings.addYourPhotosToGetMoreLikes}
        </Text>

        {selectedImages?.length === 0 ? lastComp() : <></>}
        <FlatList
          data={selectedImages}
          extraData={selectedImages}
          renderItem={renderItem}
          numColumns={2}
          style={styles.flatListStyle}
          keyExtractor={stableKeyExtractor}
          columnWrapperStyle={styles.flatListWrapperStyle}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatlistContentContainer}
          bounces={false}
        />
      </View>

      <ButtonComp
        btnStyle={styles.btnStyle}
        btnText={strings.continue}
        onPressBtn={_uploadMediaPic}
      />
      <Loader isLoading={loading} />
    </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles) => StyleSheet.create({
  subContainer: {
    marginTop: moderateScale(24),
    flex: 1
  },
  heading: {
    ...commonStyles.font_32_bold,
    marginHorizontal: moderateScale(16),
  },
  subHeading: {
    ...commonStyles.font_12_medium,
    marginTop: moderateScale(8),
    marginHorizontal: moderateScale(16),
    color: theme.colors.likePink
  },
  flatListStyle: {
    paddingHorizontal: moderateScale(16)
  },
  flatListWrapperStyle: {
    marginTop: moderateScale(14),
    justifyContent: 'space-between'
  },
  btnStyle: {
    marginBottom: moderateScale(40),
    marginTop: moderateScale(20),
    paddingHorizontal: moderateScale(16)
  },
  viewStyle: {
    height: height / 5,
    width: width / 2.3,
    borderRadius: moderateScale(12),
    backgroundColor: theme.colors.gray3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  renderView: {
    borderRadius: moderateScale(12)
  },
  renderImage: {
    height: height / 5,
    width: width / 2.3,
    borderRadius: moderateScale(12)
  },
  flatlistContentContainer: {
    paddingBottom: moderateScale(30)
  }
})

export default AddMediaScreen
