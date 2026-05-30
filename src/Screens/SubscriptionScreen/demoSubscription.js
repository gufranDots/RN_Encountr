import React, {useEffect, useState} from 'react';
import {
  View,
  ImageBackground,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {
  TabView,
  SceneMap,
  TabBar,
  TabBarIndicator,
} from 'react-native-tab-view';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
// import {useStripe, PaymentSheetError} from '@stripe/stripe-react-native';

import imagesPath from '../../constants/imagesPath';

import ButtonComp from '../../Components/ButtonComp';

import {height, moderateScale, width} from '../../styles/responsiveSize';
import styles, { useTheme, getCommonStyles } from './styles';

import {
  BasicPackage,
  BluePackage,
  CrystalPackage,
  PinkPackage,
  getPackageData,
  getPackageName,
  getTabBarColor,
  getTabBarPrice,
} from '../../utils/subscriptionHelpers';
import {stripeEndpointApi} from '../../redux/reduxActions/profileActions';
import {Loader} from '../../Components/Loader';
import {buyStripe, buySubscription, getUserProfile} from '../../redux/reduxActions/authActions';
import navigationString from '../../constants/navigationString';
import {
  ApiError,
  ApplyEaseOutAnimation,
  showError,
  showSuccess,
} from '../../utils/helperFunctions';
import PaymentScreen from '../../Components/PaymentScreen';
import GradientText from '../../Components/GradientText';
import ToggleComp from '../../Components/ToggleComp';
import fontFamily from '../../styles/fontFamily';
import {CommonActions} from '@react-navigation/native';
import {enableFreeze} from 'react-native-screens';
// import {
//   PurchaseError,
//   acknowledgePurchaseAndroid,
//   clearTransactionIOS,
//   flushFailedPurchasesCachedAsPendingAndroid,
//   presentCodeRedemptionSheetIOS,
//   purchaseErrorListener,
//   purchaseUpdatedListener,
//   requestSubscription,
//   useIAP,
// } from "react-native-iap";
import { subscriptionSkus } from '../../constants/inAppStoreSku'
import strings from '../../constants/Languages';
import { useTheme } from '../../theme/ThemeProvider';


enableFreeze();
const ROUTES = [
  {key: 'first', title: 'Basic'},
  {key: 'second', title: 'Blue'},
  {key: 'third', title: 'Pink'},
  {key: 'fourth', title: 'Crystal'},
];

const StripeSubscriptionScreen = ({navigation, route}) => {
  const theme = useTheme();
  const commonStyles = getCommonStyles(theme);
  const userData = useSelector(state => state?.authReducers?.userData || {});
  const fromHome = route?.params?.from === 'Home';

  const snapPoints = React.useMemo(() => ['60%', '90%'], []);
  const bottomSheetRef = React.useRef(null);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [state, setState] = React.useState({
    index: 0,
    routes: ROUTES,
  });
  const [packageData, setPackageData] = React.useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [currentPlan, setCurrentPlan] = React.useState(null);
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState();

  const fetchPaymentSheetParams = async item => {
    let amount =
      month === 'Monthly'
        ? item.priceOneMonth.replace(/\D/g, '')
        : item.priceThreeMonth.replace(/\D/g, '');
    amount = Number(amount);
    const apiData = {amount, currency: 'USD'};

    const currPackage = {
      subscription_id: item?.id,
      subscription_type: month === 'Monthly' ? '1 month' : '3 months',
      amount,
    };

    setCurrentPackage(currPackage);

    try {
      const response = await stripeEndpointApi(apiData);

      console.log(response, 'responseresponseresponse');

      const {paymentIntent, ephemeralKey, customer} = await response?.data;
      setClientSecret(paymentIntent);
      return {
        paymentIntent,
        ephemeralKey,
        customer,
      };
    } catch (error) {
      showError(ApiError(error));
      setLoading(false);
      setInitializingSheet(false);
    }
  };

  console.log(clientSecret, 'client secret====>>>>>>>>>>>.');

  useEffect(()=>{
    handleGetSubscriptions()
  },[])

  useEffect(() => {
    if (paymentSheetEnabled && clientSecret) {
      openPaymentSheet();
    }
  }, [clientSecret, paymentSheetEnabled]);

  const openPaymentSheet = async () => {
    console.log('payment sheet called', clientSecret);
    if (!clientSecret) {
      return;
    }
    // const {error} = await presentPaymentSheet();

    if (!error) {
      // buyStripe(currentPackage)
      //   .then(res => {
      //     console.log(res, 'response ===>>>');
      //     // showSuccess('Payment successfull');
      //     getProfile()
      //     navigation.goBack();
      //     setLoading(false);
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     setLoading(false);
      //   });
      onPressBuy()
    } else {
      setLoading(false);
      // switch (error.code) {
      //   case PaymentSheetError.Failed:
      //     Alert.alert(
      //       `PaymentSheet present failed with error code: ${error.code}`,
      //       error.message,
      //     );
      //     setPaymentSheetEnabled(false);
      //     break;
      //   case PaymentSheetError.Canceled:
      //     Alert.alert('Transaction Terminated', error.message);
      //     break;
      //   case PaymentSheetError.Timeout:
      //     Alert.alert('Transaction timed out', error.message);
      //     break;
      }
    }
    // setLoading(false)
  };

  const initialisePaymentSheet = async item => {
    setInitializingSheet(true);
    const {paymentIntent, ephemeralKey, customer} =
      await fetchPaymentSheetParams(item);

    console.log(paymentIntent, 'ddfdasdasadsads');
    const address = {
      city: userData?.city || 'San Francisco',
      country: userData?.country || 'GB',
      line1: '' || '510 Townsend St.',
      line2: '' || '123 Street',
      postalCode: '' || '94102',
      state: userData?.city || 'California'
    }
    const billingDetails = {
      name: userData?.name || 'Encountr',
      email: userData?.email || 'Michael.ehidiamen@ekobridge.com',
      phone: userData?.phone_number || '+447710507265',
      address
    }
    const appearance = {
      shapes: {
        borderRadius: moderateScale(14),
        borderWidth: 0.5,
      },
      primaryButton: {
        shapes: {
          borderRadius: moderateScale(14),
        },
      },
      colors: {
        primary: theme.colors.themecolor2,
        background: theme.colors.white,
        componentBackground: theme.colors.white,
        componentBorder: theme.colors.black,
        componentDivider: theme.colors.black,
        primaryText: theme.colors.black,
        secondaryText: theme.colors.grey12,
        componentText: theme.colors.black,
        placeholderText: theme.colors.grey12,
        icon: theme.colors.black,
        error: theme.colors.lightRed,
      },
    };

    // const {error} = await initPaymentSheet({
    //   customerId: customer,
    //   customerEphemeralKeySecret: ephemeralKey,
    //   paymentIntentClientSecret: paymentIntent,
    //   customFlow: false,
    //   merchantDisplayName: 'Example Inc.',
    //   applePay: {merchantCountryCode: 'GB'},
    //   style: 'automatic',
    //   googlePay: {
    //     merchantCountryCode: 'GB',
    //     testEnv: true,
    //   },
    //   returnURL: 'stripe-example://stripe-redirect',
    //   defaultBillingDetails: billingDetails,
    //   defaultShippingDetails: billingDetails,
    //   allowsDelayedPaymentMethods: true,
    //   appearance,
    //   primaryButtonLabel: 'Purchase',
    // });
    if (!error) {
      setInitializingSheet(false);
      setPaymentSheetEnabled(true);
    // } else if (error.code === PaymentSheetError.Failed) {
    //   setInitializingSheet(false);
    //   Alert.alert(
    //     `PaymentSheet init failed with error code: ${error.code}`,
    //     error.message,
    //   );
    //   setLoading(false);
    // } else if (error.code === PaymentSheetError.Canceled) {
    //   setInitializingSheet(false);
    //   Alert.alert(
    //     `PaymentSheet init was canceled with code: ${error.code}`,
    //     error.message,
    //   );
    //   setLoading(false);
    } else {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (userData?.subscription?.subscription_id) {
      setState({ ...state, index: userData?.subscription?.subscription_id - 1 })
    }
  }, [userData?.subscription?.subscription_id])

  React.useEffect(() => {
    setCurrentPlan(getPackageName(state.index))
    setPackageData(getPackageData(state.index))
    if (state.index === 0) {
      bottomSheetRef?.current?.close()
    }
  }, [state.index])

  const renderItem = ({item, index}) => {
  const theme = useTheme();
  const commonStyles = getCommonStyles(theme);
    return (
      <TouchableOpacity
        disabled={initializingSheet}
        style={{
          ...styles.cardStyle,
          borderColor:
            index === selectedIndex
              ? getTabBarColor(state.index)
              : theme.colors.whiteOpacity20,
        }}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedIndex(index);
        }}>
        {index === selectedIndex && item?.month === '12 Months' ? (
          <View style={styles.absoluteTextStyle}>
            <Text style={styles.offerText(state)}>Best Offer</Text>
          </View>
        ) : null}
        <Text style={styles.monthText(state)}>{item?.month}</Text>
        <Text style={{...commonStyles.font_16_SemiBold}}>{item?.price}</Text>
      </TouchableOpacity>
    );
  };

  const [initializingSheet, setInitializingSheet] = React.useState(false);

  const onPressBuy = async item => {
    setLoading(true);
    
    initialisePaymentSheet(item);
  };

  const handleGetSubscriptions = async () => {
    try {
      const response = await getSubscriptions({ skus: subscriptionSkus })
      console.log(response, 'handleGetSubscriptions response --->>>>')
      // setIsLoading(false)
    } catch (error) {
      console.log({ message: 'handleGetSubscriptions', error })
      // setIsLoading(false)
    }
  }

  const [month, setMonth] = useState('Monthly');
  const [plans, setPlans] = useState([
    {
      id: 1,
      title: 'Basic Plan',
      priceOneMonth: '150',
      priceThreeMonth: '400',
      planBenefits: [
        {description: '3 likes every 12 hours', included: true},
        {description: '9 swipes over 12 hours', included: true},
        {description: 'Match', included: true},
        {description: 'Send and Read Chats', included: false},
        {description: 'Voice Notes', included: false},
        {description: 'Voice calls & video calls', included: false},
        {
          description: 'Send message before match',
          included: false,
        },
        {description: 'Rewind', included: false},
        {description: 'Search for users outside current city', included: false},
        {description: 'Hide profile from other users', included: false},
      ],
    },
    {
      id: 2,
      title: 'Classic Plan',
      priceOneMonth: '100',
      priceThreeMonth: '250',
      planBenefits: [
        {description: 'Unlimited Likes', included: true},
        {description: 'Unlimited Swipes', included: true},
        {description: 'Match and chat', included: true},
        {description: 'See who likes you', included: true},
        {description: 'Voice note', included: true},
        {description: 'Voice calls & video calls', included: false},
        // {
        //   description: 'Can send message to user before they match',
        //   included: false
        // },
        {
          description: 'Send message before match',
          included: false,
        },
        {description: 'Rewind', included: false},
        {description: 'Search for users outside current city', included: false},
        {description: 'Hide profile from other users', included: false},
      ],
    },
    {
      id: 3,
      title: 'Diamond Plan',
      priceOneMonth: '150',
      priceThreeMonth: '400',
      planBenefits: [
        {description: 'Unlimited Likes', included: true},
        {description: 'Unlimited Swipes', included: true},
        {description: 'Match and chat', included: true},
        {description: 'See who likes you', included: true},
        {description: 'Voice note', included: true},
        {description: 'Voice calls & video calls', included: true},
        // {
        //   description: 'Can send message to user before they match',
        //   included: true
        // },
        {
          description: 'Send message before match',
          included: true,
        },
        {description: 'Rewind', included: true},

        {
          description: 'Search for users outside current city',
          included: true,
        },
        {description: 'Hide profile from other users', included: true},
      ],
    },
  ]);



  const getProfile =()=>{
    getUserProfile().then((res)=>{
console.log(res?.data,"GET PROFILE DATATATAATTA");
    }).catch((err)=>{
      showError(err?.message)
    })
  }

  const renderSubscriptionItem = ({item, index}) => {
  const theme = useTheme();
  const commonStyles = getCommonStyles(theme);
    return (
      <View
        style={{
          backgroundColor: theme.colors.blackOpacity10,
          marginRight: moderateScale(14),
          width: width - moderateScale(80),
          padding: moderateScale(16),
          height: height / 1.55,
          borderRadius: moderateScale(12),
          borderWidth:
            userData?.subscription?.subscription_id === item?.id &&
            (month === 'Monthly' ? '1 month' : '3 months') ===
              (userData?.subscription?.subscription_type === 'free'
                ? '1 month'
                : userData?.subscription?.subscription_type)
              ? 2
              : 0,
          borderColor: theme.colors.themecolor2,
        }}>
        {index > 0 && month === 'Trimonthly' && (
          <View
            style={{
              backgroundColor: theme.colors.themecolor2,
              position: 'absolute',
              right: 10,
              top: 10,
              paddingVertical: moderateScale(3),
              paddingHorizontal: moderateScale(10),
              borderRadius: moderateScale(4),
            }}>
            <Text style={{...commonStyles.font_12_medium, color: theme.colors.white}}>
              Best value
            </Text>
          </View>
        )}
        <Text style={{...commonStyles.font_12_medium}}>{item?.title}</Text>
        {index === 0 ? (
          <Text
            style={{
              ...commonStyles.font_20_medium,
              marginVertical: moderateScale(8),
            }}>
            Free
          </Text>
        ) : (
          <Text
            style={{
              ...commonStyles.font_20_medium,
              marginVertical: moderateScale(8),
            }}>
            ${month === 'Monthly' ? item?.priceOneMonth : item?.priceThreeMonth}
            <Text style={{...commonStyles.font_10_medium}}>
              {' '}
              /{month === 'Monthly' ? 'month' : '3 months'}
            </Text>
          </Text>
        )}
        <Text
          style={{
            ...commonStyles.font_10_medium,
            paddingVertical: moderateScale(12),
          }}>
          Feautures
        </Text>
        <ScrollView>
          {item?.planBenefits?.map((val, ind) => {
            return (
              <View
                key={ind}
                style={{
                  paddingVertical: moderateScale(8),
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    height: 16,
                    width: 16,
                    backgroundColor: theme.colors.white,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={
                      val?.included
                        ? imagesPath.ic_greenTick
                        : imagesPath.ic_cross
                    }
                    style={{
                      tintColor: theme.colors.black,
                      height: 10,
                      width: 10,
                      resizeMode: 'contain',
                    }}
                  />
                </View>
                <Text
                  style={{
                    ...commonStyles.font_12_medium,
                    paddingLeft: moderateScale(8),
                    paddingRight: moderateScale(20),
                  }}>
                  {val?.description}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        {index > 0 && (
          <ButtonComp
            btnText={
              userData?.subscription?.subscription_id === item?.id &&
              (month === 'Monthly' ? '1 month' : '3 months') ===
                userData?.subscription?.subscription_type
                ? 'Current Plan'
                : 'Buy ' + item?.title
            }
            btnStyle={{paddingTop: moderateScale(14)}}
            onPressBtn={() => onPressBuy(item)}
            disabled={
              userData?.subscription?.subscription_id === item?.id &&
              (month === 'Monthly' ? '1 month' : '3 months') ===
                userData?.subscription?.subscription_type
            }
          />
        )}
      </View>
    );
  };

  const onPressBack = () => {
    if (fromHome) {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{name: navigationString.TABROUTES}],
        }),
      );
    } else {
      navigation.goBack();
    }
  };
  const theme = useTheme();
  const commonStyles = getCommonStyles(theme);
  return (
    <PaymentScreen>
      <View style={{flex: 1, backgroundColor: theme.colors.white}}>
        <SafeAreaView />
        <View
          style={{
            paddingHorizontal: moderateScale(16),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View style={{flex: 0.2}}>
            {route?.params?.isBack && (
              <TouchableOpacity style={styles.crossBtn} onPress={onPressBack}>
                <Image
                  source={imagesPath.ic_cross}
                  style={{tintColor: theme.colors.black}}
                />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{flex: 0.6, justifyContent: 'center', alignItems: 'center'}}>
            {/* <Text
              style={{
                ...commonStyles.font_14_medium,
                color: theme.colors.themecolor2
              }}>
              SUBSCRIPTIONS
            </Text> */}
          </View>
          <View style={{flex: 0.2}} />
        </View>
        <View
          style={{
            paddingHorizontal: moderateScale(20),
            paddingVertical: moderateScale(16),
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <GradientText
            text={'Find your helpmate in Christ'}
            textStyle={{...commonStyles.font_22_bold}}
            start={{x: 0, y: 0.4}}
            end={{x: 0.4, y: 0.5}}
            colorArray={[theme.colors.black, theme.colors.black]}
          />
          <Text
            style={{
              ...commonStyles.font_12_medium,
              color: theme.colors.blackOpacity80,
              marginTop: moderateScale(6),
              textAlign: 'center',
            }}>
            {`It's not just dating, it's ${strings.appName}`}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: moderateScale(16),
              justifyContent: 'center',
            }}>
            <Text
              style={{
                ...commonStyles.font_14_medium,
                paddingRight: moderateScale(10),
                color:
                  month === 'Monthly'
                    ? theme.colors.black
                    : theme.colors.blackOpacity60,
                fontFamily:
                  month === 'Monthly' ? fontFamily.bold : fontFamily.medium,
              }}>
              1 Month
            </Text>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                width: moderateScale(44),
                height: moderateScale(30),
              }}
              onPress={() => {
                ApplyEaseOutAnimation();
                setMonth(month === 'Monthly' ? 'Trimonthly' : 'Monthly');
              }}>
              <Image
                // source={
                //   month === 'Trimonthly' ? imagesPath.ic_toggle_on : imagesPath.ic_toggle_off
                // }
                source={imagesPath.ic_toggle_on}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'contain',
                  transform: [
                    {rotate: month === 'Monthly' ? '180deg' : '0deg'},
                  ],
                }}
              />
            </TouchableOpacity>
            <Text
              style={{
                ...commonStyles.font_14_medium,
                paddingLeft: moderateScale(10),
                color:
                  month === 'Trimonthly'
                    ? theme.colors.black
                    : theme.colors.blackOpacity60,
                fontFamily:
                  month === 'Trimonthly' ? fontFamily.bold : fontFamily.medium,
              }}>
              3 Months
            </Text>
          </View>
        </View>
        <View>
          <FlatList
            data={plans}
            horizontal
            renderItem={renderSubscriptionItem}
            contentContainerStyle={{
              paddingHorizontal: moderateScale(20),
            }}
            showsHorizontalScrollIndicator={false}
            bounces={false}
          />
        </View>
      </View>
      <Loader isLoading={loading} />
    </PaymentScreen>
  );

export default StripeSubscriptionScreen;
