import React, { useCallback, useState } from 'react'
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

const SelectPositionComp = ({
  mainContainerStyle,
  title,
  flatListData = [],
  setFlatListFromChild = () => {},
  setValueFromChild = () => {},
  multiSelect = false
}) => {
  const {theme, isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme);
  const [modalVisible, setModalVisible] = useState(false)

  const onPressItem = (index, item) => {
    let updatedItems;
    
    if (multiSelect) {
      const currentlySelected = flatListData.filter(val => val.isSelected).length;
      const isCurrentlySelected = item.isSelected;
      
      // If trying to select a new item and already have 3 selected, prevent selection
      if (!isCurrentlySelected && currentlySelected >= 3) {
        // Show alert or visual feedback that maximum 3 options can be selected
        return;
      }
      
      // Multi-select mode: toggle the clicked item
      updatedItems = flatListData.map((val, ind) => {
        if (ind === index) {
          return {
            ...val,
            isSelected: !val.isSelected
          }
        } else {
          return val
        }
      })
    } else {
      // Single-select mode: only one item can be selected
      updatedItems = flatListData.map((val, ind) => {
        if (ind === index && !item.isSelected) {
          return {
            ...val,
            isSelected: true
          }
        } else {
          return {
            ...val,
            isSelected: false
          }
        }
      })
    }

    setFlatListFromChild(updatedItems)

    const selectedItems = updatedItems.filter(val => val.isSelected)
    setValueFromChild(selectedItems)
  }

  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <TouchableOpacity
          style={styles.renderView}
          activeOpacity={0.9}
          hitSlop={hitSlopProp}
          onPress={() => onPressItem(index, item)}>
          <Image
            source={
                item?.img
            }
            style={{
              marginEnd: moderateScale(14),
              tintColor: item?.isSelected
                ? isDark ? theme.colors.florsentTheme  : theme.colors.themecolor2 
                : theme.colors.filterTxt
            }}
          />
          <Text numberOfLines={2}
            style={{

              ...commonStyles.font_14_medium,
              width: '96%',
              color: item?.isSelected ?  isDark ? theme.colors.florsentTheme  : theme.colors.themecolor2 : theme.colors.filterTxt,
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

  return (
    <View
      style={{ ...styles.mainContainer, ...mainContainerStyle }}
      activeOpacity={0.8}>
      <View>
        <Text
          style={{
            ...commonStyles.font_14_SemiBold,
            width: '46%',
            color: theme.colors.black
          }}>
          {title}
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
        <FlatList
            numColumns={2}
              data={flatListData}
              extraData={flatListData}
              renderItem={renderItem}
              keyExtractor={stableKeyExtractor}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
    </View>
  )
}

export default React.memo(SelectPositionComp)

const getStyles = (theme) => StyleSheet.create({
  mainContainer: {
    marginHorizontal: moderateScale(20),
    marginVertical: moderateScaleVertical(14)
  },

  btnView: { flex: 1, paddingBottom: moderateScale(40) },
  renderView: {
    marginTop: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightgreynew,
    width: width / 2.6,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(20),
    justifyContent: 'center',
    marginRight: moderateScale(16),
    borderRadius: moderateScale(6)
  }
})
