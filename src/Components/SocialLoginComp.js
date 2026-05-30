import { StyleSheet, Text, Image, View, TouchableOpacity } from "react-native";
import React from "react";
import imagesPath from "../constants/imagesPath";
import { moderateScale, textScale, width } from "../styles/responsiveSize";
import fontFamily from "../styles/fontFamily";
import { getCommonStyles } from "../styles/commonStyles";
import { useTheme } from "../theme/ThemeProvider";

const SocialLoginComp = ({ image, textlabel, onPress }) => {
  const { theme } = useTheme();
  const commonStyles = getCommonStyles(theme);
  return (
    <TouchableOpacity
    activeOpacity={0.8}
      onPress={ onPress}
      style={{
        borderRadius: moderateScale(10),
        borderColor: theme.colors.white_234_1,
        flexDirection: "row",
        alignItems: "center",
        alignContent:'center',
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(14),
        borderWidth: moderateScale(1),
        width: width / 3,
      }}
    >
      <Image source={image} style={commonStyles.iconStyle18} />
      <Text
        style={{
          marginLeft: moderateScale(8),
          width: width / 1,
          ...commonStyles.font_12_medium
        }}
      >
        {textlabel}
      </Text>
    </TouchableOpacity>
  );
};

export default SocialLoginComp;

