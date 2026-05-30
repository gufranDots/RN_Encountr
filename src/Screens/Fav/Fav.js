import {
  View,
  Text,
  Image,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import ListEmptyComponent from '../../Components/ListEmptyComponent'
import strings from '../../constants/Languages'
import imagesPath from '../../constants/imagesPath'
import WrapperContainer from '../../Components/WrapperContainer'
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
  width
} from '../../styles/responsiveSize'
import colors from '../../styles/colors'
import fontFamily from '../../styles/fontFamily'
import { getAllFavouritesUsersApi } from '../../redux/reduxActions/MatchesActions'
import { navigationString } from '../../constants'
import { TabBarIndicator } from 'react-native-tab-view'
import { addToFavouriteApi, updateFavouriteTxt } from '../../redux/reduxActions/homeActions'
import { showSuccess } from '../../utils/helperFunctions'
import FastImage from '../../utils/FastImageCompat'
import { useIsFocused } from '@react-navigation/native'
import Modal from 'react-native-modal';
import ButtonComp from '../../Components/ButtonComp'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../theme/ThemeProvider'

const Fav = ({ navigation }) => {
  const {theme} = useTheme();
  const styles = getStyles(theme)
  const [userItem, setUserItem] = useState({})
  const [enableEdit, setEnableEdit] = useState(false)
  const [favsList, setfavsList] = useState([])
  const [isRefresh, setisRefresh] = useState(false)
  const [favouriteUpdateValue, setFavouriteUpdateValue] = useState("")
  const [isNotesShow, setNotesShow] = useState({ index: '', value: false })
  const isFocused = useIsFocused()
  useEffect(() => {
    getFavList()
  }, [isFocused])

  const getFavList = async () => {
    setisRefresh(true)
    const payLoad = {
      pageNo: '1',
      searchText: ''
    }
    try {
      const reponse = await getAllFavouritesUsersApi(payLoad)
      if (reponse?.success == true) {
        setfavsList(reponse?.data?.data)
        setisRefresh(false)
      }
      setisRefresh(false)
    } catch {
      console.log(reponse?.error, 'error')
      setisRefresh(true)
    }
  }
  const onPressFav = async item => {
    const userId = { user_id: item?.id }
    setisRefresh(true)
    const response = await addToFavouriteApi(userId)
    if (response?.success == true) {
      if (response?.message == 'Favourite Successfully.') {
        showSuccess('User added to Faves successfully')
        getFavList()
        return
      } else if (response?.message == 'Unfavourite Successfully.') {
        showSuccess('User removed from Faves successfully')
        getFavList()
        return
      }
    }
    setisRefresh(false)
  }

  const onUserCardPress = (item) => {
    navigation.navigate(navigationString.VIEWPROFILE, {
      prevScreenData: item
    })
  }

  const updateFavouriteText = (favouriteUpdateValue, userItem) => {

    const apiData = {
      "id": userItem?.id,
      "notes":favouriteUpdateValue
    }
    console.log("ggg", apiData);

    if (favouriteUpdateValue  == "") {
      showSuccess("Please enter Value")
      
    }else{

      
      
      updateFavouriteTxt(apiData)
        .then(res => {
          setEnableEdit(false)
            console.log(res, 'resss')
            getFavList()
           
          })
          .catch(error => {
              showError(ApiError(error))
              console.log(error)
              setLoading(false)
            })
        }
  }



  const renderFav = (item, i) => {
    console.log(item, 'whuitem')
    return (
      <TouchableOpacity onPress={() => {
        onUserCardPress(item)
      }}>

        <FastImage
          source={{ uri: item?.profile_image, priority: FastImage.priority.high }}
          style={{ width: width / 2, height: height / 3.98 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                const isShow = isNotesShow.value
                setNotesShow(isShow ? { value: false, index: '' } : { value: true, index: i })
              }}>
              <Image
                source={imagesPath.ic_i}
                style={{
                  marginLeft: 'auto',
                  height: 24,
                  width: 24,
                  marginRight: moderateScale(10),
                  marginTop: moderateScaleVertical(8)
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('', 'Do you want to remove this user from Faves', [
                  { text: 'Yes', onPress: () => onPressFav(item) },
                  { text: 'No', onPress: () => null, style: 'destructive' }
                ])
              }>
              <Image
                source={imagesPath.redheart}
                style={{
                  marginLeft: 'auto',
                  marginRight: moderateScale(10),
                  marginTop: moderateScaleVertical(10)
                }}
              />
            </TouchableOpacity>
          </View>
          {
            isNotesShow.value && isNotesShow.index === i
              ? <View style={{
                borderRadius: 8,
                backgroundColor: theme.colors.white,
                marginTop: moderateScale(2),
                marginHorizontal: moderateScale(16),
                padding: moderateScale(4),
                justifyContent: 'space-between',
                flexDirection: 'row'
              }}>
                <View style={{ width: "80%", }}>

                  <Text >
                    {item?.favourite_note}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {
                  setEnableEdit(true)
                  setNotesShow({ value: false, index: '' })
                  setUserItem(item)
                  setFavouriteUpdateValue(item?.favourite_note)
                }} style={{ width: "20%" }}>

                  <Text style={{ color: theme.colors.red }}>Edit</Text>
                </TouchableOpacity>
              </View>
              : null
          }
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              marginBottom: moderateScaleVertical(18),
              marginLeft: moderateScale(10)
            }}>
            <Text
              style={{
                color: theme.colors.white,
                fontFamily: fontFamily.bold,
                fontSize: textScale(16)
              }}>
              {item?.first_name}
              {','}
            </Text>
            <Text
              style={{
                color: theme.colors.white,
                fontFamily: fontFamily.bold,
                fontSize: textScale(16)
              }}>
              {item?.age}
            </Text>
          </View>
        </FastImage>
      </TouchableOpacity>
    )
  }
  return (
    <WrapperContainer mainViewStyle={{ paddingHorizontal: moderateScale(0) }}>
      {/* <ListEmptyComponent
        icon={imagesPath.out_of_swipes}
        firstMessage={'Empty List'}
        secondMessage={'No user is added to fav yet'}
      /> */}
      <SafeAreaView
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: moderateScale(24),
          // marginTop: moderateScaleVertical(18)
        }}>
        <Text
          style={{
            marginRight: moderateScale(8),
            fontSize: textScale(26),
            color: theme.colors.black,
            fontFamily: fontFamily.bold
          }}>
          Faves
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(navigationString.BLOCKED_USERS)}
          style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: textScale(14),
              color: theme.colors.blackOpacity60
            }}>
            Blocked People
          </Text>
          <Image
            source={imagesPath.blocked}
            style={{ marginLeft: moderateScale(10) }}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {isRefresh
        ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator style={{ bottom: 20 }} color={theme.colors.themecolor2} />
          </View>
        )
        : (
          <View>
            {favsList.length > 0
              ? (
                <Text
                  style={{
                    paddingHorizontal: moderateScale(24),
                    fontSize: textScale(16),
                    color: theme.colors.blackOpacity60,
                    fontFamily: fontFamily.medium,
                    marginTop: moderateScaleVertical(12),
                    marginBottom: moderateScaleVertical(16)
                  }}>
                  This is a list of your favorite people.
                </Text>
              )
              : null}
            <FlatList
              numColumns={2}
              showsVerticalScrollIndicator={false}
              data={favsList}
              ListFooterComponent={() => (
                <View style={{ height: moderateScaleVertical(220) }} />
              )}
              renderItem={({ item, index }) => renderFav(item, index)}
              ListEmptyComponent={() => (
                <ListEmptyComponent firstMessage="No Faves" />
              )}
            />
          </View>
        )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={enableEdit}
      onBackdropPress={()=>{setEnableEdit(false)}}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={{fontSize:moderateScale(15), color: theme.colors.black, width: "90%",maxHeight:"70%", borderWidth: 1, borderRadius: 8, padding: moderateScale(10) }}
              multiline={true}
              value={favouriteUpdateValue}
              maxLength={150}
              placeholder='Enter Favourite Notes'
              placeholderTextColor={theme.colors.Grey32}
              onChangeText={(txt) => {
                setFavouriteUpdateValue(txt)
              }}
            />
            <View style={{ flexDirection: 'row', marginTop: moderateScale(10) }}>
              <ButtonComp
                btnText={'Update'}
                btnStyle={{ width: "40%", marginHorizontal: moderateScale(5) }}
                onPressBtn={() => {
                  updateFavouriteText(favouriteUpdateValue, userItem)
                }} />
              <ButtonComp
                btnText={'Cancel'}
                btnStyle={{ width: "40%", marginHorizontal: moderateScale(5) }}
                onPressBtn={() => {
                  setEnableEdit(false)
                }} />
            </View>
          </View>
        </View>
      </Modal>
    </WrapperContainer>
  )
}



const getStyles = (theme) => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalView: {
    width: "80%",
    backgroundColor: theme.colors.backgroundGrey,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  }

});

export default Fav