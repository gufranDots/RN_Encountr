import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import ButtonComp from '../../Components/ButtonComp';
import imagesPath from '../../constants/imagesPath';
import colors from '../../styles/colors';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
  width,
} from '../../styles/responsiveSize';
import styles from './styles';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import {
  clearTransactionIOS,
  flushFailedPurchasesCachedAsPendingAndroid,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
  useIAP,
} from 'react-native-iap';
import { enableFreeze } from 'react-native-screens';
import { ImgBgComponent, WrapperContainer } from '../../Components';
import HeaderComp from '../../Components/HeaderComp';
import ImageText from '../../Components/ImageText';
import { subscriptionSkus } from '../../constants/inAppStoreSku';
import strings from '../../constants/Languages';
import navigationString from '../../constants/navigationString';
import {
  buySubscription,
  getUserProfile,
} from '../../redux/reduxActions/authActions';
import fontFamily from '../../styles/fontFamily';
import { showError } from '../../utils/helperFunctions';
import { Loader } from '../../Components/Loader';
import en from '../../constants/Languages/en';
import { useTheme } from '../../theme/ThemeProvider';

enableFreeze();

let purchaseUpdate = null;
let purchaseError = null;
const StripeSubscriptionScreen = ({ navigation, route }) => {
  const {theme, isDark} = useTheme();
  const { connected, subscriptions, getSubscriptions, finishTransaction, getProducts } = useIAP();
  const fromHome = route?.params?.from === 'Home';
  const [buySubscriptionModal, setbuySubscriptionModal] = useState(false);
  const [screenLoader, setScreenLoader] = useState(false);
  const [holdLatestToken, setHoldLatestToken] = useState(null);
  const [oneMonthPackage, setOneMonthPackage] = useState(null);
  const [threeMonthPackage, setThreeMonthPackage] = useState(null);
  const [subscriptionData, setsubscriptionData] = useState(0);
  const [isLoading, setLoading] = useState(false);

  const freeData = [
    {
      img: imagesPath.msg,
      text: 'Join various groups that match your interests and preferences, such as Bear, Trans, Geek, Leather, and more.',
    },
    {
      img: imagesPath.msg,
      text: 'Share your location with other members and meet up with them nearby.',
    },
    {
      img: imagesPath.msg,
      text: 'You can send unlimited messages and share up to five private photos at a time.',
    },
    {
      img: imagesPath.msg,
      text: 'You can view up to 100 profiles in your grid and favorite as many of them as you want.',
    },
    {
      img: imagesPath.msg,
      text: 'You can access the Encountr Blog, which provides you with news, tips, stories, and resources about the LGBTQ+ community.',
    },
    {
      img: imagesPath.msg,
      text: 'You can report any profile that violates the community guidelines or makes you feel uncomfortable.',
    },
    {
      img: imagesPath.msg,
      text: 'You can block up to 100 profiles a day if you don\'t want to see them or receive messages from them.',
    },
    {
      img: imagesPath.msg,
      text: 'You can use one minute of video calls a day and send up to ten video messages a day.',
    },
    {
      img: imagesPath.msg,
      text: 'You can filter other profiles by age, what they are looking for, and what tribe they identify with.',
    },
    {
      img: imagesPath.msg,
      text: 'You can explore other cities and countries by using the Explore feature, which lets you browse profiles from different locations.',
    },
  ];

  // Initialize plusData with default plan benefits
  const defaultPlusData = [
    {
      description: 'Includes all features of the PLUS subscription.',
      included: true,
    },
    {
      description: 'Viewed Me" feature to see who has visited your profile',
      included: true,
    },
    {
      description:
        "Incognito mode allows users to appear offline to others, and viewing profiles won't trigger notifications.",
      included: true,
    },
    {
      description:
        'Typing status indicator in chat to know when someone is messaging.',
      included: true,
    },
    {
      description: 'Unlimited blocking and favoriting of profiles.',
      included: true,
    },
    {
      description: 'Create an unlimited number of public live chat rooms.',
      included: true,
    },
    {
      description: 'No limit on the number of users that can be blocked.',
      included: true,
    },
  ];

  const [plusData, setplusData] = useState(defaultPlusData);
  const [selectedplan, setselectedplan] = useState(-1);
  const [selectedPlanData, setselectedPlanData] = useState('');
  const [unlimitedData, setUnlimitedData] = useState(defaultPlusData); // Use same benefits for unlimited

  const timing = [
    {
      time: 'Free',
    },
    {
      time: 'Plus',
    },
  ];

  const [timeAmountPlan, settimeAmountPlan] = useState([]);
  const [timeAmountUnlimitedPlan, settimeAmountUnlimitedPlan] = useState([]);
  const [selectedTime, setselectedTime] = useState(0);

  const [plans, setPlans] = useState([
    {
      id: 1,
      title: 'Plus Plan',
      subscriptionPlan1: {},
      subscriptionPlan3: {},
      planBenefits: defaultPlusData,
    },
    {
      id: 2,
      title: 'Unlimited Plan',
      subscriptionPlan1: {},
      subscriptionPlan3: {},
      planBenefits: defaultPlusData,
    },
  ]);

  // Initialize plusData when component mounts
  useEffect(() => {
    setplusData(defaultPlusData);
    setUnlimitedData(defaultPlusData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (connected) handleGetSubscriptions();
    }, [connected])
  );

  useEffect(() => {
    console.log(JSON.stringify(subscriptions), "subscriptionssubscriptionssubscriptions");
  }, [subscriptions])

  const handleGetSubscriptions = async () => {
    try {
      await getSubscriptions({
        skus: subscriptionSkus
      });
    } catch (error) {
      console.log({ message: 'handleGetSubscriptions', error });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.navigate('Home');
        return true;
      });
      return () => {
        backHandler.remove();
      };
    }, []));

  useEffect(
    useCallback(() => {
      (async () => {
        if (connected) {
          if (Platform.OS === 'android') {
            await flushFailedPurchasesCachedAsPendingAndroid();
          } else {
            await clearTransactionIOS();
          }
          _getSubscriptionPackages();
        }
      })();

      purchaseUpdate = purchaseUpdatedListener(async purchase => {
        const receipt = purchase.transactionReceipt
          ? purchase.transactionReceipt
          : purchase?.originalJson;

        if (Platform.OS === 'ios') {
          clearTransactionIOS()
            .then(res1 => {
              console.log(res1, 'err from clear res');
            })
            .catch(err => {
              console.log(err, 'err from clear error');
            });
        }

        if (receipt) {
          if (Platform.OS == 'ios') {
            setHoldLatestToken({
              receipt,
              transactionId: purchase?.transactionId,
            });
          } else {
            const receiptObj = JSON.parse(receipt);
            setHoldLatestToken({
              receipt: receiptObj?.purchaseToken,
              transactionId: purchase?.transactionId,
            });
          }
        }
      });

      purchaseError = purchaseErrorListener(() => { });

      return () => {
        purchaseUpdate?.remove();
        purchaseError?.remove();
      };
    }, [connected]));

  const _getSubscriptionPackages = async () => {
    try {
      setScreenLoader(false);
    } catch (error) {
      setScreenLoader(false);
      showError(strings.errorsubscriptionAppStore);
      setScreenLoader(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('subscriptionssubscriptions', subscriptions);

      if (Array.isArray(subscriptions) && subscriptions.length != 0) {
        if (Platform.OS === 'android') {
          let newArr = [...plans];
          subscriptions.map(item => {
            if (
              item?.productId == 'com.plusplan.onemonth' &&
              item?.name == 'Plus Subscription Plan'
            ) {
              settimeAmountPlan(item);
              newArr[0].planDetails = item;
              newArr[0].pricingDetails = item?.subscriptionOfferDetails;
              // Ensure plusData is set from plan benefits
              setplusData(newArr[0]?.planBenefits || defaultPlusData);
            } else if (
              item?.productId == 'com.unlimitedplan.oneyear' &&
              item?.name == 'Unlimited Annual Plan'
            ) {
              settimeAmountUnlimitedPlan(item);
              newArr[1].planDetails = item;
              newArr[1].pricingDetails = item?.subscriptionOfferDetails;
              setUnlimitedData(newArr[1]?.planBenefits || defaultPlusData);
            }
          });
          setPlans(newArr);
          setLoading(false);
        } else {
          const newplus = [];
          const newUnlimited = [];
          let newArr = [...plans];

          subscriptions.map(item => {
            if (item?.productId == 'com.plusPlans.oneMonth') {
              newArr[0].planDetails = item;
              newplus.push(item);
              newArr[0].pricingDetails = item?.subscriptionOfferDetails;
              // Ensure plusData is always set
              setplusData(newArr[0]?.planBenefits || defaultPlusData);
            } else if (
              item?.productId == 'com.plusPlan.threesmonths' &&
              item?.title == '3 Months'
            ) {
              newplus.push(item);
              newArr[0].planDetails = item;
              newArr[0].pricingDetails = item;
            } else if (
              item?.productId == 'com.plusPlan.sixsmonths' &&
              item?.title == '6 Months'
            ) {
              newplus.push(item);
              newArr[0].planDetails = item;
              newArr[0].pricingDetails = item;
            } else if (
              item?.productId == 'com.plusPlans.onesyear' &&
              item?.title == '1 Year'
            ) {
              newplus.push(item);
              newArr[0].planDetails = item;
              newArr[0].pricingDetails = item?.subscriptionOfferDetails;
            } else if (item?.productId == 'com.unlimitedPlans.onemonth') {
              setUnlimitedData(newArr[1]?.planBenefits || defaultPlusData);
              newUnlimited.push(item);
              newArr[1].planDetails = item;
              newArr[1].pricingDetails = item?.subscriptionOfferDetails;
            } else if (
              item?.productId == 'com.unlimitedPlan.sixmonths' &&
              item?.title == '6 Months'
            ) {
              setUnlimitedData(newArr[1]?.planBenefits || defaultPlusData);
              newUnlimited.push(item);
              newArr[1].planDetails = item;
              newArr[1].pricingDetails = item?.subscriptionOfferDetails;
            }
          });

          // Sort and set the plans
          const newplusDataModifi = newplus?.sort(
            (a, b) => parseInt(a.price) - parseInt(b.price),
          );
          settimeAmountPlan(newplusDataModifi);

          const newUnlimitedDataModifi = newUnlimited?.sort(
            (a, b) => parseInt(a.price) - parseInt(b.price),
          );
          settimeAmountUnlimitedPlan(newUnlimitedDataModifi);

          // Update plans state
          setPlans(newArr);
          setLoading(false);
        }
      } else {
        // If no subscriptions, ensure plusData is still available
        setplusData(defaultPlusData);
        setUnlimitedData(defaultPlusData);
        setLoading(false);
      }
    }, [connected, subscriptions]));

  useFocusEffect(
    useCallback(() => {
      if (Array.isArray(subscriptions) && subscriptions.length != 0) {
        if (Platform.OS == 'android') {
          subscriptions.map(ite => {
            if (
              ite?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]
                ?.billingPeriod == 'P1M'
            ) {
              setOneMonthPackage(
                ite?.subscriptionOfferDetails[0]?.pricingPhases
                  ?.pricingPhaseList[0],
              );
            } else {
              setThreeMonthPackage(
                ite?.subscriptionOfferDetails[0]?.pricingPhases
                  ?.pricingPhaseList[0],
              );
            }
          });
        } else {
          subscriptions.map(ite => {
            if (ite?.subscriptionPeriodNumberIOS === '1') {
              setOneMonthPackage(ite);
            } else {
              setThreeMonthPackage(ite);
            }
          });
        }
      }
    }, [subscriptions]));

  const handleBuySubscription = async selectedPlanData => {
    if (selectedPlanData.length != 0) {
      setScreenLoader(false);
      try {
        if (Platform.OS == 'ios') {
          const res = await requestSubscription({
            sku: selectedPlanData?.productId,
          });
          verifySubscription(
            res?.productId,
            res?.transactionId,
            res?.transactionReceipt,
          );
        } else {
          const res = await requestSubscription({
            subscriptionOffers: [
              {
                sku:
                  subscriptionData == 1
                    ? timeAmountPlan?.productId
                    : timeAmountUnlimitedPlan?.productId,
                offerToken: selectedPlanData?.offerToken,
              },
            ],
          });

          verifySubscription(
            res[0]?.productId,
            res[0]?.transactionId,
            res[0]?.transactionReceipt,
          );
        }
      } catch (error) {
        setScreenLoader(false);
        if (error) {
          setselectedplan(-1);
          showError('Payment Cancelled');
        } else {
          console.log('error', error);
        }
      }
    } else {
      Alert.alert('', 'Please select subscription');
    }
  };

  const verifySubscription = (productId, transactionId) => {
    const apiData = {
      product_id: productId,
      transaction_id: transactionId,
      subscription_type:
        Platform.OS === 'android'
          ? selectedPlanData?.basePlanId
          : selectedPlanData?.description,
      subscription_id: subscriptionData == 1 ? 2 : 3,
      receipt: '',
      type: Platform.OS,
      price:
        Platform.OS === 'android'
          ? (selectedPlanData?.pricingPhases?.pricingPhaseList[0]?.formattedPrice).substring(
            1,
          )
          : selectedPlanData?.price,
      currency:
        Platform.OS === 'android'
          ? selectedPlanData?.pricingPhases?.pricingPhaseList[0]
            ?.priceCurrencyCode
          : selectedPlanData?.currency,
    };
    console.log("huhuhhuh", apiData);

    buySubscription(apiData)
      .then(() => {
        setbuySubscriptionModal(false);
        navigation.goBack();
        setScreenLoader(false);
        getProfile();
      })
      .catch(err => {
        console.log(err);
        setScreenLoader(false);
      });
  };

  const getProfile = () => {
    getUserProfile()
      .then(() => { })
      .catch(err => {
        showError(err?.message);
      });
  };

  const onPressBack = () => {
    if (fromHome) {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: navigationString.TABROUTES }],
        }),
      );
    } else {
      navigation.goBack();
    }
  };

  const renderfreeData = item => {
    return (
      <ImageText
        mainstyle={{ marginTop: moderateScaleVertical(30) }}
        tintColor={theme.colors.themecolor2}
        source={item.img}
        text={item.text}
      />
    );
  };

  const renderPlusData = item => {
    return (
      <ImageText
        mainstyle={{ marginTop: moderateScaleVertical(30) }}
        tintColor={theme.colors.themecolor2}
        source={imagesPath.msg}
        text={item.description}
      />
    );
  };

  const renderUnlimitedData = item => {
    return (
      <ImageText
        mainstyle={{ marginTop: moderateScaleVertical(30) }}
        tintColor={theme.colors.themecolor2}
        source={imagesPath.msg}
        text={item.description}
      />
    );
  };

  const renderpplans = (item, index) => {
    return (
      <>
        {index == selectedplan ? (
          <View
            style={{
              borderRadius: moderateScale(50),
              borderWidth: 1,
              borderColor: theme.colors.grey,
              paddingHorizontal: moderateScale(8),
              paddingVertical: moderateScaleVertical(6),
              alignSelf: 'center',
              top: 14,
              marginTop: -14,
              zIndex: 1,
              backgroundColor: theme.colors.white,
            }}>
            <Text style={{ fontSize: textScale(12), color: theme.colors.black }}>
              Best offer
            </Text>
          </View>
        ) : (
          <></>
        )}
        <TouchableOpacity
          onPress={() => {
            setselectedplan(index);
            setselectedPlanData(item);
          }}
          style={{
            marginHorizontal: moderateScale(20),
            height: moderateScaleVertical(56),
            borderColor:
              index == selectedplan ? theme.colors.themecolor2 : theme.colors.grey,
            borderWidth: index == selectedplan ? 2 : 1,
            borderRadius: moderateScale(8),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              flex: 0.4,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: moderateScaleVertical(6),
            }}>
            <Text
              style={{
                fontSize: textScale(14),
                color: theme.colors.black,
                marginLeft: moderateScale(20),
                fontFamily: fontFamily.SemiBold,
              }}>
              {item.basePlanId}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flex: 0.6,
              justifyContent: 'flex-end',
              marginTop: moderateScale(4),
              alignItems: 'center',
              marginRight: moderateScale(20),
            }}>
            <View style={{ flex: 0.6, alignItems: 'flex-end' }}>
              <Text
                numberOfLines={1}
                style={{
                  marginLeft: moderateScale(16),
                  fontSize: textScale(16),
                  color: theme.colors.black,
                  fontFamily: fontFamily.bold,
                }}>
                {item?.pricingPhases?.pricingPhaseList[0]?.formattedPrice}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const renderplans = (item, index) => {
    return (
      <>
        {index == selectedplan ? (
          <View
            style={{
              borderRadius: moderateScale(50),
              borderWidth: 1,
              borderColor: theme.colors.grey,
              paddingHorizontal: moderateScale(8),
              paddingVertical: moderateScaleVertical(6),
              alignSelf: 'center',
              top: 14,
              marginTop: -14,
              zIndex: 1,
              backgroundColor: theme.colors.white,
            }}>
            <Text style={{ fontSize: textScale(12), color: theme.colors.black }}>
              Best offer
            </Text>
          </View>
        ) : (
          <></>
        )}
        <TouchableOpacity
          onPress={() => {
            setselectedplan(index);
            setselectedPlanData(item);
          }}
          style={{
            marginHorizontal: moderateScale(20),
            height: moderateScaleVertical(56),
            borderColor:
              index == selectedplan ? theme.colors.themecolor2 : theme.colors.grey,
            borderWidth: index == selectedplan ? 2 : 1,
            borderRadius: moderateScale(8),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              flex: 0.4,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: moderateScaleVertical(6),
            }}>
            <Text
              style={{
                fontSize: textScale(14),
                color: colors.darkBlack,
                marginLeft: moderateScale(20),
              }}>
              {item.title}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flex: 0.6,
              justifyContent: 'flex-end',
              marginTop: moderateScale(4),
              alignItems: 'center',
              marginRight: moderateScale(20),
            }}>
            <View style={{ flex: 0.6, alignItems: 'flex-end' }}>
              <Text
                numberOfLines={1}
                style={{
                  marginLeft: moderateScale(16),
                  fontSize: textScale(16),
                  color: theme.colors.black,
                  fontFamily: fontFamily.SemiBold,
                }}>
                {item?.localizedPrice}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <WrapperContainer
      isSafeAreaAvailable={false}
      isWhiteStatusBar={false}
      statusbarcolorr={theme.colors.backgroundGrey}
      mainViewStyle={{ paddingHorizontal: moderateScale(0) }}>
      <>
        <ImgBgComponent
          imgSource={imagesPath.topbackground}
          bgImgtyle={styles.headerBgStyle}>
          {route?.params?.isBack && (
            <View style={{ flex: 0.2 }}>
              <HeaderComp
                viewStyle={{}}
                onPressBack={onPressBack}
                leftIcon={imagesPath.ic_back}
                leftImageStyle={{ tintColor: theme.colors.white }}
                leftIconStyle={styles.backBtnStyle}
              />
            </View>
          )}
          <FlatList
            horizontal
            contentContainerStyle={{
              flex: 1,
              justifyContent: route?.params?.isBack ? 'space-evenly' : 'center',
            }}
            data={timing}
            renderItem={({ item, index }) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View>
                    <Text
                      onPress={() => {
                        setselectedplan(-1);
                        setselectedTime(index);
                        setsubscriptionData(index);
                      }}
                      style={{
                        color:
                          selectedTime == index
                            ? isDark ? theme.colors.primaryWhite : theme.colors.themecolor2
                            : theme.colors.primaryWhiteOpacity70,
                        marginHorizontal: index == 1 ? moderateScale(40) : 0,
                        fontSize: textScale(18),
                        fontFamily:
                          selectedTime == index
                            ? fontFamily.SemiBold
                            : fontFamily.regular,
                      }}>
                      {item.time}
                    </Text>
                    <View
                      style={{
                        alignSelf: 'center',
                        backgroundColor:
                          selectedTime == index
                            ? isDark ? theme.colors.primaryWhite : theme.colors.themecolor2
                            : null,
                        height: moderateScaleVertical(3),
                        width: moderateScale(22),
                        marginTop: moderateScaleVertical(4),
                      }}
                    />
                  </View>
                </View>
              );
            }}
          />
        </ImgBgComponent>

        <ImageBackground
          source={imagesPath.subscriptionback}
          style={{
            height: route?.params?.isBack ? height : height / 1.2,
            width,
          }}>
          <View style={{ flex: 1, backgroundColor: theme.colors.blackOpacity25}}>
            <Image
              source={
                subscriptionData == 0
                  ? imagesPath.free
                  : subscriptionData == 1
                    ? imagesPath.plus
                    : subscriptionData == 2
                      ? imagesPath.unlimited
                      : null
              }
              style={{
                height: moderateScaleVertical(54),
                alignSelf: 'center',
                marginTop: moderateScaleVertical(26),
                opacity: subscriptionData == 2 ? 0.3 : 1,
              }}
            />
            {(subscriptionData == 1 || subscriptionData == 2) && (
              <Text
                style={{
                  fontSize: textScale(14),
                  color: theme.colors.themecolor2,
                  textTransform: 'uppercase',
                  alignSelf: 'center',
                  marginTop: moderateScaleVertical(10),
                }}>
                {subscriptionData == 1
                  ? 'INCLUDES PLUS + FREE FEATURES'
                  : subscriptionData == 2
                    ? 'Free + premium+unlimited'
                    : ''}
              </Text>
            )}

            {subscriptionData == 0 ? (
              <>
                <FlatList
                  data={freeData}
                  renderItem={({ item }) => {
                    return renderfreeData(item);
                  }}
                  ListFooterComponent={() => (
                    <View style={{ marginBottom: height / 5 }} />
                  )}
                />
              </>
            ) : subscriptionData == 1 ? (
              <>
                <FlatList
                  data={plusData}
                  renderItem={({ item }) => renderPlusData(item)}
                  ListFooterComponent={() => (
                    <View
                      style={{
                        marginBottom: route?.params?.isBack
                          ? height / 2.6
                          : height / 5,
                      }}
                    />
                  )}
                />
                <ButtonComp
                  onPressBtn={() => {
                    setbuySubscriptionModal(true);
                    setselectedPlanData('');
                  }}
                  btnText="Subscribe Now"
                  btnStyle={{
                    position: 'absolute',
                    width: width - 40,
                    alignSelf: 'center',
                    bottom: route?.params?.isBack ? height / 3.5 : height / 10,
                  }}
                  btnView={{
                    height: moderateScaleVertical(56),
                    borderRadius: moderateScale(18),
                  }}
                  txtStyle={{
                    color: theme.colors.primaryWhite,
                    fontSize: textScale(17),
                    fontFamily: fontFamily.SemiBold,
                  }}
                />
              </>
            ) : subscriptionData == 2 ? (
              <>
                <FlatList
                  data={unlimitedData}
                  renderItem={({ item }) => renderUnlimitedData(item)}
                  ListFooterComponent={() => (
                    <View
                      style={{
                        marginBottom: route?.params?.isBack
                          ? height / 3.2
                          : height / 5,
                      }}
                    />
                  )}
                />
                <ButtonComp
                  onPressBtn={() => {
                    setbuySubscriptionModal(true);
                    setselectedPlanData('');
                  }}
                  btnText="Subscribe Now"
                  btnStyle={{
                    position: 'absolute',
                    width: width - 40,
                    alignSelf: 'center',
                    bottom: route?.params?.isBack ? height / 5 : height / 10,
                  }}
                  btnView={{
                    height: moderateScaleVertical(56),
                    borderRadius: moderateScale(18),
                  }}
                  txtStyle={{
                    color: theme.colors.blackDark,
                    fontSize: textScale(17),
                    fontFamily: fontFamily.SemiBold,
                  }}
                />
              </>
            ) : (
              <></>
            )}
          </View>
        </ImageBackground>
      </>
      <Modal
        onBackdropPress={() => {
          setbuySubscriptionModal(false);
          setselectedplan(-1);
        }}
        isVisible={buySubscriptionModal}
        style={{
          margin: 0,
          justifyContent: 'flex-end',
        }}>
        <View
          style={{
            borderTopLeftRadius: moderateScale(24),
            borderTopRightRadius: moderateScale(24),
            backgroundColor: theme.colors.white,
          }}>
          <Text
            style={{
              fontSize: textScale(18),
              fontFamily: fontFamily.SemiBold,
              color: theme.colors.black,
              alignSelf: 'center',
              marginTop: moderateScaleVertical(24),
              marginBottom: moderateScaleVertical(20),
            }}
            onPress={() => {
              setbuySubscriptionModal(false);
              setselectedplan(-1);
            }}>
            Select your plans
          </Text>

          {Platform.OS === 'android' ? (
            <FlatList
              data={
                subscriptionData == 1
                  ? timeAmountPlan?.subscriptionOfferDetails
                  : timeAmountUnlimitedPlan?.subscriptionOfferDetails
              }
              renderItem={({ item, index }) => renderpplans(item, index)}
              ItemSeparatorComponent={() => (
                <View style={{ height: moderateScaleVertical(16) }} />
              )}
            />
          ) : (
            // <View>

            <FlatList
              data={
                subscriptionData == 1 ? timeAmountPlan : timeAmountUnlimitedPlan
              }
              renderItem={({ item, index }) => renderplans(item, index)}
              ItemSeparatorComponent={() => (
                <View style={{ height: moderateScaleVertical(16) }} />
              )}
            />
            // </View>
          )}
          <Text
            style={{
              fontSize: textScale(14),
              color: theme.colors.blackOpacity60,
              marginHorizontal: moderateScale(20),
              marginTop: moderateScaleVertical(24),

              textAlign: 'center',
            }}>
            By continuing you agree to the Encounter{' '}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

            <Text
              onPress={() => {
                setbuySubscriptionModal(false);
                setTimeout(() => {

                  navigation.navigate(
                    navigationString.TERMS_CONDITION_PRIVACY_POLICY,
                    {
                      type: 1,
                    }
                  )
                }, 500);
              }}
              style={{
                textDecorationLine: 'underline',
                textAlign: 'center',
                fontSize: textScale(14),
                color: theme.colors.black,

                fontFamily: fontFamily.SemiBold,
              }}>
              {en.PRIVACY_POLICY}{"    "}
            </Text>

            <Text
              onPress={() => {
                setbuySubscriptionModal(false);
                setTimeout(() => {

                  navigation.navigate(
                    navigationString.TERMS_CONDITION_PRIVACY_POLICY,
                    {
                      type: 2,
                    }
                  )
                }, 500);
              }}
              style={{
                textDecorationLine: 'underline',
                textAlign: 'center',
                fontSize: textScale(14),
                color: theme.colors.black,

                fontFamily: fontFamily.SemiBold,
              }}>
              {en.termsAndConnditions}
            </Text>
          </View>
          <ButtonComp
            onPressBtn={() => handleBuySubscription(selectedPlanData)}
            btnView={{
              borderRadius: moderateScale(40),
              justifyContent: 'center',
            }}
            btnStyle={{
              borderRadius: moderateScale(40),
              width: width / 1.6,
              alignSelf: 'center',
              marginTop: moderateScaleVertical(16),
              marginBottom: moderateScaleVertical(30),
            }}
            btnText="Confirm & Continue"
          />
        </View>
      </Modal>
      <Loader isLoading={isLoading} />
    </WrapperContainer>
  );
};

export default StripeSubscriptionScreen;
