import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
// import * as Zendesk from 'react-native-zendesk-messaging';

import {
  ZENDESK_ANDROID_CHANNEL_ID,
  ZENDESK_IOS_CHANNEL_ID,
} from '../../config/urls';
import GradientText from '../../Components/GradientText';
import HeaderComp from '../../Components/HeaderComp';
import TouchableBtn from '../../Components/TouchableBtn';
import WrapperContainer from '../../Components/WrapperContainer';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import colors from '../../styles/colors';
import { moderateScale } from '../../styles/responsiveSize';
import { Loader } from '../../Components/Loader';
import { enableFreeze } from 'react-native-screens';
import { showError } from '../../utils/helperFunctions';
import { forgotUsername } from '../../redux/reduxActions/authActions';
import { useTheme } from '../../theme/ThemeProvider';
import { getCommonStyles } from '../../styles/commonStyles';
// import ZendeskChat from 'react-native-zendesk-chat';

// enableFreeze()

const zendesk_accountKey = '4YpR9UJZSI6YZDl1DwWk1hPSkiwrxlkF';
const zendesk_app_id = '3429e6a2c41850217020abb5131b9ae7b44472e414178ddf';

const ForgotScreen = props => {
  const { navigation } = props;
  const {theme} = useTheme();
  const commonStyles = getCommonStyles(theme)

  const [isLoading, setLoading] = useState(false);

  // useEffect(() => {
  //   // Zendesk.getInstance().getMessaging().showMessaging();

  //   // Support.INSTANCE.init(Zendesk.INSTANCE);

  //   Zendesk.initialize({
  //     channelKey:
  //       Platform.OS === 'ios'
  //         ? ZENDESK_IOS_CHANNEL_ID
  //         : ZENDESK_ANDROID_CHANNEL_ID,
  //   })
  //     .then(res => {
  //       console.log(res, 'RESPONSE');
  //     })
  //     .catch(error => {
  //       console.log(error, 'ERRORR');
  //       // alert(error?.message);
  //     });

  // }, []);

  // const onStartSupportChat = () => {
  //   if (!zendesk_accountKey && !zendesk_app_id) {
  //     showError('Zendesk not configured');
  //     return;
  //   }
  //   ZendeskChat.setVisitorInfo({
  //     name: '',
  //     phone: '',
  //   });
  //   ZendeskChat.startChat({
  //     withChat: true,
  //     color: '#000',
  //   });
  // };

  return (
    <WrapperContainer>
      <HeaderComp
        leftIcon={imagesPath.ic_back}
        onPressBack={() => navigation.goBack()}
      />

      <View style={{ paddingTop: moderateScale(14) }}>
        <GradientText
          text={'Need help?'}
          textStyle={{
            ...commonStyles.font_24_bold,
            color: theme.colors.themecolor2,
          }}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0.4, y: 0.5 }}
        />
      </View>

      <View style={{ justifyContent: 'space-between' }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableBtn
            imagesrc={imagesPath.psh_notifications}
            text={strings.forgotPassword}
            onPressBtn={() =>
              navigation.navigate(navigationString.FORGOT_PASSWORD, {
                type: '_FORGOT_PASSWORD',
              })
            }
          />
          {/* forgot */}
          <TouchableBtn
            imagesrc={imagesPath.ic_peopleActive}
            text={'Forgot Username'}
            onPressBtn={() =>
              navigation.navigate(navigationString.FORGOT_USERNAME, {
                type: '_FORGOT_USERNAME',
              })
            }
          />
          {/* w */}
          <TouchableBtn
            imagesrc={imagesPath.contact}
            text={strings.Contactus}
            onPressBtn={() => {
              setLoading(true);
              // Zendesk.openMessagingView()
              //   .then(() => {
              //     setLoading(false);
              //   })
              //   .catch(error => {
              //     setLoading(false);
              //     // alert(error);
              //   });
            }}
          // onPressBtn={onStartSupportChat}
          />
        </ScrollView>
      </View>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

export default ForgotScreen;
