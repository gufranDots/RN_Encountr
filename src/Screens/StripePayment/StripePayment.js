//import liraries
import React, {Component, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import colors from '../../styles/colors';
import {HomeHeader, WrapperContainer} from '../../Components';
import imagesPath from '../../constants/imagesPath';
import strings from '../../constants/Languages';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../styles/responsiveSize';
import {Loader} from '../../Components/Loader';
// import {CardField, StripeProvider} from '@stripe/stripe-react-native';
import ButtonComp from '../../Components/ButtonComp';

const StripePayment = ({navigation}) => {
  const [isLoading, setisLoading] = useState(false);
  const [cardInfo, setState] = useState({});
  const _onChangeStripeData = cardDetails => {
    console.log(cardDetails, 'cardDetails>>>');
    if (cardDetails?.complete) {
      setState({
        brand: cardDetails.brand,
        complete: true,
        expiryMonth: cardDetails?.expiryMonth,
        expiryYear: cardDetails?.expiryYear,
        last4: cardDetails?.last4,
        postalCode: cardDetails?.postalCode,
      });
    } else {
      setState({cardInfo: null});
    }
  };
  return (
    <WrapperContainer>
      <HomeHeader
        leftIcon={imagesPath.backnew}
        onPressBack={() => navigation.goBack()}
        centerText={'Select Payment Method'}
        centertextstyle={{
          fontSize: textScale(20),
          marginLeft: moderateScale(10),
        }}
      />
      <Loader isLoading={isLoading} />
      {/* <StripeProvider
        publishableKey={
          'pk_test_51Ih2JWAwpsdr0ImozXcvwkoKrBbg8Q4eQKkknfiNdNNtC15F54DV3OLWZZiu3M5I1BUMxQhWCAYRtew1kvg3Fz5900rb0ACM69'
        }
        merchantIdentifier="merchant.identifier"> */}
        {/* <CardField
          // key={isReload}
          //   ref={cardFieldRef}
          postalCodeEnabled={false}
          placeholder={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={{
            backgroundColor: colors.backgroundGrey,
            textColor: colors.black,
            borderRadius: moderateScale(12),
          }}
          style={{
            height: 50,
            marginVertical: moderateScaleVertical(24),
          }}
          onCardChange={cardDetails => {
            _onChangeStripeData(cardDetails);
          }}
          onFocus={focusedField => {
            console.log('focusField', focusedField);
          }}
          onBlur={() => {
            Keyboard.dismiss();
          }}
        /> */}
      {/* </StripeProvider> */}
      <ButtonComp
        btnText={strings.continue}
        btnView={{borderRadius: moderateScale(30)}}
      />
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({});

export default StripePayment;
