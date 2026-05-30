import React, { useEffect } from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import colors from '../styles/colors'
import { getCommonStyles, hitSlopProp } from '../styles/commonStyles'
import { moderateScale, moderateScaleVertical } from '../styles/responsiveSize'
import { ApplyEaseOutAnimation } from '../utils/helperFunctions'
import { useTheme } from '../theme/ThemeProvider'

// create a component
const TextInputComp = ({
  inputView,
  inputText,
  secureTextEntry = false,
  icon,
  value,
  onChangeText,
  onPress,
  image,
  keyboardType,
  initialText,
  rightImageStyle,
  textInputStyle,
  _anotherComp,
  placeholder,
  maxLength,
  multiline,
  autoFocus,
  onSubmitEditing,
  suggestionsData = [],
  onPressSuggestion = () => {},
  onEndEditing=()=>{}
}) => {
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  const styles = getStyles(theme, commonStyles);
  useEffect(() => {
    ApplyEaseOutAnimation()
  }, [suggestionsData.length])

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPressSuggestion(item)}
        style={{
          borderTopWidth: index === 0 ? 0 : 1,
          paddingVertical: moderateScale(10)
        }}>
        <Text style={{ ...commonStyles.font_14_regular }}>{item}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <>
      <View style={{ ...styles.inputStyle, ...inputView }}>
        {inputText ? <Text style={styles.textStyle}>{inputText}</Text> : <></>}
        <View style={{ flexDirection: 'row', flex: 1 }}>
          {initialText
            ? (
            <Text
              style={{
                ...commonStyles.font_14_medium,
                color: theme.colors.black,
                marginEnd: moderateScale(8)
              }}>
              {initialText}
            </Text>
              )
            : (
            <></>
              )}
          <TextInput
            placeholder={placeholder}
            // textInputStyle={{color:colors.white}
            placeholderTextColor={theme.colors.blackOpacity40}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            value={value}
            autoFocus={false}
            maxLength={maxLength}
            onChangeText={onChangeText}
            onEndEditing={onEndEditing}
            multiline={multiline}
            onSubmitEditing={onSubmitEditing}
            style={{ ...styles.defaultTextInputStyle, ...textInputStyle }}
          />
          <View style={{ flex: 0.1, justifyContent: 'center' }}>
            {image
              ? (
              <TouchableOpacity
                onPress={onPress}
                hitSlop={hitSlopProp}
                activeOpacity={0.8}>
                <Image
                  source={image}
                  style={{ tintColor: theme.colors.black, ...rightImageStyle }}
                />
              </TouchableOpacity>
                )
              : null}
          </View>
        </View>
        {_anotherComp || <></>}
      </View>
      {suggestionsData.length > 0 && (
        <View
          style={{
            backgroundColor: theme.colors.lightGrey,
            marginTop: -8,
            borderBottomLeftRadius: moderateScale(10),
            borderBottomRightRadius: moderateScale(10),
            borderWidth: 1,
            paddingHorizontal: 12,
            paddingVertical: 4
          }}>
          <FlatList data={suggestionsData} renderItem={renderItem} />
        </View>
      )}
    </>
  )
}

// define your styles

const getStyles = (theme, commonStyles) => StyleSheet.create({
  inputStyle: {
    borderWidth: moderateScale(1),
    width: '100%',
    // height:moderateScale(58),
    borderRadius: moderateScale(10),
    borderColor: theme.colors.inputGray,
    marginTop: moderateScale(24),
    paddingStart: moderateScale(18),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(0)
  },
  textStyle: {
    ...commonStyles.font_14_regular,
    textAlignVertical: 'center',
    position: 'absolute',
    top: moderateScale(-12),
    left: moderateScale(24),
    // padding: moderateScale(6),
    color: theme.colors.blackOpacity40,
    backgroundColor: theme.colors.white
  },
  defaultTextInputStyle: {
    ...commonStyles.font_18_medium,
    paddingVertical: moderateScaleVertical(18),
    width: '100%',
    flex: 0.9,
    color: theme.colors.black,
    textAlignVertical: 'top'
  }
})

// make this component available to the app
export default React.memo(TextInputComp)
