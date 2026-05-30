import React, { FC } from 'react';
import { Text, View, StyleSheet, ImageBackground, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import imagesPath from '../constants/imagesPath';
import colors from '../styles/colors';
import { hitSlopProp } from '../styles/commonStyles';
import { height, moderateScale, width } from '../styles/responsiveSize';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';

interface BannerCompProps {
    bannerModal: {
        data: {
            banner_image: string
            banner_thumb: string
            title: string
        }
        bannerImgLoad: boolean
    }
    onLoadEnd: () => void
    openBanner: () => void
    closeBanner: () => void
}

const BannerComp: FC<BannerCompProps> = ({
    bannerModal,
    onLoadEnd,
    openBanner,
    closeBanner
}) => {
    const {theme} = useTheme();
    const commonStyles = getCommonStyles(theme);
    const styles= getStyles(theme);
    return (
        <ImageBackground
            style={styles.container}
            onLoadEnd={onLoadEnd}
            resizeMode={'stretch'}
            source={{ uri: bannerModal?.data?.banner_thumb || bannerModal?.data?.banner_image }}>
            {!bannerModal?.bannerImgLoad
                ? (
                    <TouchableOpacity
                        style={styles.bannerView}
                        onPress={openBanner}
                        activeOpacity={0.9}>
                        <TouchableOpacity
                            onPress={closeBanner}
                            hitSlop={hitSlopProp}>
                            <Image
                                source={imagesPath.ic_cross}
                                style={styles.cross}
                            />
                        </TouchableOpacity>

                        <Text style={commonStyles.font_20_SemiBold}>
                            {bannerModal?.data?.title}
                        </Text>
                    </TouchableOpacity>
                )
                : (
                    <ActivityIndicator
                        animating={bannerModal?.bannerImgLoad}
                        size={'large'}
                        color={colors.likePink}
                        style={{ marginTop: height / 1.6 / 2 }}
                    />
                )}
        </ImageBackground>
    );
};

export default React.memo(BannerComp);

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        height: height / 1.6,
        width: width / 1.3,
        backgroundColor: theme.colors.darkBlack,
        alignSelf: 'center',
        borderRadius: moderateScale(12)
    },
    bannerView: {
        backgroundColor: colors.blackOpacity15,
        height: height / 1.6,
        width: width / 1.3,
        paddingStart: moderateScale(24)
    },
    cross: {
        tintcolor: colors.darkBlack,
        transform: [{ rotate: '180deg' }],
        margin: moderateScale(16),
        alignSelf: 'flex-end'
    }
});
