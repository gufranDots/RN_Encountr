import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import FastImage from '../utils/FastImageCompat';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import colors from '../styles/colors';
import {moderateScale, width} from '../styles/responsiveSize';
import GradientText from './GradientText';
import WrapperContainer from './WrapperContainer';
import navigationString from '../constants/navigationString';
import ButtonComp from './ButtonComp';
import {showError} from '../utils/helperFunctions';
import { useTheme } from '../theme/ThemeProvider';
import { getCommonStyles } from '../styles/commonStyles';
import {BlurView} from '@react-native-community/blur';
import {profileImg_Approval_Status} from '../constants/Enum';
import strings from '../constants/Languages';

const bannerHeight = moderateScale(500);
const topNavHeader = moderateScale(40);

const CollapsibleHeader = ({
  fileUrl,
  fieldOption,
  renderParentView,
  backgroundColor = '',
  rightIcon,
  leftIcon,
  rightText = '',
  leftText,
  leftTextSyle,
  onPressRightIcon,
  imgStyle,
  onPressBack = () => {},
  onPressRightText = () => {},
  boxStyle,
  rightBoxStyle,
  imageStyle,
  diamondIcon,
  Subscription,
  isFav = true,
  approvalStatus,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const commonStyles = getCommonStyles(theme);
  const navigation = useNavigation();
  const scrollA = useRef(new Animated.Value(0)).current;
  scrollA.addListener(() => {});
  const isPendingApproval =
    approvalStatus === null ||
    String(approvalStatus) === String(profileImg_Approval_Status.Pending);
  const isRejectedApproval =
    String(approvalStatus) === String(profileImg_Approval_Status.Rejected);
  const approvalText = isPendingApproval
    ? strings.waitingForApproval
    : isRejectedApproval
      ? strings.rejectedByAdmin
      : '';
  const safeArea = useSafeAreaInsets();
  const isFloating = !!scrollA;
  const [isTransparent, setTransparent] = useState(isFloating);
  const [isShowField, setShowField] = useState(false);
  const [favNotes, setFavNotes] = useState('');

  // Modal and zoom state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Animated values for zoom and pan
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Additional animated values for gesture handling
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  // Gesture refs
  const pinchRef = useRef();
  const panRef = useRef();
  const doubleTapRef = useRef();
  const singleTapRef = useRef();

  const {height: screenHeight} = Dimensions.get('window');
  useEffect(() => {
    if (!scrollA) {
      return;
    }
    const listenerId = scrollA.addListener(a => {
      // scrollPosition(aX);
      const topNaviOffset = bannerHeight - topNavHeader - safeArea.top;
      isTransparent !== a.value < topNaviOffset &&
        setTransparent(!isTransparent);
    });
    return () => scrollA.removeListener(listenerId);
  });

  // Pinch gesture handler
  const onPinchGestureEvent = event => {
    console.log('Pinch event - State:', event.nativeEvent.state, 'Scale:', event.nativeEvent.scale);
    if (event.nativeEvent.state === State.ACTIVE) {
      const newScale = lastScale.current * event.nativeEvent.scale;
      const clampedScale = Math.max(0.5, Math.min(newScale, 3)); // Limit scale between 0.5 and 3
      scale.setValue(clampedScale);
      console.log('Pinch active - New scale:', clampedScale, 'Last scale:', lastScale.current);
    }
  };

  const onPinchHandlerStateChange = event => {
    console.log('Pinch state change - State:', event.nativeEvent.state);
    if (event.nativeEvent.state === State.BEGAN) {
      console.log('Pinch began - Platform:', Platform.OS);
    } else if (event.nativeEvent.state === State.END) {
      lastScale.current = scale._value;
      console.log('Pinch ended - Final scale:', lastScale.current);
    } else if (event.nativeEvent.state === State.FAILED) {
      console.log('Pinch failed - Platform:', Platform.OS);
    }
  };

  // Pan gesture handler
  const onPanGestureEvent = event => {
    console.log('Pan event - State:', event.nativeEvent.state, 'TranslationX:', event.nativeEvent.translationX, 'TranslationY:', event.nativeEvent.translationY);
    if (event.nativeEvent.state === State.ACTIVE) {
      const newTranslateX =
        lastTranslateX.current + event.nativeEvent.translationX;
      const newTranslateY =
        lastTranslateY.current + event.nativeEvent.translationY;
      translateX.setValue(newTranslateX);
      translateY.setValue(newTranslateY);
      console.log('Pan active - New X:', newTranslateX, 'Y:', newTranslateY, 'Last X:', lastTranslateX.current, 'Last Y:', lastTranslateY.current);
    }
  };

  const onPanHandlerStateChange = event => {
    console.log('Pan state change - State:', event.nativeEvent.state);
    if (event.nativeEvent.state === State.BEGAN) {
      console.log('Pan began - Platform:', Platform.OS);
    } else if (event.nativeEvent.state === State.END) {
      lastTranslateX.current = translateX._value;
      lastTranslateY.current = translateY._value;
      console.log('Pan ended - Final X:', lastTranslateX.current, 'Y:', lastTranslateY.current);
    }
  };

  // Reset zoom and position
  const resetZoom = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      lastScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
    });
  };

  // Preload image when modal opens
  const openModal = () => {
    setIsModalVisible(true);
    console.log('Modal opened - Platform:', Platform.OS);
    // Preload the image
    if (typeof fileUrl === 'string') {
      FastImage.preload([{ uri: fileUrl, priority: FastImage.priority.high }]);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalVisible(false);
    resetZoom();
    setIsImageLoading(false);
  };

  // Double tap to reset zoom
  const handleDoubleTap = () => {
    console.log('Double tap detected - Platform:', Platform.OS);
    resetZoom();
  };

  // Single tap to close modal
  const handleSingleTap = () => {
    console.log('Single tap detected - Platform:', Platform.OS);
    closeModal();
  };

  return (
    <WrapperContainer paddingAvailable={false}>
      {/* <StatusBar
        barStyle={'light-content'}
        backgroundColor={backgroundColor}
      // translucent
      /> */}
      <View
        style={styles.container(
          safeArea,
          isFloating,
          isTransparent,
          backgroundColor,
        )}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
          }}>
          {leftIcon ? (
            <View style={{...commonStyles.rowCenterAligned}}>
              <TouchableOpacity
                onPress={onPressBack}
                style={{...styles.boxView, ...boxStyle}}>
                <Image
                  style={{
                    height: moderateScale(18),
                    width: moderateScale(18),
                    ...imageStyle,
                  }}
                  source={leftIcon}
                />
              </TouchableOpacity>
              <GradientText
                text={leftText}
                textStyle={{...styles.leftText, marginLeft: moderateScale(19)}}
                start={{x: 0, y: 0.7}}
                end={{x: 0.9, y: 1}}
              />
            </View>
          ) : (
            // <Text style={{ ...styles.leftText, ...leftTextSyle }}>
            //   {leftText}
            // </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <GradientText
                text={leftText}
                textStyle={styles.leftText}
                start={{x: 0, y: 0.7}}
                end={{x: 0.9, y: 1}}
              />
              {diamondIcon && (
                <View
                  style={{
                    marginLeft: moderateScale(2),
                    height: moderateScale(28),
                    width: moderateScale(28),
                  }}>
                  <Image
                    source={diamondIcon}
                    style={{
                      height: '100%',
                      width: '100%',
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              )}
            </View>
          )}
          {Subscription && (
            <TouchableOpacity
              style={{
                borderWidth: 1,
                paddingHorizontal: moderateScale(4),
                paddingVertical: moderateScale(2),
                borderColor: theme.colors.darkBlack,
                backgroundColor: theme.colors.black,
                borderRadius: moderateScale(8),
              }}
              onPress={() =>
                navigation.navigate(navigationString.SUBSCRIPTION_SCREEN, {
                  isBack: true,
                  from: 'ChatScreen',
                })
              }>
              <Text
                style={{
                  ...commonStyles.font_16_bold,
                  color: theme.colors.darkBlack,
                }}>
                SUBSCRIPTIONS
              </Text>
            </TouchableOpacity>
          )}
          {rightIcon ? (
            <View>
              <TouchableOpacity
                onPress={() => {
                  !isFav ? setShowField(!isShowField) : onPressRightIcon();
                }}
                style={{...styles.boxView, ...rightBoxStyle}}>
                <Image
                  style={{
                    height: moderateScale(24),
                    width: moderateScale(24),
                    ...imgStyle,
                  }}
                  source={rightIcon}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onPressRightText}
              style={{
                alignItems: 'flex-end',
              }}>
              <Text
                style={{...commonStyles.font_16_bold, color: theme.colors.darkBlack}}>
                {rightText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{flex: 0.15}} />
        {isShowField && !isFav ? (
          <View
            style={{
              height: moderateScale(100),
              width,
              backgroundColor: theme.colors.white,
              position: 'absolute',
              bottom: -100,
              // right: moderateScale(24),
              zIndex: 10,
              paddingHorizontal: moderateScale(24),
              paddingBottom: moderateScale(8),
            }}>
            <Text style={{marginBottom: moderateScale(4), color: theme.colors.black}}>
              Enter your notes
            </Text>
            <View style={{flexDirection: 'row'}}>
              <TextInput
                value={favNotes}
                maxLength={150}
                onChangeText={text => {
                  setFavNotes(text);
                }}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  borderColor: colors.black,
                  borderWidth: 1,
                  paddingHorizontal: moderateScale(8),
                }}
              />
              <ButtonComp
                btnText={'Save'}
                btnStyle={{width: 70, marginLeft: moderateScale(16)}}
                onPressBtn={() => {
                  if (favNotes.trim() == '') {
                    showError('Enter your notes');
                    return;
                  }
                  setShowField(false);
                  setFavNotes('');
                  onPressRightIcon(favNotes);
                }}
              />
            </View>
          </View>
        ) : null}
      </View>

      <Animated.ScrollView
        style={{backgroundColor: theme.colors.white}}
        onResponderMove={() => {}}
        nestedScrollEnabled={true}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollA}}}],
          {useNativeDriver: true},
        )}
        bounces={false}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <View style={{...styles.bannerContainer, backgroundColor: theme.colors.white}}>
          <Animated.View
            style={{
              ...styles.banner(scrollA, safeArea),
              backgroundColor: theme.colors.white,
            }}>
            <TouchableOpacity
              onPress={openModal}
              activeOpacity={0.9}
              style={{position: 'relative'}}>
              <FastImage
                source={typeof fileUrl === 'string' ? {uri: fileUrl} : fileUrl}
                style={{
                  ...styles.imageStyle,
                  width,
                  alignSelf: 'center',
                  marginTop: leftIcon ? 0 : 40,
                  borderTopLeftRadius: 40,
                  borderTopRightRadius: 40,
                }}
                resizeMode={'cover'}
              />
              <View
                style={{
                  position: 'absolute',
                  backgroundColor: theme.colors.blackOpacity20,
                  ...styles.imageStyle,
                  pointerEvents: 'none',
                }}
              />
              {!!approvalText && (
                <View style={[StyleSheet.absoluteFillObject, {
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: leftIcon ? 0 : 40,
                  borderTopLeftRadius: 40,
                  borderTopRightRadius: 40,
                  overflow: 'hidden'
                }]}>
                  {Platform.OS === 'ios' ? (
                    <BlurView
                      style={StyleSheet.absoluteFillObject}
                      blurType="dark"
                      blurAmount={4}
                      reducedTransparencyFallbackColor={theme.colors.blackOpacity60}
                    />
                  ) : (
                    <View
                      style={[
                        StyleSheet.absoluteFillObject,
                        {backgroundColor: theme.colors.blackOpacity60},
                      ]}
                    />
                  )}
                  <Text style={{
                     ...commonStyles.font_18_SemiBold,
        color: theme.colors.activeTintColor,
        textAlign: 'center',
        paddingHorizontal: moderateScale(8),
        zIndex: 2,
                  }}>{approvalText}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
        {renderParentView()}
      </Animated.ScrollView>

      {/* Image Modal with Zoom */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}>
        <>
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
              activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            {Platform.OS === 'android' ? (
              // Android-specific implementation with simpler gesture structure
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <PinchGestureHandler
                  ref={pinchRef}
                  onGestureEvent={onPinchGestureEvent}
                  onHandlerStateChange={onPinchHandlerStateChange}
                  minPointers={2}
                  maxPointers={2}
                  shouldCancelWhenOutside={false}
                  enabled={true}>
                  <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <PanGestureHandler
                      ref={panRef}
                      onGestureEvent={onPanGestureEvent}
                      onHandlerStateChange={onPanHandlerStateChange}
                      minPointers={1}
                      maxPointers={1}
                      shouldCancelWhenOutside={false}
                      enabled={true}>
                      <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <TapGestureHandler
                          ref={doubleTapRef}
                          numberOfTaps={2}
                          onActivated={handleDoubleTap}
                          shouldCancelWhenOutside={false}
                          enabled={true}>
                          <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <TapGestureHandler
                              ref={singleTapRef}
                              numberOfTaps={1}
                              onActivated={handleSingleTap}
                              shouldCancelWhenOutside={false}
                              enabled={true}>
                              <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <Animated.View
                                  style={[
                                    styles.modalImage,
                                    {
                                      transform: [
                                        {scale: scale},
                                        {translateX: translateX},
                                        {translateY: translateY},
                                      ],
                                    },
                                  ]}>
                                  <FastImage
                                    source={
                                      typeof fileUrl === 'string' 
                                      ? {
                                          uri: fileUrl,
                                          priority: FastImage.priority.high,
                                          cache: FastImage.cacheControl.immutable,
                                        }
                                      : fileUrl
                                    }
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                    }}
                                    resizeMode={FastImage.resizeMode.contain}
                                    onLoadStart={() => {
                                      setIsImageLoading(true);
                                    }}
                                    onLoadEnd={() => {
                                      setIsImageLoading(false);
                                    }}
                                  />
                                  {isImageLoading && (
                                    <View style={styles.loadingOverlay}>
                                      <ActivityIndicator size="large" color={colors.white} />
                                    </View>
                                  )}
                                </Animated.View>
                              </Animated.View>
                            </TapGestureHandler>
                          </Animated.View>
                        </TapGestureHandler>
                      </Animated.View>
                    </PanGestureHandler>
                  </Animated.View>
                </PinchGestureHandler>
              </View>
            ) : (
              // iOS implementation with simultaneous handlers
              <TapGestureHandler
                ref={singleTapRef}
                numberOfTaps={1}
                onActivated={handleSingleTap}>
                <Animated.View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <PinchGestureHandler
                    ref={pinchRef}
                    onGestureEvent={onPinchGestureEvent}
                    onHandlerStateChange={onPinchHandlerStateChange}
                    simultaneousHandlers={[panRef, doubleTapRef]}
                    shouldCancelWhenOutside={false}
                    minPointers={2}
                    maxPointers={2}>
                    <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <PanGestureHandler
                        ref={panRef}
                        onGestureEvent={onPanGestureEvent}
                        onHandlerStateChange={onPanHandlerStateChange}
                        simultaneousHandlers={[pinchRef, doubleTapRef]}
                        shouldCancelWhenOutside={false}
                        minPointers={1}
                        maxPointers={1}>
                        <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                          <TapGestureHandler
                            ref={doubleTapRef}
                            numberOfTaps={2}
                            onActivated={handleDoubleTap}
                            simultaneousHandlers={[pinchRef, panRef]}>
                            <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                              <Animated.View
                                style={[
                                  styles.modalImage,
                                  {
                                    transform: [
                                      {scale: scale},
                                      {translateX: translateX},
                                      {translateY: translateY},
                                    ],
                                  },
                                ]}>
                                <FastImage
                                  source={
                                    typeof fileUrl === 'string' 
                                    ? {
                                        uri: fileUrl,
                                        priority: FastImage.priority.high,
                                        cache: FastImage.cacheControl.immutable,
                                      }
                                    : fileUrl
                                  }
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                  }}
                                  resizeMode={FastImage.resizeMode.contain}
                                  onLoadStart={() => {
                                    setIsImageLoading(true);
                                  }}
                                  onLoadEnd={() => {
                                    setIsImageLoading(false);
                                  }}
                                />
                                {isImageLoading && (
                                  <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color={colors.white} />
                                  </View>
                                )}
                              </Animated.View>
                            </Animated.View>
                          </TapGestureHandler>
                        </Animated.View>
                      </PanGestureHandler>
                    </Animated.View>
                  </PinchGestureHandler>
                </Animated.View>
              </TapGestureHandler>
            )}

            <View style={styles.modalInstructions}>
              <Text style={styles.instructionText}>
                Pinch to zoom
              </Text>
              {Platform.OS === 'android' && (
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.lightGray,
                    padding: moderateScale(8),
                    borderRadius: moderateScale(4),
                    marginTop: moderateScale(8),
                  }}
                  onPress={() => {
                    console.log('Test button pressed - Current scale:', scale._value, 'Last scale:', lastScale.current);
                    resetZoom();
                  }}>
                  <Text style={{color: theme.colors.black, fontSize: moderateScale(12)}}>
                    Reset
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      </Modal>
    </WrapperContainer>
  );
};

