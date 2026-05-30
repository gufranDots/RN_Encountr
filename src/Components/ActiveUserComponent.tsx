import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import FastImage from '../utils/FastImageCompat';
import LinearGradient from "react-native-linear-gradient";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { moderateScale, textScale } from "../styles/responsiveSize";
import colors from "../styles/colors";
import imagesPath from "../constants/imagesPath";
import { TouchableOpacity } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { getCommonStyles } from "../styles/commonStyles";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const ActiveUserComponent = (props: { item: any; index: any; onPress: any }) => {
    const { item, onPress } = props;
    const { theme } = useTheme();
     const styles = activeStyles(theme);
    const commonStyles = getCommonStyles(theme);
    const [loading, setLoading] = useState(true);

    return (
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                <View style={styles.profileContainer}>
                    {/* Profile Image */}




                    <FastImage
                        source={item?.profile_image ? { uri: item?.profile_image } : imagesPath.profileimage}
                        style={styles.userImg}
                        onLoad={() => setLoading(true)}
                        onLoadStart={() => { setLoading(true) }}
                        onLoadEnd={() => { setLoading(false) }}
                    />
                    {/* Online Indicator */}
                    <Image
                        source={imagesPath.dotIcon}
                        style={[styles.onlineIndicator, {
                            ...commonStyles.iconStyle10,
                            tintColor: item?.online_status ? colors.greenTheme : colors.grey
                        }]}
                    />
                    {/* Shimmer Effect While Loading */}
                </View>
                {loading &&(<ShimmerPlaceholder style={styles.userImg} />
            )}

            </TouchableOpacity>

            {/* User Name */}
            <Text style={styles.userNameTxt}>{item?.first_name?.split(" ")[0]}</Text>
        </View>
    );
};

export default ActiveUserComponent;

const activeStyles = (theme: any) => {
    const commonStyles = getCommonStyles(theme);
    return (
        StyleSheet.create({
            container: {
                alignItems: "center",
                marginHorizontal: moderateScale(5),
            },
            profileContainer: {
                position: "relative",
            },
            userImg: {
                width: moderateScale(50),
                height: moderateScale(50),
                borderRadius: moderateScale(25),
            },
            onlineIndicator: {
                position: "absolute",
                bottom: 2,
                right: 2,
            },
            userNameTxt: {
                ...commonStyles.font_12_SemiBold,
                color: colors.black,
                marginTop: 5,
                textAlign: "center",
            },
        })
    );
}
