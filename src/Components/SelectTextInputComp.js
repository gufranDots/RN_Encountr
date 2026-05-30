import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import imagesPath from '../constants/imagesPath';
import colors from '../styles/colors';
import {getCommonStyles, hitSlopProp} from '../styles/commonStyles';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  width,
} from '../styles/responsiveSize';
import ButtonComp from './ButtonComp';
import Modal from 'react-native-modal';
import strings from '../constants/Languages';
import { useTheme } from '../theme/ThemeProvider';
import { stableKeyExtractor } from '../utils/stableKeyExtractor';

const SelectTextInputComp = ({
  mainContainerStyle,
  title,
  value,
  bottomSheetHeader,
  flatListData = [],
  setFlatListFromChild = () => {},
  setValueFromChild = () => {},
  multiSelect = false,
  isRequired = false,
}) => {
  const {theme, isDark} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme);
  const [modalVisible, setModalVisible] = useState(false);

  useLayoutEffect(() => {
    flatListData.map(item => {
      item.isSelected = false;
    });
  }, []);

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
            isSelected: !(val?.isSelected && val?.isSelected == true),
          };
        } else {
          return {...val};
        }
      });
      setFlatListFromChild(temp_arr);
    } else {
      const temp_arr = flatListData.map((val, ind) => {
        if (ind === index) {
          return {...val, isSelected: true};
        } else {
          return {...val, isSelected: false};
        }
      });
      setFlatListFromChild(temp_arr);
    }
  };

  const onPressSave = () => {
    const filter_arr = flatListData.filter(val => {
      if (val.isSelected) {
        return val;
      }
    });
    if (multiSelect) {
      setValueFromChild(filter_arr);
    } else {
      if (filter_arr.length > 0) {
        setValueFromChild(filter_arr[0]);
      }
    }
    setTimeout(() => {
      setModalVisible(false);
    }, 600);
  };

  const renderItem = useCallback(
    ({item, index}) => {
      return (
        <TouchableOpacity
          style={styles.renderView}
          activeOpacity={0.9}
          hitSlop={hitSlopProp}
          onPress={() => onPressItem(index)}>
          <Image
            source={
              item?.isSelected
                ? imagesPath.ic_filled_circle
                : imagesPath.ic_unfilled_circle
            }
            style={{
              marginEnd: moderateScale(14),
              tintColor: item?.isSelected
                ? isDark ? theme.colors.florsentTheme : theme.colors.themecolor2
                : theme.colors.blackOpacity40
            }}
          />
          <Text
            style={{
              ...commonStyles.font_14_SemiBold,
              width: '96%',
              color: item?.isSelected ?  isDark ? theme.colors.florsentTheme : theme.colors.themecolor2 : theme.colors.blackOpacity40,
              textTransform: 'capitalize',
            }}>
            {item?.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [flatListData, theme],
  );

  // console.log(value, 'valuevaluevaluevalue');

  return (
    <TouchableOpacity
      style={{
        borderWidth: moderateScale(1),
        width: '100%',
        borderRadius: moderateScale(10),
        borderColor: theme.colors.likePink,
        marginTop: moderateScale(24),
        paddingStart: moderateScale(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: moderateScale(0),
      }}
      activeOpacity={0.8}
      onPress={() =>
        setTimeout(() => {
          setModalVisible(true);
        }, 600)
      }>
      <Text
        style={{
          ...commonStyles.font_14_medium,
          textAlignVertical: 'center',
          position: 'absolute',
          top: moderateScale(-16),
          left: moderateScale(24),
          padding: moderateScale(6),
          color: theme.colors.blackOpacity40,
          backgroundColor: theme.colors.white,
        }}>
        {title}
      </Text>

      <View style={styles.valueBtnStyle}>
        <View style={{flex: 1}}>
          <Text
            style={{
              ...commonStyles.font_14_medium,
              paddingVertical: moderateScaleVertical(18),
              flex: 0.9,
              color: value ? theme.colors.black : theme.colors.blackOpacity40,
              textAlignVertical: 'top',
            }}
            numberOfLines={1}>
            {value || bottomSheetHeader}
          </Text>
        </View>

        <View style={{flex: 0.1}}>
          <Image
            source={imagesPath.ic_right_icon}
            style={{marginLeft: moderateScale(10), tintColor: theme.colors.likePink}}
          />
        </View>
      </View>

      <Modal isVisible={modalVisible} style={styles.modalStyle}>
        <View style={styles.modalMainContainer}>
          <View style={styles.modalContainer}>
            <View style={styles.headerView}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={hitSlopProp}
                activeOpacity={0.8}>
                <Image
                  source={imagesPath.ic_right_icon}
                  style={{
                    tintColor: theme.colors.black,
                    transform: [{rotate: '180deg'}],
                  }}
                />
              </TouchableOpacity>
              <View style={styles.headerTextView}>
                <Text
                  style={{
                    ...commonStyles.font_14_bold,
                    color: theme.colors.black,
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
            </View>

            <FlatList
              data={flatListData}
              extraData={flatListData}
              renderItem={renderItem}
              keyExtractor={stableKeyExtractor}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: moderateScale(40)}}
              bounces={false}
            />
            <View style={styles.btnView}>
              <ButtonComp
                btnText={strings.save}
                txtStyle={{color: theme.colors.primaryWhite}}
                onPressBtn={onPressSave}
              />
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default React.memo(SelectTextInputComp);

const getStyles = (theme) => StyleSheet.create({
  mainContainer: {
    marginTop: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: moderateScale(20),
  },
  modalContainer: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    backgroundColor: theme.colors.white,
    paddingHorizontal: moderateScale(30),
    paddingTop: moderateScale(32),
    paddingBottom: moderateScale(40),
    maxHeight: height / 1.2,
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(10),
    // backgroundColor: colors.darkBlack
  },
  headerTextView: {
    flex: 1,
    alignItems: 'center',
  },
  modalStyle: {
    margin: 0,
  },
  valueBtnStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalMainContainer: {flex: 1, justifyContent: 'flex-end'},
  btnView: {flex: 1, paddingBottom: moderateScale(40)},
  renderView: {
    marginTop: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: colors.darkBlack
  },
});