export default React.memo(CollapsibleHeader);

const getStyles = (theme) => {
  const commonStyles = getCommonStyles(theme);
  return (
    StyleSheet.create({
      text: {
        ...commonStyles.font_16_medium,
        paddingVertical: moderateScale(20),
      },
      headerText: {
        ...commonStyles.font_20_bold,
        textTransform: 'capitalize',
        paddingTop: moderateScale(20),
      },
      bannerContainer: {
        marginTop: -930,
        paddingTop: 1000,
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
      banner: (scrollA, safeArea) => ({
        height: bannerHeight,
        width: '200%',
        transform: [
          {
            translateY: scrollA.interpolate({
              inputRange: [-bannerHeight, 0, bannerHeight, bannerHeight + 1],
              outputRange: [
                -bannerHeight / 2,
                0,
                bannerHeight * 0.75,
                bannerHeight * 0.75,
              ],
            }),
          },
          {
            scale: scrollA.interpolate({
              inputRange: [-bannerHeight, 0, bannerHeight, bannerHeight + 1],
              outputRange: [2, 1, 0.5, 0.5],
            }),
          },
        ],
      }),
      container: (safeArea, isFloating, isTransparent, backgroundColor) => ({
        marginBottom: isFloating ? -topNavHeader - safeArea.top : 0,
        minHeight:
          backgroundColor === 'transparent'
            ? topNavHeader + safeArea.top
            : topNavHeader +
            safeArea.top +
            moderateScale(Platform.OS === 'ios' ? 0 : 40),
        justifyContent: 'center',
        // shadowOffset: { y: 0 },
        // shadowOpacity: isTransparent ? 0 : 0.5,
        // elevation: isTransparent ? 0.01 : 5,
        zIndex: 100,
        paddingTop: moderateScale(20),
        paddingHorizontal: moderateScale(20),
        backgroundColor: theme.colors.white,
        // borderBottomLeftRadius:20,
        // borderBottomRightRadius:20
      }),
      title: (isTransparent, color) => ({
        ...commonStyles.font_14_bold,
        textAlign: 'center',
        color: isTransparent ? 'transparent' : color,
      }),
      backButton: isTransparent => ({
        marginLeft: moderateScale(20),
        backgroundColor: isTransparent ? theme.colors.blackOpacity40 : 'transparent',
        padding: moderateScale(10),
        borderRadius: moderateScale(6),
      }),
      backIcon: (isTransparent, color) => ({
        tintColor: isTransparent ? theme.colors.white : color,
        resizeMode: 'contain',
        height: moderateScale(16),
        width: moderateScale(16),
      }),
      videoStyle: {
        height: '100%',
        width: '100%',
        resizeMode: 'cover',
      },
      pauseBtn: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
      },
      fieldName: {
        borderTopRightRadius: moderateScale(20),
        borderTopLeftRadius: moderateScale(20),
        marginTop: -moderateScale(20),
        backgroundColor: theme.colors.white,
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(26),
        paddingBottom: moderateScale(40),
      },
      textBox: {
        height: moderateScale(2),
        width: moderateScale(30),
        marginVertical: moderateScale(10),
      },
      imageStyle: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.blackOpacity20,
      },
      profileImg: {
        height: moderateScale(45),
        width: moderateScale(45),
        borderRadius: moderateScale(45),
        backgroundColor: theme.colors.blackOpacity10,
        marginRight: moderateScale(10),
      },

      boxView: {
        borderColor: 'grey',
        borderWidth: moderateScale(1),
        height: moderateScale(48),
        width: moderateScale(48),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
      },
      leftText: {
        ...commonStyles.font_28_bold,
        color: theme.colors.black,
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalImage: {
        width: width,
        height: Dimensions.get('window').height * 0.8,
        backgroundColor: 'transparent',
        maxWidth: 1200, // Limit maximum width for better performance
        maxHeight: 1600, // Limit maximum height for better performance
        ...(Platform.OS === 'android' && {
          elevation: 0,
          overflow: 'hidden',
        }),
      },
      closeButton: {
        position: 'absolute',
        top: moderateScale(50),
        right: moderateScale(20),
        zIndex: 1000,
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: theme.colors.darkBlack,
        justifyContent: 'center',
        alignItems: 'center',
      },
      closeButtonText: {
        color: theme.colors.white,
        fontSize: moderateScale(20),
        fontWeight: 'bold',
      },
      modalInstructions: {
        position: 'absolute',
        bottom: moderateScale(50),
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
      },
      instructionText: {
        color: theme.colors.black,
        fontSize: moderateScale(14),
        textAlign: 'center',
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(8),
        borderRadius: moderateScale(20),
      },
      loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.blackOpacity30,
      }

    })
  )
}
