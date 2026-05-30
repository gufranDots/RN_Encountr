import React, { FC } from 'react';
import { Image, Text, View } from 'react-native';
import imagesPath from '../constants/imagesPath';
import colors from '../styles/colors';
import { height, moderateScale } from '../styles/responsiveSize';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

interface ListEmptyComponentProps {
    icon: any
    firstMessage?: string
    secondMessage?: string
}

const ListEmptyComponent: FC<ListEmptyComponentProps> = ({
    icon,
    firstMessage,
    secondMessage
}) => {
    const {theme} = useTheme();
    const commonStyles = getCommonStyles(theme);
    return (
        <View style={{
            height: height / 1.7,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: moderateScale(30),
            
        }}>
            <Image source={icon} style={{height:moderateScale(70),width:moderateScale(80)}} />
            <Text style={{
                ...commonStyles.font_18_bold,
                color: theme.colors.black,
                textAlign: "center",
                marginTop: moderateScale(12)
            }}>{firstMessage}</Text>
            <Text
                style={{
                    ...commonStyles.font_14_medium,
                    color: theme.colors.black,
                    textAlign: "center",
                    marginTop: moderateScale(16),
                    opacity: 0.6
                }}
            >{secondMessage}</Text>
        </View>
    )
}

export default React.memo(ListEmptyComponent);
