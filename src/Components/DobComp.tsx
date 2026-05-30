import moment from 'moment';
import React, {FC, useState} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import imagesPath from '../constants/imagesPath';
import {Calendar} from 'react-native-calendars';
import strings from '../constants/Languages';
import colors from '../styles/colors';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
  width,
} from '../styles/responsiveSize';
import ButtonComp from './ButtonComp';
import fontFamily from '../styles/fontFamily';
import FastImage from '../utils/FastImageCompat';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

interface DobCompInterface {
  value: any;
  onSelect: any;
  label: string;
  textStyle?: any;
  onPressDob?: any;
  isBack?: boolean;
  minimumAge?: number;
  maximumAge?: number;
  placeholder?: string;
}

const DobComp: FC<DobCompInterface> = ({
  value = '',
  onSelect,
  label,
  textStyle,
  onPressDob,
  isBack,
  minimumAge = 18,
  maximumAge = 100,
  placeholder,
}) => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  const [calanderModal, setCalanderModal] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(value || '');
  const [showYear, setShowYear] = useState(false);

  const currentDate = new Date();
  const maxDate = new Date(
    currentDate.getFullYear() - minimumAge,
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  const onSelectDate = () => {
    setCalanderModal(true);
  };

  const preSelectedDate = moment()
    .subtract(minimumAge, 'years')
    .format('YYYY-MM-DD');
  const [defaultDate, setDefaultDate] = useState(preSelectedDate);
  const [currentVisibleHeaderYear, setCurrentVisibleHeaderYear] = useState(moment(preSelectedDate).year());

  function generateYearRangeForMinimumAgeAndMaximumDate() {
    const currentDate = moment();
    const minimumDate = currentDate.clone().subtract(maximumAge, 'years');
    const maximumDate = currentDate.clone().subtract(minimumAge, 'years');

    const startYear = minimumDate.year();
    const endYear = maximumDate.year();

    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  }

  // Example usage:
  const yearsForMinimumAgeAndMaximumDate =
    generateYearRangeForMinimumAgeAndMaximumDate();

  const ITEM_HEIGHT = moderateScale(60);

  const onSelectYear = (val: number) => {
    console.log('FUFY', val);

    const date = moment(`${val}-01-01`);
    setDefaultDate(moment(date).format('YYYY-MM-DD'));
    setShowYear(false);
  };

  const showAlert = () => {
    Alert.alert('Click on the year');
  };
  return (
    <View
      style={{
        ...styles.birthdayView,
        backgroundColor: theme.colors.white,
      }}>
      <Text
        style={{
          ...styles.textStyle,
          ...textStyle,
          top: isBack ? moderateScale(-12) : moderateScale(-16),
        }}>
        {label}
      </Text>

      <TouchableOpacity
        onPress={() => (onPressDob ? onSelectDate() : setCalanderModal(true))}
        style={styles.viewStyle}
        activeOpacity={0.9}>
        <Image
          style={{
            height: moderateScale(20),
            width: moderateScale(20),
            resizeMode: 'contain',
          }}
          source={imagesPath.ic_calender}
        />
        <Text
          style={[
            styles.value,
            !dateOfBirth && {
              fontSize: moderateScale(14),
              fontWeight: '500',
              color: '#696969',
            },
          ]}>
          {dateOfBirth
            ? moment(dateOfBirth).format('DD MMM YYYY')
            : placeholder || strings.enterAge}
        </Text>
      </TouchableOpacity>

      <Modal
        onBackdropPress={() => setCalanderModal(false)}
        isVisible={calanderModal}
        style={{margin: 0, justifyContent: 'flex-end',}}>
        <View
          style={{
            borderTopRightRadius: moderateScale(30),
            borderTopLeftRadius: moderateScale(30),
            backgroundColor: theme.colors.white,
          }}>
          <Text
            style={{
              ...commonStyles.font_14_medium,
              alignSelf: 'center',
              marginTop: moderateScaleVertical(30),
              top: 12,
              zIndex: 2,
            }}>
            Birthday
          </Text>
          <Calendar
            style={{marginHorizontal: moderateScale(40)}}
            current={defaultDate}
            key={defaultDate}
            horizontal={true}
            pagingEnabled={true}
            calendarWidth={width / 6}
            calendarHeight={height / 2.6}
            renderHeader={props => {
              console.log('my props', props);
              const date = new Date(props.toISOString());
              return (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentVisibleHeaderYear(moment(date).year());
                      setShowYear(true);
                    }}>
                    <Text
                      style={{
                        fontSize: textScale(28),
                        fontFamily: fontFamily.bold,
                        color: theme.colors.black,
                      }}>
                      {moment(date).add(1, 'day').format('MMM YYYY')}
                      {/* {props.toDateString()} */}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={showAlert}>
                    <FastImage
                      style={{
                        width: 20,
                        height: 20,
                        marginLeft: moderateScale(8),
                      }}
                      source={imagesPath.info}
                    />
                  </TouchableOpacity>
                </View>
              );
            }}
            markingType={'custom'}
            onDayPress={day => {
              const selectedDate = moment(day.dateString);
              const formattedDate = selectedDate
                .subtract(0, 'month')
                .format('YYYY-MM-DD');
              console.log('selected day', formattedDate);
              setDateOfBirth(formattedDate);
              onSelect(formattedDate);
            }}
            onMonthChange={month => console.log(month, 'month changed')}
            maxDate={maxDate.toDateString()}
            markedDates={{
              [dateOfBirth]: {
                selected: true,
                selectedColor: theme.colors.themecolor2,
                selectedTextColor: theme.colors.likePink,
              },
            }}
            theme={{
              arrowColor: theme.colors.black,
              textMonthFontSize: textScale(24),
              textDayFontSize: textScale(16),
              calendarBackground: theme.colors.white,
              dayTextColor: theme.colors.black,
              textDayFontFamily: fontFamily.medium,
              monthTextColor: theme.colors.black,
              textMonthFontFamily: fontFamily.bold,
              todayBackgroundColor: theme.colors.white,
              todayTextColor: theme.colors.black,
            }}
          />

          <ButtonComp
            btnText="Save"
            onPressBtn={() => setCalanderModal(false)}
            btnStyle={{
              marginHorizontal: moderateScale(40),
              marginTop: moderateScaleVertical(30),
              marginBottom: moderateScaleVertical(20),
            }}
          />
        </View>
        <Modal
          onBackdropPress={() => setShowYear(false)}
          isVisible={showYear}
          style={{}}>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: moderateScale(20),
              marginHorizontal: moderateScale(30),
            }}>
            <TouchableOpacity
              style={{
                marginLeft: moderateScale(20),
                top: moderateScaleVertical(26),
                position: 'absolute',
                zIndex: 1,
              }}
              onPress={() => {
                setShowYear(false);
              }}>
              <Image source={imagesPath.crossnew} style={{tintColor: theme.colors.black}} />
            </TouchableOpacity>

            <FlatList
              style={{
                maxHeight: height / 2.4,
              }}
              showsVerticalScrollIndicator={false}
              data={yearsForMinimumAgeAndMaximumDate}
              keyExtractor={(item) => String(item)}
              getItemLayout={(data, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              initialScrollIndex={Math.max(
                0,
                yearsForMinimumAgeAndMaximumDate.indexOf(currentVisibleHeaderYear) - 2
              )}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelectYear(item);
                    }}
                    style={{
                      height: ITEM_HEIGHT,
                      justifyContent: 'center',
                      alignSelf: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: textScale(22),
                        color: theme.colors.black,
                        fontFamily: fontFamily.SemiBold,
                      }}>
                      {item}
                    </Text>
                    <View
                      style={{
                        height: 1,
                        backgroundColor: theme.colors.grey,
                        marginTop: moderateScaleVertical(2),
                      }}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Modal>
      </Modal>
    </View>
  );
};

const getStyles = (theme: any, commonStyles:any) => StyleSheet.create({
  birthdayView: {
    borderColor: theme.colors.inputGray,
    padding: moderateScale(0),
    borderWidth: moderateScale(1),
    height: moderateScale(58),
    borderRadius: moderateScale(12),
    marginTop: moderateScale(10),
    justifyContent: 'center',
    backgroundColor: theme.colors.dobPlaceHolder,
  },
  viewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: moderateScale(20),
  },
  value: {
    ...commonStyles.font_16_bold,
    marginStart: moderateScale(18),
    color: theme.colors.black,
  },
  textStyle: {
    ...commonStyles.font_14_medium,
    position: 'absolute',

    left: moderateScale(24),
    paddingBottom: moderateScale(6),
    color: theme.colors.blackOpacity40,
    backgroundColor: theme.colors.white,
  },
});

export default React.memo(DobComp);
