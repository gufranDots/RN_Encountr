import React, { useCallback, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
} from 'react-native'
import { useSelector } from 'react-redux'
import AddMediaImageView from '../../Components/AddMediaImageView'
import ButtonComp from '../../Components/ButtonComp'
import GalleryImageModal from '../../Components/GalleryImageModal'
import GradientText from '../../Components/GradientText'
import HeaderComp from '../../Components/HeaderComp'
import { Loader } from '../../Components/Loader'
import WrapperContainer from '../../Components/WrapperContainer'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import navigationString from '../../constants/navigationString'
import {
  deletePrivateGalleryImageApi,
  uploadPrivateProfileMediaApi,
} from '../../redux/reduxActions/homeActions'
import colors from '../../styles/colors'
import { height, moderateScale, moderateScaleVertical, width } from '../../styles/responsiveSize'
import {
  ApiError,
  selectMultipleImageFromGallery,
  selectPrivateMultipleImageFromGallery,
  showError,
  showSuccess
} from '../../utils/helperFunctions'
import { stableKeyExtractor } from '../../utils/stableKeyExtractor'
import { requestCameraPermission } from '../../utils/miscellaneous'
import {
  canAddMoreImageFnc,
  noOfImagesCanAdd
} from '../../utils/subscriptionFunctions'
import { enableFreeze } from 'react-native-screens'
import { saveAllHomeData } from '../../redux/reduxActions/authActions'
import { saveHomeData } from '../../redux/reduxReducers/authReducers'
import { useTheme } from '../../theme/ThemeProvider'
import { getCommonStyles } from '../../styles/commonStyles'
enableFreeze()
const AllPrivateGalleryImages = props => {
  const {theme , isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles,isDark);
  const { navigation, route } = props
  const userData = useSelector(state => state?.authReducers?.userData || {})
  const showBottomBtn = route?.params?.showBottomBtn
  const privateAlbum = route?.params?.privateAlbum

  const checkImgArrLength = noOfImagesCanAdd(
    userData?.subscription?.subscription_id
  )

  const [viewGalleryImgs, setViewGalleryImgs] = useState({
    isVisible: false,
    currentIndex: 0
  })

  const [isLoading, setLoading] = useState(false)


  console.log("userDatauserData789",userData);

  const [privateSelectedImages, setPrivateprivateSelectedImages] = useState(route?.params?.userGalleryImages? [...route?.params?.userGalleryImages] || []: [...userData?.privatephotos] || [])
  // const [privateSelectedImages, setPrivateprivateSelectedImages] = useState(userData?.privatephotos || [])
  console.log("privateSelectedImagesprivateSelectedImages",privateSelectedImages);

  const _selectImages = async () => {
    await requestCameraPermission().then(res => {
      _takePrivatePhotoFromGallery()
    })
  }

  const _takePrivatePhotoFromGallery = () => {
    selectPrivateMultipleImageFromGallery().then(picArr => {
      console.log(picArr, 'pic array ===>>>>>>>>>.', userData)
      const arr = [...privateSelectedImages, ...picArr]
      setPrivateprivateSelectedImages(arr)
    })
  }

  const lastComp = () => {
    return (
      <TouchableOpacity
        style={styles.viewStyle}
        activeOpacity={0.8}
        // onPress={_selectImages}
        onPress={()=>{_selectImages()}}
        >
        <Image source={imagesPath.ic_camera2} />
        <Text
          style={{ ...commonStyles.font_14_medium, marginTop: moderateScale(8) }}>
          {strings.addPhoto}
        </Text>
      </TouchableOpacity>
    )
  }

  const _askToDeleteImage = (item, index) => {
    // if (userData?.privatephotos.length === 1) {
    //   return showError(strings.cantDeleteAllPhotos)
    // }
    Alert.alert(strings.delete, strings.areYouSureWantDeleteThisPicture, [
      {
        text: strings.yes,
        style: 'destructive',
        onPress: () => _deleteImage(item, index)
      },
      {
        text: strings.no
      }
    ])
  }

  const _deleteImage = (item, index) => {
    const _restImages = privateSelectedImages.filter(
      val => val.id && val.id !== item.id
    )
    // return console.log(_restImages, "_restImages");
    setLoading(true)
    const arr = [item?.id || -1]
    const _formData = new FormData()
    _formData.append('image_ids', arr)
    deletePrivateGalleryImageApi(_formData, _restImages)
      .then(res => {
        console.log("lplo",res);
        setLoading(false)
        _setArrayAfterDelete(item, index)
      })
      .catch(error => {
        setLoading(false)
        showError(ApiError(error))
      })
  }

  const _onPressCross = (item, index) => {
    
    if (item?.id) {
      _askToDeleteImage(item, index)
    } else {
      _setArrayAfterDelete(item, index)
    }
  }

  const _setArrayAfterDelete = (item, index) => {
    const tempArr = privateSelectedImages.filter((val, ind) => ind !== index)
    setPrivateprivateSelectedImages(tempArr)
  }

  const renderItem = useCallback(
    ({ item, index }) => {
      console.log("gugu2",route?.params?.userGalleryImages)
      // if (item?.name === '_IS_LAST') {
      //   return lastComp()
      // }
      if (route?.params?.userGalleryImages) {
        return (
          <AddMediaImageView
            size={privateSelectedImages.length || 0}
            indexData={index || 0}
            itemData={item}
            onPress={() => {
              setViewGalleryImgs({
                isVisible: true,
                currentIndex: index
              })
            }}
          />
        )
      }
      return (
        <AddMediaImageView
          size={privateSelectedImages.length || 0}
          indexData={index || 0}
          onPressCross={() => _onPressCross(item, index)}
          itemData={item}
          onPress={() => {
            setViewGalleryImgs({
              isVisible: true,
              currentIndex: index
            })
          }}
        />
      )
    },
    [privateSelectedImages]
  )

  const _uploadMediaPic = () => {
    setLoading(true)

    const filterMap = privateSelectedImages.filter(val => val?.path)

    if (filterMap.length === 0) {
      setLoading(false)
      // return showError('Please select an image to upload')
      return navigation.goBack()
    }

    const formImages = new FormData()

    if (filterMap.length > 1) {
      for (let i = 0; i < filterMap.length; i++) {
        const photo = filterMap[i]
        // data.append(`image[${i}]`, {
        //     name: photo?.filename,
        //     type: photo?.mime,
        //     fileName: photo?.filename,
        //     uri: photo?.path
        // })
        formImages.append(`image[${i}]`, {
          uri: photo?.path,
          name: 'image.png',
          fileName: 'filename',
          type: 'image/png'
        }),
        formImages.append(`type` , 1)

      }
    } else {
      // data.append('image[0]', {
      //     name: filterMap[0]?.filename,
      //     type: filterMap[0]?.mime,
      //     fileName: filterMap[0]?.filename,
      //     uri: filterMap[0]?.path
      // })
      formImages.append('image[0]', {
        uri: filterMap[0]?.path,
        name: 'image.png',
        fileName: 'filename',
        type: 'image/png'
      })
      formImages.append(`type` , 1)
    }

    uploadPrivateProfileMediaApi(formImages)
      .then(res => {
        console.log("res787",res);
        // showSuccess(res?.message)
        // navigation.goBack()
        setLoading(false)
        navigation.navigate(navigationString.DrawerStack)
      })
      .catch(error => {
        setLoading(false)
        showError(ApiError(error))
      })
  }

  const ListFooterComponent = () => {
    return (
      <View style={{ marginHorizontal: moderateScale(6) }}>{lastComp()}</View>
    )
  }

  return (
    <WrapperContainer isSafeAreaAvailable={true}>
      <HeaderComp
        viewStyle={{ marginTop: Platform.OS === 'android' ? moderateScaleVertical(25) : 0 }}
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
      />
      <View style={styles.subContainer}>
        {/* {privateAlbum == true?( */}
          <GradientText
          text={"Private Gallery"}
          textStyle={styles.heading}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0.4, y: 0.5 }}
          />
        {/* ):(
          <GradientText
          text={strings.gallery}
          textStyle={styles.heading}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0.4, y: 0.5 }}
          />
        )} */}
        {route?.params?.userGalleryImages
          ? (
          <></>
            )
          : (
          <Text style={styles.subHeading}>
            {strings.addYourPhotosToGetMoreLikes}
          </Text>
            )}

        <FlatList
          data={privateSelectedImages}
          extraData={privateSelectedImages}
          renderItem={renderItem}
          numColumns={2}
          style={styles.flatListStyle}
          keyExtractor={stableKeyExtractor}
          columnWrapperStyle={styles.flatListWrapperStyle}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatlistContentContainer}
          ListFooterComponent={
            !route?.params?.userGalleryImages && ListFooterComponent
          }
        />
      </View>
      {showBottomBtn && (
        <ButtonComp
          btnStyle={styles.btnStyle}
          btnText={strings.save}
          onPressBtn={_uploadMediaPic}
        />
      )}
      <Modal
        visible={viewGalleryImgs?.isVisible}
        onRequestClose={() =>
          setTimeout(()=> 
          setViewGalleryImgs({
            isVisible: false,
            currentIndex: 0
          }),600)
        }>
        <GalleryImageModal
          currentIndex={viewGalleryImgs?.currentIndex}
          data={privateSelectedImages}
          onPressClose={() =>
            setViewGalleryImgs({
              isVisible: false,
              currentIndex: 0
            })
          }
        />
      </Modal>

      <Loader isLoading={isLoading} />
    </WrapperContainer>
  )
}

const getStyles = (theme, commonStyles, isDark) => StyleSheet.create({
  subContainer: {
    marginTop: moderateScale(16),
    flex: 1
  },
  heading: {
    ...commonStyles.font_32_bold,
    marginHorizontal: moderateScale(16),
    color: isDark ? theme.colors.blackOpacity80 : theme.colors.themecolor2
  },
  subHeading: {
    ...commonStyles.font_12_SemiBold,
    marginTop: moderateScale(8),
    marginHorizontal: moderateScale(16),
    color: theme.colors.black
  },
  flatListStyle: {
    paddingHorizontal: moderateScale(16)
  },
  flatListWrapperStyle: {
    marginTop: moderateScale(14),
    justifyContent: 'space-around'
  },
  btnStyle: {
    marginBottom: moderateScale(24),
    marginTop: moderateScale(20),
    paddingHorizontal: moderateScale(16)
  },
  viewStyle: {
    height: height / 5,
    width: width / 2.3,
    borderRadius: moderateScale(12),
    backgroundColor: theme.colors.gray3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(20)
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

export default AllPrivateGalleryImages

