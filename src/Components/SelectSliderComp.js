import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList
} from 'react-native'
import imagesPath from '../constants/imagesPath'
import colors from '../styles/colors'
import { getCommonStyles, hitSlopProp } from '../styles/commonStyles'
import { height, moderateScale, moderateScaleVertical, verticalScale, width } from '../styles/responsiveSize'
import ButtonComp from './ButtonComp'
import Modal from 'react-native-modal'
import strings from '../constants/Languages'
import { useTheme } from '../theme/ThemeProvider'
import { stableKeyExtractor } from '../utils/stableKeyExtractor'

const SelectSliderComp = ({
  mainContainerStyle,
  title,
  value,
  bottomSheetHeader,
  flatListData = [],
  setFlatListFromChild = () => {},
  setValueFromChild = () => {},
  multiSelect = false,
  isRequired = false
}) => {
  const {theme, isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme);
  const [modalVisible, setModalVisible] = useState(false)

  useLayoutEffect(() => {
    flatListData.map(item => {
      item.isSelected = false
    })
  }, [])

  const onPressItem = index => {
    if (multiSelect) {
      const currentlySelected = flatListData.filter(val => val.isSelected).length;
      const isCurrentlySelected = flatListData[index].isSelected;
      
      // If trying to select a new item and already have 3 selected, prevent selection
      if (!isCurrentlySelected && currentlySelected >= 3) {
        // Show alert or visual feedback that maximum 3 options can be selected
        return;
      }
      
      const temp_arr = flatListData.map((val, ind) => {
        if (ind === index) {
          return {
            ...val,
            isSelected: !(val?.isSelected && val?.isSelected == true)
          }
        } else {
          return { ...val }
        }
      })
      setFlatListFromChild(temp_arr)
    } else {
      const temp_arr = flatListData.map((val, ind) => {
        if (ind === index) {
          return { ...val, isSelected: true }
        } else {
          return { ...val, isSelected: false }
        }
      })
      setFlatListFromChild(temp_arr)
    }
  }

  const onPressSave = () => {
    const filter_arr = flatListData.filter(val => {
      if (val.isSelected) {
        return val
      }
    })
    if (multiSelect) {
      setValueFromChild(filter_arr)
    } else {
      if (filter_arr.length > 0) {
        setValueFromChild(filter_arr[0])
      }
    }
    setTimeout(() => {
      setModalVisible(false)
    }, 600)
  }

  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <TouchableOpacity
          style={styles.renderView}
          activeOpacity={0.9}
          hitSlop={hitSlopProp}
          onPress={() => onPressItem(index)}>
          {/* <Image
            source={
              item?.isSelected
                ? imagesPath.ic_filled_circle
                : imagesPath.ic_unfilled_circle
            }
            style={{
              marginEnd: moderateScale(14),
              tintColor: item?.isSelected
                ? colors.themecolor2
                : colors.themecolor2,
            }}
          /> */}
          <Text numberOfLines={1}
            style={{

              ...commonStyles.font_14_SemiBold,
              width: '96%',
              color: item?.isSelected ? isDark ? theme.colors.florsentTheme : theme.colors.themecolor2 : theme.colors.filterTxt,
              textTransform: 'capitalize',
              alignSelf: 'center'
            }}>
            {item?.name}
          </Text>
        </TouchableOpacity>
      )
    },
    [flatListData]
  )

  console.log(value, 'valuevaluevaluevalue')

  return (
    <TouchableOpacity
      style={{ ...styles.mainContainer, ...mainContainerStyle }}
      activeOpacity={0.8}
      onPress={() => setModalVisible(true)}>
      <Text
        style={{
          ...commonStyles.font_14_SemiBold,
          width: '46%',
          color: theme.colors.black
        }}>
        {title}
        {isRequired ? <Text style={{ color: theme.colors.black }}></Text> : <></>}
      </Text>

      <View style={styles.valueBtnStyle}>
        <View>
          {multiSelect ? (
            value &&
            value.length > 0 &&
            value.map((val, ind) => {
              return (
                <Text
                  style={{
                    maxWidth: width / 3,
                    ...commonStyles.font_14_SemiBold,
                    color: theme.colors.grey_187_1,
                    marginTop: moderateScale(4),
                    color: theme.colors.likePink
                  }}>
                  {val?.name + `${ind != value.length - 1 ? ',' : ''}`}
                </Text>
              )
            })
          ) : (
            <Text
              style={{
                ...commonStyles.font_14_SemiBold,
                color: theme.colors.likePink
                // width: width / 3,
              }}
              numberOfLines={1}>
              {value}
            </Text>
          )}
        </View>

        <View style={{ width: '5%' }}>
          <Image
            source={imagesPath.ic_down}
            style={{
              height: moderateScaleVertical(15),
              width: moderateScale(15),
              resizeMode: 'contain',
              marginLeft: moderateScale(10),
              tintColor: theme.colors.primaryTxt
            }}
          />
        </View>
      </View>

      <Modal isVisible={modalVisible} style={styles.modalStyle}>
        <View style={styles.modalMainContainer}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setTimeout(() => setModalVisible(false), 600)}
              hitSlop={hitSlopProp}
              activeOpacity={0.8}
              style={styles.headerView}>
              <View style={styles.headerTextView}>
                <Text
                  style={{
                    ...commonStyles.font_14_bold,
                    color: theme.colors.black

                  }}>
                  {bottomSheetHeader}
                </Text>
                {multiSelect && (
                  <Text
                    style={{
                      ...commonStyles.font_12_medium,
                      color: theme.colors.grey_187_1,
                      marginTop: moderateScale(2)
                    }}>
                    {flatListData.filter(val => val.isSelected).length}/3 selected
                  </Text>
                )}
              </View>
              <View>
                <Image
                  source={imagesPath.ic_right_icon}
                  style={{
                    tintColor: theme.colors.black,
                    transform: [{ rotate: '270deg' }]
                  }}
                />
              </View>
            </TouchableOpacity>

            <FlatList
            numColumns={2}
              data={flatListData}
              extraData={flatListData}
              renderItem={renderItem}
              keyExtractor={stableKeyExtractor}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: moderateScale(40) }}
              bounces={false}
            />
            <View style={styles.btnView}>
              <ButtonComp
                btnText={strings.save}
                txtStyle={{ color: theme.colors.primaryTxt }}
                onPressBtn={onPressSave}
              btnView={{ borderRadius: moderateScale(30) }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  )
}

export default React.memo(SelectSliderComp)

const getStyles = (theme) => StyleSheet.create({
  mainContainer: {
    marginTop: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: moderateScale(20)
  },
  modalContainer: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    backgroundColor: theme.colors.white,
    paddingHorizontal: moderateScale(30),
    paddingTop: moderateScale(32),
    paddingBottom: moderateScale(40),
    maxHeight: height / 1.2
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(10),
    justifyContent: 'space-between'
    // backgroundColor: colors.darkBlack
  },
  headerTextView: {
    // flex: 1,
    alignItems: 'center'
  },
  modalStyle: {
    margin: 0
  },
  valueBtnStyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalMainContainer: { flex: 1, justifyContent: 'flex-end' },
  btnView: { flex: 1, paddingBottom: moderateScale(40) },
  renderView: {
    marginTop: moderateScale(16),
    // flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightgreynew,
    width: width / 2.6,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    justifyContent: 'center',
    marginRight: moderateScale(16),
    borderRadius: moderateScale(6)
  }
})
