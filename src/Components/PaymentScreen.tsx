// import { initStripe } from '@stripe/stripe-react-native';
import React, { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { STRIPE_LIVE_PUBLISHABLE_KEY, STRIPE_TEST_PUBLISHABLE_KEY } from '../config/urls';

import colors from '../styles/colors';

interface Props {
  paymentMethod?: string;
  //   onInit?(): void;
  children: ReactNode;
}

const PaymentScreen: React.FC<Props> = ({
  paymentMethod,
  children,
  //   onInit,
}) => {
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function initialize() {
  //     await initStripe({
  //       // publishableKey: STRIPE_TEST_PUBLISHABLE_KEY || STRIPE_LIVE_PUBLISHABLE_KEY,
  //       publishableKey: 'pk_test_51Ih2JWAwpsdr0ImozXcvwkoKrBbg8Q4eQKkknfiNdNNtC15F54DV3OLWZZiu3M5I1BUMxQhWCAYRtew1kvg3Fz5900rb0ACM69',
  //       merchantIdentifier: 'merchant.com.encountr.app',
  //       urlScheme: 'stripe-example',
  //       setReturnUrlSchemeOnAndroid: true,
  //     });
  //     setLoading(false);
  //     // onInit?.();
  //   }
  //   initialize();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return loading ? (
    <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
  ) : (
    <View accessibilityLabel="payment-screen" style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundcolor: colors.darkBlack,
    // paddingTop: 20,
    // paddingHorizontal: 16,
  },
});

export default PaymentScreen;
