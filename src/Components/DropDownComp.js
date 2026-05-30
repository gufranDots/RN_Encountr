// import liraries
import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import colors from '../styles/colors';
import Modal from 'react-native-modal';
import fontFamily from '../styles/fontFamily';
import {moderateScale, textScale} from '../styles/responsiveSize';
import {useTheme } from '../theme/ThemeProvider';
import DropdownHeader from './DropdownHeader';
import { getCommonStyles } from '../styles/commonStyles';
import imagesPath from '../constants/imagesPath';
import strings from '../constants/Languages';

const DropDownComp = ({
  fetchData = () => {},
  value = '',
  dropDownData = [],
  centerText = '',
  onPressItem,
  name,
  placeholder = '',
  label = '',
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme)
  const styles= getStyles(theme, commonStyles)
  // console.log(dropDownData, 'drop down data ===>>>>>>>>>*************');
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [searchText, setSearchText] = useState('');

  // console.log(data, 'drop down data ==>>>>>>>>>>');

  useLayoutEffect(() => {
    const searchInterval = setTimeout(() => {
      if (searchText === '') {
        return;
      }
      const searchObj = {search_text: ''};
      if (searchText.trim()) {
        searchObj.search_text = searchText;
      }
      if (searchObj?.search_text) {
        setTimeout(() => {
          const filterArray = dropDownData.filter((val, i) => {
            if (
              val.name
                .toLowerCase()
                .includes(searchObj.search_text.toLocaleLowerCase())
            ) {
              return val;
            }
          });
          setData(filterArray);
        }, 0);
      } else {
        setData(dropDownData);
      }
    }, 0);
    return () => {
      if (searchInterval) {
        clearInterval(searchInterval);
      }
    };
  }, [searchText]);

  const renderItem = useCallback(
    ({item, index}) => {
      const isSelected = value == item.name;
      return (
        <TouchableOpacity
          style={{
            marginHorizontal: 16,
            paddingVertical: moderateScale(12),
            borderBottomWidth: 0.5,
            borderBottomColor: colors.blackOpacity50,
          }}
          activeOpacity={0.7}
          onPress={() => onSelectCountry(item)}>
          <Text
            style={{
              ...styles.nameStyle,
              // color: isSelected ? colors.redOpacity : colors.black,
              fontFamily: isSelected ? fontFamily.bold : fontFamily.regular,
              color: isSelected ? colors.themecolor2 : colors.darkBlack,
            }}>
            {item?.name}
          </Text>
          <View
            style={{
              backgroundcolor: colors.darkBlack,
              height: moderateScale(1),
              marginTop: moderateScale(15),
            }}
          />
        </TouchableOpacity>
      );
    },
    [data, value],
  );

  const onSelectCountry = item => {
    setData(dropDownData);
    fetchData(item);
    setTimeout(() => setShowModal(false), 600);
    setFilterData([]);
    onPressItem(item, name);
  };

  return (
    <Fragment>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.container}
        onPress={() => {
          setTimeout(() => setShowModal(true), 600);

          setData(dropDownData);
        }}>
        {label ? (
          <Text
            style={{
              ...commonStyles.font_14_medium,
              textAlignVertical: 'center',
              position: 'absolute',
              top: moderateScale(-16),
              left: moderateScale(24),
              padding: moderateScale(6),
              color: theme.colors.themecolor2,
              backgroundColor: theme.colors.white,
            }}>
            {label}
          </Text>
        ) : (
          <></>
        )}

        <Text
          style={{
            ...styles.valueStyle,
            color: value ? theme.colors.black : theme.colors.blackOpacity40,
            fontFamily: value ? fontFamily.medium : fontFamily.regular,
          }}>
          {value || placeholder}
        </Text>

        <Image
          source={imagesPath.ic_down}
          style={{tintcolor: theme.colors.black}}
        />
      </TouchableOpacity>
      <Modal
        style={{backgroundColor: theme.colors.white, margin: 0}}
        isVisible={showModal}>
        <SafeAreaView style={{flex: 1}}>
          <View style={{flex: 1}}>
            <DropdownHeader
              centerText={centerText}
              onPressRight={() => {
                setTimeout(() => setShowModal(false), 600);
                setData(dropDownData);
              }}
            />
            <TextInput
              placeholder={'Search'}
              placeholderTextColor={theme.colors.blackOpacity40}
              style={styles.textInputStyle}
              onChangeText={text => setSearchText(text)}
            />

            <FlatList
              data={data}
              extraData={data}
              renderItem={renderItem}
              ListHeaderComponent={() => <View style={{height: 20}} />}
              ListFooterComponent={() => (
                <View style={{marginBottom: moderateScale(300)}} />
              )}
              ListEmptyComponent={
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      ...commonStyles.font_12_medium,
                    }}>
                    {strings.noDataAvailable}
                  </Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </Fragment>
  );
};

// define your styles
const getStyles = (theme, commonStyles) => StyleSheet.create({
  container: {
    borderWidth: moderateScale(1),
    borderColor: theme.colors.black,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateScale(32),
    height: moderateScale(56),
  },
  valueStyle: {
    ...commonStyles.font_14_medium,
  },
  nameStyle: {
    ...commonStyles.font_14_medium,
    color: theme.colors.black,
  },
  textInputStyle: {
    ...commonStyles.font_14_medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: moderateScale(5),
    height: moderateScale(48),
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
    marginBottom: moderateScale(10),
    borderWidth: moderateScale(0.5),
    marginTop: moderateScale(10),
    marginHorizontal: moderateScale(16),
    color: theme.colors.black,
    backgroundColor: theme.colors.white,
    bordercolor: theme.colors.black,
  },
});

export default React.memo(DropDownComp);
