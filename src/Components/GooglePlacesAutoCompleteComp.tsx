
import React, { FC } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../styles/colors'
import { getCommonStyles, hitSlopProp } from '../styles/commonStyles'
import { moderateScale } from '../styles/responsiveSize'
import { GOOGLE_MAPS_KEY } from '../constants/googleMapCredentials'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useTheme } from '../theme/ThemeProvider'

interface GooglePlacesAutoCompleteCompProps {
    placeholder: string,
    textInputProps: object,
    onPressDetails: (x: object, y: any) => {},
    textInputStyle: object,
    containerStyle: object,
    mainContainerStyle: object,
    googlePlacesRef: any,
    editable: boolean,
    value: string,
    onChangeText: (val: string) => void
}

const GooglePlacesAutoCompleteComp: FC<GooglePlacesAutoCompleteCompProps> = ({
    placeholder = "Enter Location",
    textInputProps,
    onPressDetails = () => { },
    textInputStyle,
    containerStyle,
    mainContainerStyle,
    googlePlacesRef,
    editable = true,
    value,
    onChangeText = () => { }
}) => {
    const {theme} = useTheme();
    const commonStyles = getCommonStyles(theme);
    const styles = getStyles(theme, commonStyles)
    return (
        <View style={{ height: moderateScale(46), width: '80%', ...mainContainerStyle }}>
            <GooglePlacesAutocomplete
                placeholder={placeholder}
                textInputProps={{
                    editable: editable,
                    placeholderTextcolor: theme.colors.darkBlackOpacity70,
                    returnKeyType: 'search',
                    selectionColor: theme.colors.caribbean,
                    value: value,
                    onChangeText: (val) => onChangeText(val),
                    ...textInputProps
                }}
                ref={googlePlacesRef}
                onPress={(data, details) => {
                    onPressDetails(data, details)
                }}
                styles={{
                    textInput: {
                        ...commonStyles.font_14_SemiBold,
                        color: theme.colors.themecolor2,
                        marginStart: moderateScale(8),
                        width: '88%',
                      },
                    container: {
                        position: 'absolute',
                        width: '100%',
                        ...containerStyle
                    },
                    description: { color: theme.colors.black }
                }}
                query={{
                    key: GOOGLE_MAPS_KEY,
                    language: 'en'
                }}
            />
        </View>
    )
}

// define your styles
const getStyles = (theme: any, commonStyles:any) => StyleSheet.create({
    btnStyle: {
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        width: '100%',
        backgroundColor: theme.colors.themecolor2,
        height: moderateScale(58)
    },
    textView: {
        ...commonStyles.font_16_SemiBold,
        color: theme.colors.black
    }
})

// make this component available to the app
export default React.memo(GooglePlacesAutoCompleteComp)
