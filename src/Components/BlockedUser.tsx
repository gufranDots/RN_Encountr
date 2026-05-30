import * as React from 'react';
import {
    Image,
    ImageStyle,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import FastImage from '../utils/FastImageCompat';

import imagesPath from '../constants/imagesPath';
import { getCommonStyles, hitSlopProp } from '../styles/commonStyles';
import { moderateScale } from '../styles/responsiveSize';
import { useTheme } from '../theme/ThemeProvider';

interface BlockedUserProps {
    itemData: {
        to_user: {
            profile_image: string
            first_name: string
        }
    }
    unblockUser: () => void
}

const BlockedUser: React.FC<BlockedUserProps> = ({
    itemData,
    unblockUser
}) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    return (
        <View style={styles.container}>
            <View style={styles.subView}>
                <FastImage
                    source={{ uri: itemData?.to_user?.profile_image }}
                    style={styles.picImg}
                />
                <Text style={styles.name}>{itemData?.to_user?.first_name}</Text>
            </View>

            <TouchableOpacity
                hitSlop={hitSlopProp}
                onPress={unblockUser}
                activeOpacity={0.7}
            >
                <Image
                    source={imagesPath.ic_cross}
                    style={styles.crossIcon}
                />
            </TouchableOpacity>
        </View>
    );
};

export default React.memo(BlockedUser);

const getStyles = (theme: any) => {
    const commonStyles = getCommonStyles(theme);
    return (
        StyleSheet.create({
            container: {
                flexDirection: "row",
                justifyContent: "space-between",
                borderWidth: 1,
                paddingHorizontal: moderateScale(14),
                paddingVertical: moderateScale(14),
                alignItems: "center",
                marginTop: moderateScale(10),
                borderRadius: moderateScale(16)
            },
            subView: {
                flexDirection: "row",
                alignItems: "center"
            },
            picImg: {
                height: moderateScale(60),
                width: moderateScale(60),
                borderRadius: moderateScale(30)
            },
            name: {
                ...commonStyles.font_14_SemiBold,
                marginStart: moderateScale(8),
                textTransform: "capitalize",
                width: "60%"
            },
            crossIcon: {
                tintColor: theme.colors.darkBlack
            }
        })

    );
}
    

