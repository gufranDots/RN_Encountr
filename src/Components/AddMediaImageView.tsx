import React, { FC, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from '../utils/FastImageCompat';
import imagesPath from '../constants/imagesPath';
import colors from '../styles/colors';
import { hitSlopProp } from '../styles/commonStyles';
import { height, moderateScale, width } from '../styles/responsiveSize';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import { useTheme } from '../theme/ThemeProvider';
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

type itemType = {
    path: string
    orig_path: string
}

interface AddMediaImageViewProps {
    size?: number
    loadImg?: false
    onPressCross: () => void
    itemData: itemType
    indexData?: number
    onPress?: () => void
}

const AddMediaImageView: FC<AddMediaImageViewProps> = ({
    size,
    onPressCross,
    itemData,
    indexData,
    onPress,
    loadImg
}) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [loading, setLoading] = useState(true)
    return (
        <View style={{}}>
            {onPressCross && (
                <TouchableOpacity
                    style={styles.crossIcon}
                    activeOpacity={0.8}
                    hitSlop={hitSlopProp}
                    onPress={onPressCross}>
                    <Image source={imagesPath.ic_Cross}
                    style={{tintColor:theme.colors.black}}
                    />
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={styles.renderView}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <FastImage
                    source={{
                        uri: itemData?.path || itemData?.orig_path
                    }}
                    onLoadStart={() => setLoading(true)}
                    onLoad={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    style={{
                        ...styles.renderImage,
                        width: size % 2 != 0 ? (size == indexData + 1 ? width - moderateScale(40) : width / 2.4) : width / 2.4
                    }}
                />

                {loading && (

                    <ShimmerPlaceholder
                        style={{
                            ...styles.renderImage,
                            position: 'absolute',
                            width: size % 2 != 0 ? (size == indexData + 1 ? width - moderateScale(40) : width / 2.4) : width / 2.4
                        }} />
                )}
            </TouchableOpacity>



        </View>
    )
}

const getStyles = (theme: any) => StyleSheet.create({
    crossIcon: {
        position: 'absolute',
        right: moderateScale(-5),
        top: moderateScale(-5),
        width: moderateScale(30),
        height: moderateScale(30),
        zIndex: 20000,
        justifyContent: 'center',
        alignItems: 'center',
        // borderBottomLeftRadius: moderateScale(50),
        // borderTopLeftRadius: moderateScale(50)
        borderRadius: moderateScale(50),

    },
    renderView: {
        flex: 1,
        borderRadius: moderateScale(5),
        backgroundColor: theme.colors.grey,
    },
    renderImage: {
        height: height / 5,
        width: width / 2.4,
        borderRadius: moderateScale(5),
        backgroundColor: theme.colors.grey
    }
})

export default React.memo(AddMediaImageView);
