import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import colors from '../../styles/colors'
import {
  height,
  moderateScale,
  scale,
  verticalScale
} from '../../styles/responsiveSize'
import imagesPath from '../../constants/imagesPath'
import { getCommonStyles, hitSlopProp } from '../../styles/commonStyles'
import strings from '../../constants/Languages'
import { Loader } from '../../Components/Loader'
import { useIsFocused } from '@react-navigation/native'
import { ImageEnum } from '../../constants'
import ListEmptyComponent from '../../Components/ListEmptyComponent'
import { getStyles as getHomeStyles } from './styles'
import GradientText from '../../Components/GradientText'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ButtonComp from '../../Components/ButtonComp'
import BonkerBonksFilter, {
  SetLocationFilter
} from '../../Components/BonkerBonksFilter'
import { useSelector } from 'react-redux'
import { MAX_AGE, MIN_AGE } from '../../utils/staticData'
import { color } from 'react-native-reanimated'
import { useTheme } from '../../theme/ThemeProvider'
import { stableKeyExtractor } from '../../utils/stableKeyExtractor'

const EncountrHome = ({ navigation }) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme)
  const styles = getHomeStyles(theme, commonStyles)
  const enCounterHomestyles = getStyles(theme, commonStyles)
  const [isLoading, setLoading] = useState(true)
  const userData = useSelector(state => state?.authReducers?.userData || {})
  const homeData = useSelector(state => state?.authReducers?.homeData || {})
  const [isPreferancesModalVisible, setIsPreferancesModalVisible] =
    useState(false)
  const [age, setAge] = useState([
    userData?.filters?.from_age || MIN_AGE,
    userData?.filters?.to_age || MAX_AGE
  ])
  const [selectedIndex, setSelectedIndex] = useState(null)
  const isFocused = useIsFocused()

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }, [isFocused])
  const data = [
    {
      name: 'Abram',
      profileImg:
        'https://images.pexels.com/photos/3348748/pexels-photo-3348748.jpeg',
      status: true
    },
    {
      name: 'Angel',
      profileImg:
        'https://images.pexels.com/photos/3812944/pexels-photo-3812944.jpeg',
      status: true
    },
    {
      name: 'Alfredo',
      profileImg:
        'https://images.pexels.com/photos/2100063/pexels-photo-2100063.jpeg',
      status: false
    },
    {
      name: 'Talan',
      profileImg:
        'https://images.pexels.com/photos/3228213/pexels-photo-3228213.jpeg',
      status: true
    },
    {
      name: 'Chance',
      profileImg:
        'https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg',
      status: false
    },
    {
      name: 'Justin',
      profileImg:
        'https://images.pexels.com/photos/4725133/pexels-photo-4725133.jpeg',
      status: true
    },
    {
      name: 'Cristofer',
      profileImg:
        'https://images.pexels.com/photos/2100063/pexels-photo-2100063.jpeg',
      status: true
    },
    {
      name: 'Phillip',
      profileImg:
        'https://images.pexels.com/photos/3348748/pexels-photo-3348748.jpeg',
      status: true
    },
    {
      name: 'Craig',
      profileImg:
        'https://images.pexels.com/photos/3812944/pexels-photo-3812944.jpeg',
      status: true
    }
  ]
  const categorylistData = [
    {
      name: 'Online Now',
      index: 0
    },
    {
      name: 'Age',
      index: 1
    },
    {
      name: 'Preferences',
      index: 2
    },
    {
      name: 'Fresh',
      index: 3
    },
    {
      name: 'Tags',
      index: 4
    }
  ]
  const handleCategoryPress = index => {
    setSelectedIndex(index)
  }
  const _indexOneView = () => {
    return (
      <SetLocationFilter
        selectAddressFromChild={address => {
          setSelectedAddress(address), saveAddressFilter(address)
        }}
        setCoordinatesFromChild={coords => {
          setCoordinates(coords), saveLiveLocationCoords(coords)
        }}
      />
    )
  }

  const indexTwoView = () => {
    return (
      <View>
        <BonkerBonksFilter
          age={age}
          // setAge={val => setAge(val)}
          // maxHeight={ma}
          // maxDistance={maxDistance}
          // setMaxDistance={val => setMaxDistance(val)}
          // setMaxHeight={val => setMaxHeight(val)}
          // education={education}
          // setEducation={val => setEducation(val)}
          // bodyTypeValue={bodyTypeValue}
          // setBodyTypeValue={val => setBodyTypeValue(val)}
          // lookingFor={lookingFor}
          // setLookingFor={val => setLookingFor(val)}
          // martitalStatusArr={maritalStatus}
          // maritalStatus={maritalStatusValue}
          // setMaritalStatus={val => setMaritalStatusValue(val)}
          // isChildren={isChildrenValue}
          // setIsChildren={val => setIsChildrenValue(val)}
        />
      </View>
    )
  }

  const _onSetFilter = () => {
    setIsPreferancesModalVisible(false)
    // setLoading(true)

    // const apiData = new FormData()
    // apiData.append('interested_in', preferredGenderValue?.id || 4)
    // apiData.append('looking_for', lookingFor?.name || LOOKING_FOR[0])
    // apiData.append('body_type', bodyTypeValue?.name || BODY_TYPE[0])
    // apiData.append('distance', maxDistance.toString() || '1000')
    // apiData.append('from_age', age[0]?.toString() || '18')
    // apiData.append('to_age', age[1]?.toString() || '99')
    // apiData.append('is_location', userData?.filters?.is_location || '1')
    // apiData.append('maximum_height', maxHeight || '7')
    // apiData.append('ink', ink?.name || INK[0])
    // apiData.append('education', education?.name || EDUCATION[0])
    // apiData.append('occupation', occupation?.name || OCCUPATION[0])
    // apiData.append('children', children?.name || CHILDREN[0])
    // apiData.append('pets', Number(pets) || 1)
    // apiData.append('religion', 'any')
    // apiData.append('is_smoker', Number(isSmoker) || 1)
    // apiData.append('sexuality', 1)
    // apiData.append('piercing', piercingValue ? 1 : 2 || 1)
    // apiData.append('foodie', foodie ? 1 : 2 || 1)
    // apiData.append('drinking', drinking?.id || DRINKING[0]?.id)
    // apiData.append('fitness', fitness?.id || FITNESS[0]?.id)
    // apiData.append('lifestyle', lifestyle?.id || LIFE_STYLE[0]?.id)
    // apiData.append('driving_license', drivingLicense ? 1 : 2 || 1)
    // apiData.append('personality', personality?.id || '1')
    // apiData.append(
    //   'lat',
    //   coordinates?.lat || coordinates?.latitude || userData?.latitude || null
    // )
    // apiData.append(
    //   'long',
    //   coordinates?.lng || coordinates?.longitude || userData?.longitude || null
    // )
    // apiData.append('preference', preferences?.name)
    // apiData.append('location', selectedAddress)
    // apiData.append(
    //   'languages',
    //   languages.map(ite => ite?.id)
    // )
    // apiData.append(
    //   'hobbies',
    //   hobies.map(ite => ite?.id)
    // )
    // apiData.append(
    //   'favourite_place',
    //   favPlaces.map(ite => ite?.id)
    // )
    // apiData.append(
    //   'interests',
    //   interests.map(ite => ite?.id)
    // )
    // apiData.append(
    //   'cuisin',
    //   cuisin.map(ite => ite?.id)
    // )
    // apiData.append(
    //   'married_status',
    //   maritalStatusValue?.id || maritalStatusValue
    // )
    // apiData.append('having_kids', isChildrenValue?.name || isChildrenValue)

    // console.log('hsdhfjsdhfjkshdfjsdhfjsdhjsdf', apiData)

    // setBonkersFiltersApi(apiData)
    //   .then(res => {
    //     _getAllUsers()
    //     // showSuccess(res?.message || 'Success');
    //     _setFilterValues()
    //   })
    //   .catch(error => {
    //     showError(ApiError(error))
    //     console.log(error)
    //     setLoading(false)
    //   })
  }
  console.log(userData?.subscription?.subscription_id, 'Hi datdsa')
  const renderProfileListItem = ({ item, index }) => {
    return (
      <ImageBackground
        source={{ uri: item?.profileImg }}
        style={enCounterHomestyles.userImgStyle}>
        <View style={enCounterHomestyles.userDetailContainer}>
          <View style={enCounterHomestyles.rowCenterView}>
            <Image
              source={imagesPath.dotIcon}
              style={{ tintColor: item?.status ? null : theme.colors.red }}
            />
            <Text style={enCounterHomestyles.userNameTxtStyle}>
              {item?.name}
            </Text>
          </View>
        </View>
      </ImageBackground>
    )
  }
  const renderEmptyList = () => {
    return (
      <ListEmptyComponent
        icon={imagesPath.out_of_swipes}
        firstMessage={strings.noMatchFound}
        secondMessage={strings.considerChangeFilter}
      />
    )
  }
  const renderListHeader = () => {
    return (
      <View
        style={{
          ...enCounterHomestyles.rowCenterView,
          ...enCounterHomestyles.headerContainer
        }}>
        <View>
          <Text style={enCounterHomestyles.txtStyle}>
            {strings.getSeenOutside}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.94}
          style={enCounterHomestyles.btnStyle}>
          <Text style={enCounterHomestyles.btnTxtStyle}>{strings.boomME}</Text>
        </TouchableOpacity>
      </View>
    )
  }
  return (
    <View style={enCounterHomestyles.mainContainer}>
      <ImageBackground
        source={theme == 'light' ? imagesPath.homeBgImage : imagesPath.darkHomeBgImg}
        style={enCounterHomestyles.bgImgStyle}>
        <View
          style={{
            ...enCounterHomestyles.rowCenterView,
            ...enCounterHomestyles.marginBottom20
          }}>
          <View
            style={{
              ...enCounterHomestyles.leftHalfContainer,
              ...enCounterHomestyles.rowCenterView
            }}>
            <TouchableOpacity hitSlop={hitSlopProp} activeOpacity={0.8}>
              <Image
                source={imagesPath.userRoundIcon}
                style={commonStyles.user26IconStyle}
              />
            </TouchableOpacity>
            <Text style={enCounterHomestyles.exploreTxtStyle}>
              {strings.explore}
            </Text>
          </View>

          <View
            style={{
              ...enCounterHomestyles.halfViewContainer,
              ...enCounterHomestyles.rowCenterView
            }}>
            <View style={enCounterHomestyles.rowCenterView}>
              <Image
                source={imagesPath.squareIconGroup}
                style={commonStyles.iconStyle24}
              />
              <Text style={enCounterHomestyles.viewedTxtStyle}>
                {strings.viewed_Me}
              </Text>
              <View
                style={{
                  ...enCounterHomestyles.rowCenterView,
                  ...enCounterHomestyles.viewedMeContainer
                }}>
                <Image
                  source={imagesPath.home_eye}
                  style={enCounterHomestyles.eyeIconStyle}
                />
                <Text style={commonStyles.font_12_medium}>{2}</Text>
              </View>
            </View>
            <TouchableOpacity hitSlop={hitSlopProp} activeOpacity={0.8}>
              <Image
                source={imagesPath.notificationIcon}
                style={commonStyles.user26IconStyle}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.95}
          style={{
            ...enCounterHomestyles.searchBarStyle,
            ...enCounterHomestyles.rowCenterView
          }}>
          <Image
            source={imagesPath.ic_serach}
            style={commonStyles.iconStyle18}
          />
          <Text style={enCounterHomestyles.searchTxtStyle}>
            {strings.search}
          </Text>
        </TouchableOpacity>
      </ImageBackground>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={enCounterHomestyles.filterContainer}>
        <Image
          source={imagesPath.homeFilter}
          style={commonStyles.iconStyle24}
        />

        {categorylistData.map(item => (
          <TouchableOpacity
            key={item.index}
            style={[
              enCounterHomestyles.categoryItem,
              selectedIndex === item.index &&
                enCounterHomestyles.selectedCategoryItem
            ]}
            onPress={() => handleCategoryPress(item.index)}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                enCounterHomestyles.categoryItemTxt,
                selectedIndex === item.index &&
                  enCounterHomestyles.selectedCategoryItemTxt
              ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
        {/* <TouchableOpacity
          hitSlop={hitSlopProp}
          onPress={() =>
            setTimeout(() => setIsPreferancesModalVisible(true), 500)
          }>
          <Image
            source={imagesPath.ic_filter}
            // style={commonStyles.iconStyle24}
          />
        </TouchableOpacity> */}
      </ScrollView>
      <FlatList
        data={data}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={commonStyles.listViewContainer}
        renderItem={renderProfileListItem}
        renderHeader
        keyExtractor={stableKeyExtractor}
        numColumns={3}
        ListHeaderComponent={renderListHeader}
        stickyHeaderIndices={[0]}
        ListEmptyComponent={renderEmptyList}
        onEndReachedThreshold={0.2}
      />
      <Modal
        visible={isPreferancesModalVisible}
        animationType="slide"
        transparent={true}
        style={styles.modalStyle}>
        <View style={{ ...styles.modalMainContainer }}>
          <View style={{ ...styles.modalContainer, height: height / 1.2 }}>
            <View style={styles.headerView}>
              <TouchableOpacity
                onPress={() => setIsPreferancesModalVisible(false)}
                hitSlop={hitSlopProp}>
                <Image
                  source={imagesPath.ic_right_icon}
                  style={{
                    tintcolor: theme.colors.black,
                    transform: [{ rotate: '180deg' }]
                  }}
                />
              </TouchableOpacity>
              <GradientText
                text={strings.filters}
                textStyle={styles.textStyle}
                start={{ x: 0, y: 1 }}
                end={{ x: 0.99, y: 1 }}
              />
              <View />
            </View>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={'handled'}
              contentContainerStyle={{ paddingBottom: moderateScale(40) }}>
              {userData?.subscription?.subscription_id === 3 && _indexOneView()}
              {indexTwoView()}
            </KeyboardAwareScrollView>
            <ButtonComp
              onPressBtn={_onSetFilter}
              btnText={strings.continue}
              btnStyle={{ marginHorizontal: moderateScale(20) }}
            />
          </View>
        </View>
      </Modal>
      <Loader isLoading={isLoading} />
    </View>
  )
}
const getStyles = (theme, commonStyles) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.white
  },
  bgImgStyle: {
    paddingTop: verticalScale(58),
    paddingBottom: verticalScale(10),
    paddingHorizontal: verticalScale(20)
  },
  marginBottom20: {
    marginBottom: verticalScale(20)
  },
  rowCenterView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  leftHalfContainer: {
    flex: 4,
    justifyContent: 'space-between'
  },
  halfViewContainer: {
    flex: 6,
    justifyContent: 'space-between'
  },
  userImgStyle: {
    flex: 0.3333,
    height: height / 5.6
  },
  userDetailContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginHorizontal: verticalScale(10),
    marginBottom: verticalScale(4)
  },
  userNameTxtStyle: {
    ...commonStyles.font_14_SemiBold,
    marginLeft: moderateScale(4),
    color: theme.colors.white
  },
  exploreTxtStyle: {
    ...commonStyles.font_14_SemiBold,
    color: colors.whiteOpacity80,
    marginRight: verticalScale(28)
  },
  viewedTxtStyle: {
    ...commonStyles.font_16_bold,
    color: theme.colors.white,
    marginLeft: verticalScale(4)
  },
  searchBarStyle: {
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(24),
    height: verticalScale(45),
    paddingHorizontal: verticalScale(16),
    marginBottom: verticalScale(10)
  },
  searchTxtStyle: {
    ...commonStyles.font_14_medium,
    color: theme.colors.placeHolderColor,
    marginLeft: verticalScale(8)
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
  btnStyle: {
    backgroundColor: colors.white,
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20)
  },
  btnTxtStyle: {
    ...commonStyles.font_12_SemiBold,
    color: theme.colors.themecolor2
  },
  txtStyle: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.white
  },
  categoryItem: {
    marginLeft: moderateScale(15)
  },
  selectedCategoryItem: {
    height:moderateScale(28),
    justifyContent:'center',
    backgroundColor: theme.colors.themecolor2,
    paddingHorizontal: moderateScale(15),
    borderRadius: moderateScale(20),
  },
  categoryItemTxt: {
    ...commonStyles.font_14_SemiBold,
    color: theme.colors.categoryGray
  },
  selectedCategoryItemTxt: {
    ...commonStyles.font_14_medium,
    color: theme.colors.white,
  },
  filterContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    paddingLeft:moderateScale(18)
  }

})

export default EncountrHome
