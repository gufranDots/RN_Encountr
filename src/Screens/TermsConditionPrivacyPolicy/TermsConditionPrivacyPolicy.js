import React, {useState} from 'react';
import WebView from 'react-native-webview';
import HeaderComp from '../../Components/HeaderComp';
import {Loader} from '../../Components/Loader';
import WrapperContainer from '../../Components/WrapperContainer';
import {
  Apple,
  MPOX,
  PRIVACY_POLICY,
  SEXUAL_HELTH_FAQ,
  TERMS_CONDITION,
} from '../../config/urls';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import {enableFreeze} from 'react-native-screens';
import {SafeAreaView} from 'react-native-safe-area-context';
import colors from '../../styles/colors';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {moderateScale} from '../../styles/responsiveSize';
import { useTheme } from '../../theme/ThemeProvider';
import { getCommonStyles } from '../../styles/commonStyles';

enableFreeze();
const TermsConditionPrivacyPolicy = props => {
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme);
  const {navigation, route} = props;
  const [isLoading, setLoading] = useState(true);

  const typeUrl = () => {
    switch (route?.params?.type) {
      case 1:
        return {
          name: strings.privacyPolicy,
          url: PRIVACY_POLICY,
        };
      case 2:
        return {
          name: strings.termsAndConnditions,
          url: TERMS_CONDITION,
        };
      case 3:
        return {
          name: strings.mpox,
          url: MPOX,
        };
      case 4:
        return {
          name: strings.sexual_helth_faq,
          url: SEXUAL_HELTH_FAQ,
        };
      case 5:
        return {
          name: strings.privacyPolicy,
          url: Apple,
        };
      case 6:
      default:
        return {
          name: strings.privacyPolicy,
          url: PRIVACY_POLICY,
        };
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.backgroundBlue}}>
      {/* <HeaderComp
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
        centerText= { route?.params?.type === 2
          ? strings.termsAndConnditions
          : strings.privacyPolicy}
      /> */}

      <View style={{width: '100%', flexDirection: 'row', paddingBottom: 20}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            borderColor: theme.colors.darkBlack,
            borderWidth: moderateScale(1),
            height: moderateScale(48),
            width: moderateScale(48),
            borderRadius: moderateScale(14),
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: moderateScale(15),
          }}>
          <Image
            style={{
              height: moderateScale(18),
              width: moderateScale(18),
              tintColor: theme.colors.black
            }}
            resizeMode="contain"
            source={imagesPath.ic_back}
          />
        </TouchableOpacity>
        <View style={{justifyContent: 'center', marginLeft: moderateScale(10),}}>
          <Text style={{...commonStyles.font_16_SemiBold}}>
            {typeUrl()?.name}
          </Text>
        </View>
      </View>

      <WebView
        source={{
          uri: typeUrl()?.url,
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }}
        style={{flex: 1}}
      />
      <Loader isLoading={isLoading} />
    </SafeAreaView>
  );
};

export default TermsConditionPrivacyPolicy;
